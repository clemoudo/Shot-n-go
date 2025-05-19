from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from app.models.database import Commande, ComShot, Shot, Wallet
from app.firebase import verify_firebase_token
from app.db import SessionLocal
from sqlalchemy.orm import joinedload

router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

class ShotItem(BaseModel):
    shot_id: int
    quantity: int

class CommandeCreate(BaseModel):
    machine_id: int
    shots: List[ShotItem]

@router.get("/api/commandes")
async def get_commandes_by_state(
    state: Optional[str] = Query(None, description="Filtrer par état : 'in progress' ou 'done'"),
    db=Depends(get_db),
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

        return {
            "message": "Commandes enrichies récupérées avec succès.",
            "count": len(commandes_data),
            "commandes": commandes_data
        }

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
        return {
            "message": "Commande créée et payée avec succès.",
            "commande_id": new_commande.id,
            "total_cost": total_cost,
            "credit_restant": wallet.credit
        }

    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de la commande. Erreur SQL : ${e}")
