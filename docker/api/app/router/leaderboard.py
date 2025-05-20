from fastapi import APIRouter, Request, Response, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from firebase_admin import auth
import hashlib
import json
from app.db import SessionLocal
from app.redis_client import redis
from app.models.database import ComShot, Commande

router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.get("/api/leaderboard")
async def get_leaderboard(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    cache_key = "leaderboard:total_shots"
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
        return JSONResponse(content=json.loads(cached_data), headers={"ETag": cached_hash})

    try:
        # Somme des quantités de shots par utilisateur
        result = await db.execute(
            select(Commande.user_id, func.sum(ComShot.quantity).label("total_shots"))
            .join(ComShot, Commande.id == ComShot.commande_id)
            .group_by(Commande.user_id)
            .order_by(func.sum(ComShot.quantity).desc())
        )

        rows = result.all()
        leaderboard = []

        for user_id, total_shots in rows:
            user_name = "Inconnu"
            if user_id:
                try:
                    user_data = auth.get_user(user_id)
                    user_name = user_data.display_name or "Utilisateur sans nom"
                except Exception:
                    pass

            leaderboard.append({
                "user_id": user_id,
                "user_name": user_name,
                "total_shots": float(total_shots)
            })

        response_json = json.dumps(leaderboard)
        response_hash = hashlib.md5(response_json.encode()).hexdigest()

        await redis.set(cache_key, response_json, ex=300)
        await redis.set(cache_hash_key, response_hash, ex=300)

        return JSONResponse(content=leaderboard, headers={"ETag": response_hash})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du leaderboard : {str(e)}")