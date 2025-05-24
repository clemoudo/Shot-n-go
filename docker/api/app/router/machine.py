from fastapi import APIRouter, Depends, Form, HTTPException, Request
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.redis_client import redis
from app.firebase import verify_firebase_token
from app.models.database import Machine
from app.utils.caching import cache_response_with_etag

router = APIRouter()

@router.get("/api/machines")
@cache_response_with_etag(cache_key_prefix="machines_cache")
async def get_machines(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(Machine))
        machines = result.scalars().all()
        data = [{"id": m.id, "name": m.name} for m in machines]

        return {"machines": data}

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
