import hashlib
import json
from fastapi import APIRouter, Form, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app.models.database import News
from app.db import get_db
from app.redis_client import redis
from app.firebase import verify_firebase_token

router = APIRouter()

@router.get("/api/news")
async def get_all_news(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    cache_key = "news_cache"
    cache_hash_key = "news_cache_hash"

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
        return JSONResponse(content={"news": json.loads(cached_data)}, headers={"ETag": cached_hash})

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

        news_json = json.dumps(data)
        news_hash = hashlib.md5(news_json.encode()).hexdigest()

        await redis.set(cache_key, news_json, ex=300)
        await redis.set(cache_hash_key, news_hash, ex=300)

        return JSONResponse(content={"news": data}, headers={"ETag": news_hash})

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