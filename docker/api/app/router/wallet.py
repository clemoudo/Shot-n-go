import hashlib
import json
import firebase_admin
from firebase_admin import auth
from fastapi import APIRouter, Depends, Form, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.models.database import Wallet
from app.redis_client import redis
from app.firebase import verify_firebase_token

router = APIRouter()

@router.get("/api/wallets/credit")
async def get_wallet_credit(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    user_id = user_data.get("uid") # Utiliser .get() pour plus de sécurité
    # La vérification que l'utilisateur est bien celui concerné ou un admin est implicite
    # car verify_firebase_token devrait lever une exception si le token n'est pas valide.
    # Si un admin veut voir le wallet d'un autre, il faudrait une autre route ou un paramètre user_id.
    # Pour cette route, on assume que c'est l'utilisateur lui-même qui demande son crédit.

    if not user_id: # Si l'UID n'est pas dans le token (ce qui ne devrait pas arriver avec un token valide)
        raise HTTPException(status_code=401, detail="UID utilisateur manquant dans le token.")

    # Clés de cache
    cache_key = f"wallet:{user_id}:credit"
    cache_hash_key = f"{cache_key}_hash" # ETag

    # Logique de cache et ETag
    cached_data = await redis.get(cache_key)
    cached_hash = await redis.get(cache_hash_key)

    if isinstance(cached_data, bytes):
        cached_data = cached_data.decode()
    if isinstance(cached_hash, bytes):
        cached_hash = cached_hash.decode()

    client_etag = request.headers.get("if-none-match")

    if cached_data and cached_hash:
        if client_etag == cached_hash:
            return Response(status_code=304) # Not Modified
        return JSONResponse(content={"credit": json.loads(cached_data)}, headers={"ETag": cached_hash})

    # Si pas dans le cache ou ETag ne correspond pas, aller chercher en DB
    try:
        result = await db.execute(select(Wallet).where(Wallet.user_id == user_id))
        wallet = result.scalar_one_or_none()

        if wallet is None:
            # Si pas de wallet, on considère un crédit de 0 et on le met en cache
            credit_json = json.dumps(0.0)
            credit_hash = hashlib.md5(credit_json.encode()).hexdigest()
            await redis.set(cache_key, credit_json, ex=300) # Cache pour 5 minutes
            await redis.set(cache_hash_key, credit_hash, ex=300)
            return JSONResponse(content={"credit": 0.0}, headers={"ETag": credit_hash})

        credit = float(wallet.credit)
        credit_json = json.dumps(credit)
        credit_hash = hashlib.md5(credit_json.encode()).hexdigest()

        # Mettre en cache la valeur et son ETag
        await redis.set(cache_key, credit_json, ex=300)
        await redis.set(cache_hash_key, credit_hash, ex=300)

        return JSONResponse(content={"credit": credit}, headers={"ETag": credit_hash})

    except SQLAlchemyError:
        # Logger l'erreur côté serveur
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération du crédit du wallet.")
    except Exception as e:
        # Logger l'erreur côté serveur
        raise HTTPException(status_code=500, detail=f"Erreur inattendue: {str(e)}")


@router.post("/api/wallets")
async def create_or_add_credit_to_wallet(
    user_email: str = Form(...),
    amount: float = Form(...),
    db: AsyncSession = Depends(get_db), # Spécifier AsyncSession pour la clarté
    user_data: dict = Depends(verify_firebase_token) # Token de l'admin qui fait l'appel
):
    if user_data.get("role") != "admin": # L'appelant doit être admin
        raise HTTPException(status_code=403, detail="Accès refusé. Seuls les administrateurs peuvent effectuer cette action.")

    try:
        # Récupérer l'utilisateur Firebase cible par son email
        try:
            user_record = auth.get_user_by_email(user_email)
        except firebase_admin.auth.UserNotFoundError:
            raise HTTPException(status_code=404, detail=f"Utilisateur Firebase introuvable pour l'e-mail : {user_email}.")
        
        # Vérifier si l'email de l'utilisateur cible est vérifié
        if not user_record.email_verified:
            raise HTTPException(
                status_code=400,
                detail=f"L'email de l'utilisateur '{user_email}' n'est pas vérifié. Opération sur le wallet impossible."
            )

        user_id_cible = user_record.uid # UID de l'utilisateur pour qui on modifie le wallet

        # Vérifier si le wallet existe déjà pour cet user_id_cible
        result = await db.execute(select(Wallet).where(Wallet.user_id == user_id_cible))
        wallet = result.scalar_one_or_none()

        # Clés de cache à invalider pour l'utilisateur cible
        cache_key_credit_cible = f"wallet:{user_id_cible}:credit"
        cache_hash_key_credit_cible = f"{cache_key_credit_cible}_hash"

        if wallet:
            wallet.credit += amount
            if wallet.user_email != user_record.email: # Mettre à jour l'email si changé dans Firebase
                 wallet.user_email = user_record.email
            message = f"{amount} crédit(s) ajouté(s) avec succès au wallet de {user_record.email}."
        else:
            wallet = Wallet(user_id=user_id_cible, user_email=user_record.email, credit=amount)
            db.add(wallet)
            message = f"Wallet créé avec succès pour {user_record.email} avec {amount} crédit(s)."
        
        await db.commit()
        await db.refresh(wallet)

        # Invalider le cache pour l'utilisateur cible
        if redis: # Assurez-vous que redis est disponible
            await redis.delete(cache_key_credit_cible)
            await redis.delete(cache_hash_key_credit_cible)

        return {
            "message": message,
            "wallet": {
                "id": wallet.id,
                "user_id": wallet.user_id,
                "user_email": wallet.user_email,
                "credit": wallet.credit
            }
        }

    except SQLAlchemyError:
        await db.rollback()
        # Logger l'erreur
        raise HTTPException(status_code=500, detail="Erreur interne du serveur lors de l'opération sur le wallet.")
    except Exception as e:
        # Logger l'erreur
        await db.rollback() # Tentative de rollback si une erreur inattendue survient après le début d'une transaction
        raise HTTPException(status_code=500, detail=f"Erreur inattendue: {str(e)}")


@router.delete("/api/wallets/{user_email}")
async def delete_wallet(
    user_email: str, # Email de l'utilisateur dont le wallet doit être supprimé
    db: AsyncSession = Depends(get_db),
    user_data: dict = Depends(verify_firebase_token) # Token de l'admin
):
    if user_data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé. Seuls les administrateurs peuvent effectuer cette action.")

    try:
        # Option 1: Supprimer par email (comme actuellement)
        # Inconvénient: si l'email change dans Firebase mais pas dans votre DB, vous ciblez le mauvais user localement.
        # result = await db.execute(select(Wallet).where(Wallet.user_email == user_email))
        # wallet_to_delete = result.scalar_one_or_none()

        # Option 2 (plus robuste): Récupérer l'UID Firebase, puis supprimer par UID
        try:
            user_record_cible = auth.get_user_by_email(user_email)
        except firebase_admin.auth.UserNotFoundError:
            raise HTTPException(status_code=404, detail=f"Utilisateur Firebase introuvable pour l'e-mail : {user_email}, suppression du wallet impossible.")
        
        user_id_cible = user_record_cible.uid
        result = await db.execute(select(Wallet).where(Wallet.user_id == user_id_cible))
        wallet_to_delete = result.scalar_one_or_none()


        if not wallet_to_delete:
            raise HTTPException(status_code=404, detail=f"Wallet non trouvé pour l'utilisateur avec l'email '{user_email}' (UID: {user_id_cible}).")

        # Avant de supprimer, récupérer l'UID pour invalider le cache
        # user_id_of_deleted_wallet = wallet_to_delete.user_id (c'est user_id_cible)

        await db.delete(wallet_to_delete)
        await db.commit()

        # Invalider le cache pour l'utilisateur dont le wallet a été supprimé
        cache_key_credit_cible = f"wallet:{user_id_cible}:credit"
        cache_hash_key_credit_cible = f"{cache_key_credit_cible}_hash"
        if redis:
            await redis.delete(cache_key_credit_cible)
            await redis.delete(cache_hash_key_credit_cible)

        return {"message": f"Wallet pour l'utilisateur '{user_email}' (UID: {user_id_cible}) supprimé avec succès."}

    except SQLAlchemyError:
        await db.rollback()
        # Logger l'erreur
        raise HTTPException(status_code=500, detail="Erreur interne du serveur lors de la suppression du wallet.")
    except Exception as e:
        # Logger l'erreur
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur inattendue: {str(e)}")