from datetime import datetime
from fastapi import APIRouter, Form, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.db import get_db
from app.redis_client import redis
from app.firebase import verify_firebase_token
from app.models.database import News
from app.utils.caching import cache_response_with_etag

router = APIRouter()

@router.get("/api/news")
@cache_response_with_etag(cache_key_prefix="news_cache")
async def get_all_news(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(
            select(News).order_by(News.publish_date.desc())
        )
        news_items = result.scalars().all()

        data = [
            {
                "id": n.id,
                "title": n.title,
                "content": n.content,
                "publish_date": n.publish_date.strftime("%Y-%m-%d %H:%M:%S") if n.publish_date else None
            }
            for n in news_items
        ]
        return {"news": data}

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des actualités")


@router.post("/api/news")
async def publish_news(
    title: str = Form(...),
    content: str = Form(...),
    db: AsyncSession = Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    if user_data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")

    if not title or not content:
        raise HTTPException(status_code=400, detail="Le titre et le contenu sont obligatoires")

    news_item = News(
        title=title.strip(),
        content=content.strip(),
        publish_date=datetime.now()
    )

    try:
        db.add(news_item)
        await db.commit()

        # Invalidation du cache
        await redis.delete("news_cache")
        await redis.delete("news_cache_hash")

        return JSONResponse(status_code=201, content={"message": "Actualité publiée avec succès"})

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Erreur lors de la publication de l'actualité")
    
@router.delete("/api/news/{news_id}")
async def delete_news(
    news_id: int,
    db: AsyncSession = Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    if user_data["role"] != "admin":
        raise HTTPException(status_code=403, detail="Seul un administrateur peut supprimer une actu.")

    try:
        result = await db.execute(select(News).where(News.id == news_id))
        news = result.scalar_one_or_none()

        if not news:
            raise HTTPException(status_code=404, detail="Actu introuvable.")

        await db.execute(delete(News).where(News.id == news_id))
        await db.commit()

        # Invalide le cache des news récentes
        await redis.delete("news_cache")
        await redis.delete("news_cache_hash")

        return {"message": f"Actu #{news_id} supprimée avec succès."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression : {str(e)}")