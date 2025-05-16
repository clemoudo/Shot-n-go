from fastapi import APIRouter, Depends, Form, HTTPException, Request
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from app.db import SessionLocal
from app.models.database import Shot
from app.redis_client import redis
from app.firebase import verify_firebase_token
from fastapi.responses import JSONResponse, Response
import json, hashlib

router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.get("/api/shots")
async def get_shots(request: Request, db=Depends(get_db)):
    cache_key = "shots_cache"

    cached_data = await redis.get(cache_key)
    cached_hash = await redis.get(f"{cache_key}_hash")

    if isinstance(cached_data, bytes):
        cached_data = cached_data.decode()
    if isinstance(cached_hash, bytes):
        cached_hash = cached_hash.decode()

    client_etag = request.headers.get("if-none-match")

    if cached_data and cached_hash:
        if client_etag == cached_hash:
            return Response(status_code=304)
        return JSONResponse(content={"shots": json.loads(cached_data)}, headers={"ETag": cached_hash})

    result = await db.execute(select(Shot))
    shots = result.scalars().all()
    data = [{"id": s.id, "name": s.name, "price": s.price, "image": s.image, "category": s.category} for s in shots]

    shots_json = json.dumps(data)
    shots_hash = hashlib.md5(shots_json.encode()).hexdigest()

    await redis.set(cache_key, shots_json, ex=300)
    await redis.set(f"{cache_key}_hash", shots_hash, ex=300)

    return JSONResponse(content={"shots": data}, headers={"ETag": shots_hash})

@router.post("/api/shots")
async def add_shot(
    name: str = Form(...),
    price: float = Form(...),
    image: str = Form(...),
    category: str = Form(...),
    db=Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    if user_data["role"] != "admin":
        raise HTTPException(403, detail="Admin seulement")

    if not (0 <= price <= 100):
        raise HTTPException(400, detail="Le prix doit être entre 0 et 100 €")

    new_shot = Shot(name=name, price=price, image=image, category=category)
    try:
        db.add(new_shot)
        await db.commit()
        await db.refresh(new_shot)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(500, detail="Erreur lors de l'ajout")

    await redis.delete("shots_cache")
    await redis.delete("shots_cache_hash")

    return {
        "message": "Shot ajouté",
        "shot": {
            "id": new_shot.id,
            "name": new_shot.name,
            "price": new_shot.price,
            "category": new_shot.category,
            "image": new_shot.image
        }
    }

@router.delete("/api/shots/{shot_id}")
async def delete_shot(
    shot_id: int,
    db=Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    if user_data["role"] != "admin":
        raise HTTPException(403, detail="Admin seulement")
    
    try:
        result = await db.execute(select(Shot).where(Shot.id == shot_id))
        shot = result.scalar_one_or_none()

        if not shot:
            raise HTTPException(status_code=404, detail="Shot non trouvé")

        await db.delete(shot)
        await db.commit()

        await redis.delete("shots_cache")
        await redis.delete("shots_cache_hash")

        return {"message": f"Shot {shot_id} supprimé et cache invalidé"}

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")
    