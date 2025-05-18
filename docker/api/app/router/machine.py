from fastapi import APIRouter, Depends, Form, HTTPException
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from app.db import SessionLocal
from app.models.database import Machine
from app.redis_client import redis
from app.firebase import verify_firebase_token
import json

router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.get("/api/machines")
async def get_machines(db=Depends(get_db)):
    cache_key = "machines_cache"

    cached_data = await redis.get(cache_key)
    if cached_data:
        if isinstance(cached_data, bytes):
            cached_data = cached_data.decode()
        return json.loads(cached_data)

    try:
        result = await db.execute(select(Machine))
        machines = result.scalars().all()
        data = [{"id": m.id, "name": m.name} for m in machines]

        await redis.set(cache_key, json.dumps(data), ex=60)

        return data

    except SQLAlchemyError:
        raise HTTPException(500, detail="Erreur lors de la récupération des machines")

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

        return {"message": f"Machine {machine_id} supprimée"}

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(500, detail="Erreur lors de la suppression")
