import firebase_admin
from firebase_admin import auth
from fastapi import APIRouter, Depends, Form, HTTPException, Request
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.redis_client import redis
from app.firebase import verify_firebase_token
from app.models.database import Wallet
from app.utils.caching import cache_response_with_etag

router = APIRouter()

@router.get("/api/wallets/credit")
@cache_response_with_etag(
    cache_key_prefix="wallet_credit",
    user_id_from_token_key="uid"
)
async def get_wallet_credit(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    user_id = user_data.get("uid")
    if not user_id: # Si l'UID n'est pas dans le token (ce qui ne devrait pas arriver avec un token valide)
        raise HTTPException(status_code=401, detail="UID utilisateur manquant dans le token.")

    try:
        result = await db.execute(select(Wallet).where(Wallet.user_id == user_id))
        wallet = result.scalar_one_or_none()

        if wallet is None:
            return {"credit": 0.0}

        credit = float(wallet.credit)
        return {"credit": credit}

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

        # Invalidation du cache pour l'utilisateur cible
        cache_key_credit_cible = f"wallet_credit:{user_id_cible}" # Doit correspondre à la construction de clé du décorateur
        cache_hash_key_credit_cible = f"{cache_key_credit_cible}_hash"
        
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

        # Invalidation du cache pour l'utilisateur dont le wallet a été supprimé
        cache_key_credit_cible = f"wallet_credit:{user_id_cible}"
        cache_hash_key_credit_cible = f"{cache_key_credit_cible}_hash"

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