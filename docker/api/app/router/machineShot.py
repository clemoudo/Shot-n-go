from fastapi import APIRouter, Depends, Form, HTTPException, Request
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.redis_client import redis
from app.firebase import verify_firebase_token
from app.models.database import Machine, Shot, MachineShot
from app.utils.caching import cache_response_with_etag

router = APIRouter()

@router.get("/api/machines/{machine_id}/shots")
@cache_response_with_etag(
    cache_key_prefix="machine_shots",
    resource_id_param="machine_id"
)
async def get_shots_of_machine(
    request: Request,
    machine_id: int, 
    db: AsyncSession = Depends(get_db)
):
    # Vérifie que la machine existe
    machine = (await db.execute(select(Machine).where(Machine.id == machine_id))).scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine non trouvée")

    try:
        result = await db.execute(
            select(Shot, MachineShot.stock)
            .join(MachineShot, Shot.id == MachineShot.shot_id)
            .where(MachineShot.machine_id == machine_id)
        )

        shots = result.all()

        data = [
            {
                "id": shot.id,
                "name": shot.name,
                "price": shot.price,
                "image": shot.image,
                "category": shot.category,
                "stock": stock
            }
            for shot, stock in shots
        ]
        return {"shots": data}

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des shots")
    
@router.post("/api/machines/{machine_id}/shots/{shot_id}")
async def add_shot_to_machine(
    machine_id: int,
    shot_id: int,
    stock: float = Form(...),
    db=Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    if user_data["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin seulement")

    try:
        # Vérifie si la machine et le shot existent
        machine = (await db.execute(select(Machine).where(Machine.id == machine_id))).scalar_one_or_none()
        shot = (await db.execute(select(Shot).where(Shot.id == shot_id))).scalar_one_or_none()

        if not machine or not shot:
            raise HTTPException(404, detail="Machine ou Shot non trouvé")

        # Vérifie si la relation existe déjà
        existing = (await db.execute(
            select(MachineShot).where(
                MachineShot.machine_id == machine_id,
                MachineShot.shot_id == shot_id
            )
        )).scalar_one_or_none()

        if existing:
            raise HTTPException(400, detail="Ce shot est déjà associé à cette machine")

        # Création de la relation avec stock
        new_link = MachineShot(machine_id=machine_id, shot_id=shot_id, stock=stock)
        db.add(new_link)
        await db.commit()

        await redis.delete(f"machine_shots:{machine_id}")
        await redis.delete(f"machine_shots:{machine_id}_hash")
        return {"message": f"Shot {shot_id} ajouté à la machine {machine_id} avec un stock de {stock}"}

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(500, detail="Erreur lors de l'association")

@router.delete("/api/machines/{machine_id}/shots/{shot_id}")
async def remove_shot_from_machine(
    machine_id: int,
    shot_id: int,
    db=Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    if user_data["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin seulement")

    try:
        link = (await db.execute(
            select(MachineShot).where(
                MachineShot.machine_id == machine_id,
                MachineShot.shot_id == shot_id
            )
        )).scalar_one_or_none()

        if not link:
            raise HTTPException(404, detail="Cette association n'existe pas")

        await db.delete(link)
        await db.commit()
        
        await redis.delete(f"machine_shots:{machine_id}")
        await redis.delete(f"machine_shots:{machine_id}_hash")

        return {"message": f"Shot {shot_id} retiré de la machine {machine_id}"}

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(500, detail="Erreur lors de la suppression de l'association")
