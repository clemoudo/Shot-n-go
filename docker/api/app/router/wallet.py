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
    user_id = user_data["uid"]
    if not user_id and user_data["role"] != "admin":
        raise HTTPException(status_code=403, detail="Accès non autorisé")

    # Clés de cache spécifiques à l’utilisateur
    cache_key = f"wallet:{user_id}:credit"
    cache_hash_key = f"{cache_key}_hash"

    cached_data = await redis.get(cache_key)
    cached_hash = await redis.get(cache_hash_key)

    if isinstance(cached_data, bytes):
        cached_data = cached_data.decode()
    if isinstance(cached_hash, bytes):
        cached_hash = cached_hash.decode()

    client_etag = request.headers.get("if-none-match")

    if cached_data and cached_hash:
        if client_etag == cached_hash:
            return Response(status_code=304)
        return JSONResponse(content={"credit": json.loads(cached_data)}, headers={"ETag": cached_hash})

    try:
        result = await db.execute(select(Wallet).where(Wallet.user_id == user_id))
        wallet = result.scalar_one_or_none()

        if wallet is None:
            return JSONResponse(content={"credit": 0.0})

        credit = float(wallet.credit)  # Assure que c’est JSON-serializable
        credit_json = json.dumps(credit)
        credit_hash = hashlib.md5(credit_json.encode()).hexdigest()

        await redis.set(cache_key, credit_json, ex=300)
        await redis.set(cache_hash_key, credit_hash, ex=300)

        return JSONResponse(content={"credit": credit}, headers={"ETag": credit_hash})

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération du crédit")

@router.post("/api/wallets")
async def create_or_add_credit_to_wallet(
    user_email: str = Form(...),
    amount: float = Form(...),
    db=Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    if user_data["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin seulement")

    try:
        # Récupérer l'uid Firebase à partir de l'email
        user_record = auth.get_user_by_email(user_email)
        user_id = user_record.uid

        # Vérifier si le wallet existe déjà
        result = await db.execute(select(Wallet).where(Wallet.user_id == user_id))
        wallet = result.scalar_one_or_none()

        cache_key = f"wallet:{user_id}:credit"
        cache_hash_key = f"{cache_key}_hash"

        if wallet:
            # Ajouter le crédit si wallet existe
            wallet.credit += amount
            await db.commit()
            await db.refresh(wallet)

            await redis.delete(cache_key)
            await redis.delete(cache_hash_key)

            return {
                "message": f"{amount} crédit(s) ajouté(s) au wallet existant.",
                "wallet": {
                    "id": wallet.id,
                    "user_id": wallet.user_id,
                    "user_email": wallet.user_email,
                    "credit": wallet.credit
                }
            }
        else:
            # Créer un nouveau wallet
            new_wallet = Wallet(user_id=user_id, user_email=user_email, credit=amount)
            db.add(new_wallet)
            await db.commit()
            await db.refresh(new_wallet)
            return {
                "message": f"Wallet créé avec {amount} crédit(s).",
                "wallet": {
                    "id": new_wallet.id,
                    "user_id": new_wallet.user_id,
                    "user_email": new_wallet.user_email,
                    "credit": new_wallet.credit
                }
            }

    except firebase_admin.auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail="Utilisateur Firebase introuvable pour cet e-mail.")
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Erreur lors de l'opération sur le wallet.")

@router.delete("/api/wallets/{user_email}")
async def delete_wallet(
    user_email: str,
    db=Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    if user_data["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin seulement")

    try:
        # Vérifie si le wallet existe
        result = await db.execute(select(Wallet).where(Wallet.user_email == user_email))
        wallet = result.scalar_one_or_none()

        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet non trouvé.")

        await db.delete(wallet)
        await db.commit()

        return {"message": f"Wallet correspondant à \"{user_email}\" supprimé avec succès."}

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression du wallet")
    