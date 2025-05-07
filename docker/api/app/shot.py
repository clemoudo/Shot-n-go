from fastapi import APIRouter, UploadFile, Form, File
from app.firebase import db
import base64
from typing import List
from app.models import Shot, MachineSchema
from google.cloud import firestore

router = APIRouter()
collection_shots = db.collection("Shots")
machines_collection = db.collection("Machine")
users_collection = db.collection("User")

@router.post("/api/shot/send/")
async def add_shot(
    name: str = Form(...),
    alcoholLevel: int = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    sweetness: int = Form(...),
    file: UploadFile = File(...),
    stock: int = Form(...),
):
    shots_ref = collection_shots.order_by("id", direction=firestore.Query.DESCENDING).limit(1).stream()
    last_id = "s000"
    for shot_doc in shots_ref:
        fetched_id = shot_doc.to_dict().get("id", "s000")
        if fetched_id.startswith("s") and fetched_id[1:].isdigit():
            last_id = fetched_id

    new_id = f"s{int(last_id[1:]) + 1:03d}"
    file_bytes = await file.read()
    image_base64 = base64.b64encode(file_bytes).decode("utf-8")

    shot_data = {
        "name": name,
        "alcoholLevel": alcoholLevel,
        "category": category,
        "price": price,
        "sweetness": sweetness,
        "cover": image_base64,
        "id": new_id,
        "stock": stock
    }

    collection_shots.document(new_id).set(shot_data)
    return {"message": "Shot ajouté", "shot_id": new_id}

@router.get("/api/shot/receive/")
def get_shots():
    return {"shots": [doc.to_dict() for doc in collection_shots.stream()]}

@router.delete("/api/shot/supr/{shot_name}")
def delete_shot(shot_name: str):
    shot_to_delete = collection_shots.where("name", "==", shot_name).stream()
    found = False
    for shot in shot_to_delete:
        found = True
        collection_shots.document(shot.id).delete()

    if found:
        return {"message": f"shot {shot_name} supprimé"}
    return {"error": "Shot non trouvé"}, 404

@router.get("/api/machine/gt_all", response_model=List[MachineSchema])
def get_all_machines():
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

    return machines

@router.get("/api/queue")
def get_queue():
    docs = users_collection.stream()
    queue = []
    for doc in docs:
        data = doc.to_dict()
        full_name = f"{data.get('Prénom', '')} {data.get('Nom', '')}".strip()
        queue.append({"id": doc.id, "name": full_name})
    return {"User": queue}
