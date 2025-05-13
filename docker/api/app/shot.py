from fastapi import APIRouter, Form, Depends, HTTPException, Request, Query
from fastapi.responses import JSONResponse, Response
from app.firebase import db
from typing import List
from app.models import Shot, Machine
from google.cloud import firestore
from app.redis_client import redis
import json
import logging
import time
from app.firebase import verify_firebase_token
import hashlib

logger = logging.getLogger("shot_api")

router = APIRouter()
collection_shots = db.collection("Shots")
machines_collection = db.collection("Machine")
users_collection = db.collection("User")

@router.post("/api/shots")
async def add_shot(
    name: str = Form(...),
    price: str = Form(...),
    stock: str = Form(...),
    image: str = Form(...),
    category: str = Form(...),
    user_data: dict = Depends(verify_firebase_token)
):
    if user_data["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied: admin only")

    # Vérif des float
    try:
        price_float = float(price)
        stock_float = float(stock)
    except ValueError:
        raise HTTPException(status_code=400, detail="Prix ou stock invalide (doivent être des nombres)")

    if price_float < 0 or price_float > 100:
        raise HTTPException(400, detail="Le prix doit être entre 0 et 100 €")

    if stock_float < 0 or stock_float > 1:
        raise HTTPException(400, detail="Le stock doit être entre 0 et 1 (pourcentage)")

    # Recherche du dernier id existant
    shots_ref = collection_shots.order_by("id", direction=firestore.Query.DESCENDING).limit(1).stream()
    last_id = "s000"
    for shot_doc in shots_ref:
        fetched_id = shot_doc.to_dict().get("id", "s000")
        if fetched_id.startswith("s") and fetched_id[1:].isdigit():
            last_id = fetched_id

    new_id = f"s{int(last_id[1:]) + 1:03d}"

    shot_data = {
        "id": new_id,
        "name": name,
        "price": price_float,
        "stock": stock_float,
        "image": image,
        "category": category
    }

    collection_shots.document(new_id).set(shot_data)

    # Invalidation du cache
    await redis.delete("shots_cache")
    await redis.delete("shots_cache_hash")

    return {"message": "Shot ajouté", "shot_id": new_id}

@router.get("/api/shots")
async def get_shots(request: Request):
    cache_key = "shots_cache"
    start = time.time()

    cached_data = await redis.get(cache_key)
    cached_hash = await redis.get(f"{cache_key}_hash")

    # Si les données sont en bytes, les décoder
    if isinstance(cached_data, bytes):
        cached_data = cached_data.decode()
    if isinstance(cached_hash, bytes):
        cached_hash = cached_hash.decode()

    client_etag = request.headers.get("if-none-match")

    # Si cache et hash existent
    if cached_data and cached_hash:
        if client_etag == cached_hash:
            logger.info(f"[CACHE VALID] ETag client: {client_etag} correspond à cache.")
            return Response(status_code=304)

        logger.info(f"[CACHE HIT] Clé: {cache_key} | Durée: {time.time() - start:.3f}s")
        return JSONResponse(
            content={"shots": json.loads(cached_data)},
            headers={"ETag": str(cached_hash)}
        )

    # Requête Firestore (cache manquant)
    logger.info(f"[CACHE MISS] Clé: {cache_key} - Requête Firestore en cours...")
    shots = [doc.to_dict() for doc in collection_shots.stream()]
    shots_json = json.dumps(shots)
    shots_hash = hashlib.md5(shots_json.encode()).hexdigest()

    # Stockage dans Redis
    await redis.set(cache_key, shots_json, ex=60 * 5)
    await redis.set(f"{cache_key}_hash", shots_hash, ex=60 * 5)

    logger.info(f"[CACHE SET] Clé: {cache_key} | {len(shots)} éléments | Durée: {time.time() - start:.3f}s")

    return JSONResponse(
        content={"shots": shots},
        headers={"ETag": str(shots_hash)}
    )


@router.delete("/api/shots/{shot_id}")
async def delete_shot(shot_id: str):
    doc_ref = collection_shots.document(shot_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Shot non trouvé")

    # Supprime le document
    doc_ref.delete()

    # Invalide le cache Redis
    cache_key = "shots_cache"
    await redis.delete(cache_key)
    await redis.delete(f"{cache_key}_hash")

    return {"message": f"Shot {shot_id} supprimé et cache invalidé"}

@router.get("/api/machines", response_model=List[Machine])
async def get_machines():
    # Vérifie si les machines sont déjà en cache
    cached_machines = await redis.get("machines_cache")
    if cached_machines:
        return json.loads(cached_machines)

    docs = machines_collection.stream()
    machines = []

    for doc in docs:
        data = doc.to_dict()
        nom = data.get("nom", "")
        queue = data.get("queue", [])
        alcools_raw = data.get("alcools", [])

        alcools = []
        for item in alcools_raw:
            alcool_ref = item.get("alcool")
            stock = item.get("stock", False)

            if isinstance(alcool_ref, firestore.DocumentReference):
                alcool_doc = alcool_ref.get()
                if alcool_doc.exists:
                    alcools.append({
                        "alcool": alcool_doc.to_dict(),
                        "stock": stock
                    })

        machines.append({
            "nom": nom,
            "alcools": alcools,
            "queue": queue
        })

    # Mise en cache pour 60 secondes
    await redis.set("machines_cache", json.dumps(machines), ex=60)

    return machines

# TODO revoir en entier
@router.get("/api/queue")
def get_queue():
    docs = users_collection.stream()
    queue = []
    for doc in docs:
        data = doc.to_dict()
        full_name = f"{data.get('Prénom', '')} {data.get('Nom', '')}".strip()
        queue.append({"id": doc.id, "name": full_name})
    return {"User": queue}
