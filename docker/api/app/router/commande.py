from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.redis_client import redis
from app.firebase import verify_firebase_token
from app.models.database import Commande, ComShot, Shot, Wallet
from app.utils.caching import cache_response_with_etag, calculate_and_cache_leaderboard, calculate_and_cache_machine_queue

router = APIRouter()

class ShotItem(BaseModel):
    shot_id: int
    quantity: int

class CommandeCreate(BaseModel):
    machine_id: int
    shots: List[ShotItem]

@router.get("/api/commandes")
@cache_response_with_etag(
    cache_key_prefix="commandes", 
    query_params_to_include=["state"]
)
async def get_commandes_by_state(
    request: Request,
    state: Optional[str] = Query(None, description="Filtrer par état : 'in progress' ou 'done'"),
    db: AsyncSession = Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    if user_data["role"] != "admin":
        raise HTTPException(403, detail="Admin seulement")

    try:
        query = select(Commande).options(
            joinedload(Commande.wallet),
            joinedload(Commande.machine)
        )

        if state:
            if state not in ("in progress", "done"):
                raise HTTPException(status_code=400, detail="État invalide. Utiliser 'in progress' ou 'done'.")
            query = query.where(Commande.state == state)

        result = await db.execute(query)
        commandes = result.scalars().all()

        commandes_data = []
        for cmd in commandes:
            commandes_data.append({
                "commande_id": cmd.id,
                "machine": f"{cmd.machine.name} (#{cmd.machine.id})" if cmd.machine else "Machine inconnue",
                "user_email": cmd.wallet.user_email if cmd.wallet else "Inconnu",
                "order_date": cmd.order_date.strftime("%Y-%m-%d %H:%M:%S") if cmd.order_date else "N/A",
                "state": cmd.state
            })

        response = {
            "message": "Commandes enrichies récupérées avec succès.",
            "count": len(commandes_data),
            "commandes": commandes_data
        }
        return response

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des commandes.")

@router.post("/api/commandes")
async def create_commande(
    commande_data: CommandeCreate,
    db=Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):  
    try:
        user_id = user_data["uid"]

        if not commande_data.shots:
            raise HTTPException(status_code=400, detail="La commande ne contient aucun shot.")

        # Récupération du wallet
        result = await db.execute(select(Wallet).where(Wallet.user_id == user_id))
        wallet = result.scalar_one_or_none()
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet non trouvé.")

        # Récupération des prix des shots
        shot_ids = [shot.shot_id for shot in commande_data.shots]
        result = await db.execute(select(Shot.id, Shot.price).where(Shot.id.in_(shot_ids)))
        shot_prices = {row.id: row.price for row in result.fetchall()}

        # Calcul du coût total
        total_cost = 0
        for shot in commande_data.shots:
            if shot.shot_id not in shot_prices:
                raise HTTPException(status_code=400, detail=f"Shot ID {shot.shot_id} invalide.")
            total_cost += shot.quantity * shot_prices[shot.shot_id]

        # Vérification du crédit
        if wallet.credit < total_cost:
            raise HTTPException(status_code=400, detail="Solde insuffisant dans le wallet.")

        # Débit du wallet
        wallet.credit -= total_cost
        db.add(wallet)

        # Création de la commande
        new_commande = Commande(
            wallet_id=wallet.id,
            machine_id=commande_data.machine_id,
            user_id=user_id,
            order_date=datetime.now(),
            state="in progress"
        )
        db.add(new_commande)
        await db.flush()

        # Ajout des entrées ComShot
        for shot in commande_data.shots:
            new_comshot = ComShot(
                commande_id=new_commande.id,
                shot_id=shot.shot_id,
                quantity=shot.quantity
            )
            db.add(new_comshot)

        await db.commit()

        await redis.delete("commandes:state_in progress")
        await redis.delete("commandes:state_in progress_hash")
        await redis.delete(f"wallet_credit:{user_id}")
        await redis.delete(f"wallet_credit:{user_id}_hash")
        await redis.delete(f"machine_queue:{commande_data.machine_id}")
        await redis.delete(f"machine_queue:{commande_data.machine_id}_hash")

        await calculate_and_cache_machine_queue(commande_data.machine_id, db)

        return {
            "message": "Commande créée et payée avec succès.",
            "commande_id": new_commande.id,
            "total_cost": total_cost,
            "credit_restant": wallet.credit
        }

    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de la commande. Erreur SQL : ${e}")

@router.patch("/api/commandes/{commande_id}/{newState}")
async def mark_commande_done(
    commande_id: int = Path(..., description="ID de la commande à changer d'état"),
    newState: str = Path(..., description="Nouvel état 'in progress' ou 'done'"),
    db=Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    if user_data["role"] != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs.")

    try:
        result = await db.execute(select(Commande).where(Commande.id == commande_id))
        commande = result.scalar_one_or_none()

        if not commande:
            raise HTTPException(status_code=404, detail="Commande non trouvée.")

        if commande.state == newState:
            return {"message": f"Commande déjà marquée comme '{newState}'."}

        commande.state = newState
        await db.commit()

        await redis.delete("commandes:state_in progress")
        await redis.delete("commandes:state_in progress_hash")
        await redis.delete("commandes:state_done")
        await redis.delete("commandes:state_done_hash")
        await redis.delete("leaderboard_shots")
        await redis.delete("leaderboard_shots_hash")
        await redis.delete(f"machine_queue:{commande.machine_id}")
        await redis.delete(f"machine_queue:{commande.machine_id}_hash")

        # Si la commande passe à "done", recalculer et mettre en cache le leaderboard
        if newState == "done":
            await calculate_and_cache_leaderboard(db) # Passe la session db
            await calculate_and_cache_machine_queue(commande.machine_id, db)
        
        return {
            "message": "Commande mise à jour avec succès.",
            "commande_id": commande.id,
            "nouvel_etat": commande.state
        }

    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour de la commande.")
    