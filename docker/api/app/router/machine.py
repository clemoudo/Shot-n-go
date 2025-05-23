import hashlib
from fastapi import APIRouter, Depends, Form, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from app.db import get_db
from app.models.database import Machine
from app.redis_client import redis
from app.firebase import verify_firebase_token
import json
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

@router.get("/api/machines")
async def get_machines(
    request: Request, 
    db: AsyncSession = Depends(get_db)
):
    cache_key = "machines_cache"
    cache_hash_key = f"{cache_key}_hash"

    # Lire cache existant
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
        return JSONResponse(content={"machines": json.loads(cached_data)}, headers={"ETag": cached_hash})

    try:
        result = await db.execute(select(Machine))
        machines = result.scalars().all()
        data = [{"id": m.id, "name": m.name} for m in machines]

        data_json = json.dumps(data)
        data_hash = hashlib.md5(data_json.encode()).hexdigest()

        await redis.set(cache_key, data_json, ex=300)
        await redis.set(cache_hash_key, data_hash, ex=300)

        return JSONResponse(content={"machines": data}, headers={"ETag": data_hash})

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des machines")

@router.post("/api/machines")
async def add_machine(
    name: str = Form(...),
    db=Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    if user_data["role"] != "admin":
        raise HTTPException(403, detail="Admin seulement")

    new_machine = Machine(name=name)

    try:
        db.add(new_machine)
        await db.commit()
        await db.refresh(new_machine)
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(500, detail="Erreur lors de l'ajout de la machine")

    await redis.delete("machines_cache")
    await redis.delete("machines_cache_hash")

    return {
        "message": "Machine ajoutée",
        "machine": {
            "id": new_machine.id,
            "name": new_machine.name
        }
    }

@router.delete("/api/machines/{machine_id}")
async def delete_machine(
    machine_id: int,
    db=Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    if user_data["role"] != "admin":
        raise HTTPException(403, detail="Admin seulement")

    try:
        result = await db.execute(select(Machine).where(Machine.id == machine_id))
        machine = result.scalar_one_or_none()

        if not machine:
            raise HTTPException(status_code=404, detail="Machine non trouvée")

        await db.delete(machine)
        await db.commit()

        await redis.delete("machines_cache")
        await redis.delete("machines_cache_hash")

        return {"message": f"Machine {machine_id} supprimée"}

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(500, detail="Erreur lors de la suppression")
