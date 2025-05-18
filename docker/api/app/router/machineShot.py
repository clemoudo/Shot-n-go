import hashlib
import json
from fastapi import APIRouter, Depends, Form, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from app.db import SessionLocal
from app.models.database import Machine, Shot, MachineShot
from app.redis_client import redis
from app.firebase import verify_firebase_token

router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.get("/api/machines/{machine_id}/shots")
async def get_shots_of_machine(machine_id: int, request: Request, db=Depends(get_db)):
    cache_key = f"machine:{machine_id}:shots"
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
        return JSONResponse(content={"shots": json.loads(cached_data)}, headers={"ETag": cached_hash})

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

        # Mise en cache
        data_json = json.dumps(data)
        data_hash = hashlib.md5(data_json.encode()).hexdigest()
        await redis.set(cache_key, data_json, ex=300)
        await redis.set(cache_hash_key, data_hash, ex=300)

        return JSONResponse(content={"shots": data}, headers={"ETag": data_hash})

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

        await redis.delete(f"machine:{machine_id}:shots")
        await redis.delete(f"machine:{machine_id}:shots_hash")
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
        
        await redis.delete(f"machine:{machine_id}:shots")
        await redis.delete(f"machine:{machine_id}:shots_hash")

        return {"message": f"Shot {shot_id} retiré de la machine {machine_id}"}

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(500, detail="Erreur lors de la suppression de l'association")
