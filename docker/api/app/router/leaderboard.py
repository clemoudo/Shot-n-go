from firebase_admin import auth
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.database import ComShot, Commande
from app.utils.caching import cache_response_with_etag

router = APIRouter()

@router.get("/api/leaderboard")
@cache_response_with_etag(cache_key_prefix="leaderboard_shots", ttl=3600)
async def get_leaderboard(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Somme des quantités de shots par utilisateur
        result = await db.execute(
            select(Commande.user_id, func.sum(ComShot.quantity).label("total_shots"))
            .join(ComShot, Commande.id == ComShot.commande_id)
            .where(Commande.state == "done")
            .group_by(Commande.user_id)
            .order_by(func.sum(ComShot.quantity).desc())
        )

        rows = result.all()
        leaderboard = []

        for user_id, total_shots in rows:
            user_name = "Inconnu"
            if user_id:
                try:
                    user_data = auth.get_user(user_id)
                    user_name = user_data.display_name or "Utilisateur sans nom"
                except Exception:
                    pass

            leaderboard.append({
                "user_id": user_id,
                "user_name": user_name,
                "total_shots": float(total_shots)
            })
        return leaderboard

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du leaderboard : {str(e)}")