import hashlib
import json
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import Commande
from typing import List
from app.db import SessionLocal
from firebase_admin import auth
from app.redis_client import redis

router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.get("/api/machines/{machine_id}/queue")
async def get_machine_queue(
    request: Request,
    machine_id: int,
    db: AsyncSession = Depends(get_db)
):
    cache_key = f"machine:{machine_id}:queue"
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
        result = await db.execute(
            select(Commande)
            .where(
                Commande.machine_id == machine_id,
                Commande.state == "in progress"
            )
            .order_by(Commande.order_date)
        )

        commandes: List[Commande] = result.scalars().all()
        queue = []

        for cmd in commandes:
            user_name = "Inconnu"
            if cmd.user_id:
                try:
                    user_data = auth.get_user(cmd.user_id)
                    user_name = user_data.display_name or "Utilisateur sans nom"
                except Exception:
                    pass

            queue.append({
                "commande_id": cmd.id,
                "user_name": user_name,
                "order_date": cmd.order_date.strftime("%Y-%m-%d %H:%M:%S")
            })

        response_json = json.dumps(queue)
        response_hash = hashlib.md5(response_json.encode()).hexdigest()

        # Cache en Redis
        await redis.set(cache_key, response_json, ex=300)
        await redis.set(cache_hash_key, response_hash, ex=300)

        return JSONResponse(content=queue, headers={"ETag": response_hash})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération de la file d'attente : {str(e)}")