from typing import List, Optional
import json
from pydantic import BaseModel
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from firebase_admin import auth

from app.db import get_db
from app.redis_client import redis
from app.firebase import verify_firebase_token, db_firestore
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
    db: AsyncSession = Depends(get_db),
    user_data: dict = Depends(verify_firebase_token)
):
    try:
        user_id = user_data["uid"]

        if not commande_data.shots:
            raise HTTPException(status_code=400, detail="La commande ne contient aucun shot.")

        result_wallet = await db.execute(select(Wallet).where(Wallet.user_id == user_id))
        wallet = result_wallet.scalar_one_or_none()
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet non trouvé.")

        shot_ids = [shot.shot_id for shot in commande_data.shots]
        result_shots_db = await db.execute(select(Shot.id, Shot.price, Shot.name).where(Shot.id.in_(shot_ids)))
        shots_details_db = {row.id: {"price": row.price, "name": row.name} for row in result_shots_db.fetchall()}

        total_cost = 0
        # Changement ici : nous allons construire la chaîne HTML des items directement
        items_html_string = ""
        for shot_item_data in commande_data.shots:
            if shot_item_data.shot_id not in shots_details_db:
                raise HTTPException(status_code=400, detail=f"Shot ID {shot_item_data.shot_id} invalide.")
            
            shot_info = shots_details_db[shot_item_data.shot_id]
            item_cost = shot_item_data.quantity * shot_info["price"]
            total_cost += item_cost
            items_html_string += f"""
            <tr>
              <td>{shot_info["name"]}</td>
              <td>{shot_item_data.quantity}</td>
              <td>{float(shot_info["price"]):.2f} €</td>
              <td>{float(item_cost):.2f} €</td>
            </tr>
            """

        if wallet.credit < total_cost:
            raise HTTPException(status_code=400, detail="Solde insuffisant dans le wallet.")

        wallet.credit -= total_cost
        db.add(wallet)

        current_time = datetime.now()
        new_commande = Commande(
            wallet_id=wallet.id,
            machine_id=commande_data.machine_id,
            user_id=user_id,
            order_date=current_time,
            state="in progress"
        )
        db.add(new_commande)
        await db.flush()

        for shot_item_data in commande_data.shots:
            new_comshot = ComShot(
                commande_id=new_commande.id,
                shot_id=shot_item_data.shot_id,
                quantity=shot_item_data.quantity
            )
            db.add(new_comshot)

        await db.commit()

        # ---- Envoi de l'e-mail direct (sans template Firestore) ----
        try:
            user_record = auth.get_user(user_id)
            user_email_to_send = user_record.email
            user_name_to_send = user_record.display_name or user_email_to_send.split('@')[0]

            order_id_str = str(new_commande.id)
            order_date_str = current_time.strftime("%d/%m/%Y à %H:%M:%S")
            total_cost_str = f"{float(total_cost):.2f}" # Formatage avec 2 décimales

            # Construire le HTML complet de l'e-mail
            full_html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; color: #333; }}
                .container {{ border: 1px solid #ddd; padding: 20px; border-radius: 5px; max-width: 600px; margin: auto; }}
                h1 {{ color: #5D4037; }}
                table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; }}
                th, td {{ border: 1px solid #eee; padding: 8px; text-align: left; }}
                th {{ background-color: #f9f9f9; }}
                .total {{ font-weight: bold; }}
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Merci pour votre commande, {user_name_to_send} !</h1>
                <p>Votre commande <strong>#{order_id_str}</strong> du {order_date_str} a bien été enregistrée et est en cours de préparation.</p>
                
                <h2>Récapitulatif de la commande :</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Quantité</th>
                      <th>Prix Unitaire</th>
                      <th>Sous-total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items_html_string}
                  </tbody>
                </table>
                
                <p class="total">Total de la commande : {total_cost_str} €</p>
                
                <p>Vous pouvez suivre l'état de votre commande sur notre site.</p>
                <p>Merci de votre confiance,</p>
                <p>L'équipe Shot N Go</p>
              </div>
            </body>
            </html>
            """

            mail_doc_data = {
                "to": [user_email_to_send],
                "message": { # Notez que c'est "message" et non "template"
                    "subject": f"Confirmation de votre commande Shot N Go #{order_id_str}",
                    "html": full_html_content
                    # Vous pouvez aussi ajouter un champ "text": "Version texte de l'email..."
                }
            }
            
            print("---- DEBUG MAIL DOC DATA (DIRECT HTML) ----")
            print(json.dumps(mail_doc_data, indent=2, ensure_ascii=False)) # ensure_ascii pour les accents
            print("-------------------------------------------")

            db_firestore.collection("mail").add(mail_doc_data)
            print(f"Document (HTML direct) ajouté à la collection 'mail' pour la commande {new_commande.id}")

        except Exception as e_mail:
            print(f"Erreur lors de la préparation ou de l'envoi du document pour l'e-mail (HTML direct) : {e_mail}")
        # -------------------------------------------------

        # ... (Invalidation du cache Redis, etc. restent inchangés) ...
        await redis.delete("commandes:state_in progress")
        await redis.delete("commandes:state_in progress_hash")
        await redis.delete(f"wallet_credit:{user_id}")
        await redis.delete(f"wallet_credit:{user_id}_hash")
        await redis.delete(f"machine_queue:{commande_data.machine_id}")
        await redis.delete(f"machine_queue:{commande_data.machine_id}_hash")

        await calculate_and_cache_machine_queue(commande_data.machine_id, db)

        return {
            "message": "Commande créée et payée avec succès. Email de confirmation (direct HTML) en cours d'envoi.",
            "commande_id": new_commande.id,
            "total_cost": float(total_cost),
            "credit_restant": float(wallet.credit)
        }

    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur SQL : {e}")
    except Exception as e_glob:
        await db.rollback()
        print(f"Erreur globale inattendue: {e_glob}")
        raise HTTPException(status_code=500, detail=f"Erreur inattendue lors de la création de la commande.")

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
    