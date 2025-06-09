from firebase_admin import auth
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.database import Commande
from app.utils.caching import cache_response_with_etag

router = APIRouter()

@router.get("/machines/{machine_id}/queue")
@cache_response_with_etag(
    cache_key_prefix="machine_queue",
    resource_id_param="machine_id"
)
async def get_machine_queue(
    request: Request,
    machine_id: int,
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(
            select(Commande)
            .where(
                Commande.machine_id == machine_id,
                Commande.state == "in progress"
            )
            .order_by(Commande.order_date)
        )

        commandes: List[Commande] = result.scalars().all()
        queue = []

        for cmd in commandes:
            user_name = "Inconnu"
            if cmd.user_id:
                try:
                    user_data = auth.get_user(cmd.user_id)
                    user_name = user_data.display_name or "Utilisateur sans nom"
                except Exception:
                    pass

            queue.append({
                "commande_id": cmd.id,
                "user_name": user_name,
                "order_date": cmd.order_date.strftime("%Y-%m-%d %H:%M:%S")
            })
        return queue

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération de la file d'attente : {str(e)}")