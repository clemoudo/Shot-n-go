from fastapi import APIRouter, Depends, Form, HTTPException, Request
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.redis_client import redis
from app.firebase import verify_firebase_token
from app.models.database import Shot
from app.utils.caching import cache_response_with_etag

router = APIRouter()

@router.get("/shots")
@cache_response_with_etag(cache_key_prefix="shots_cache")
async def get_shots(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Shot))
    shots = result.scalars().all()
    data = [{"id": s.id, "name": s.name, "price": s.price, "image": s.image, "category": s.category} for s in shots]

    return {"shots": data}

@router.post("/shots")
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

@router.delete("/shots/{shot_id}")
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
    