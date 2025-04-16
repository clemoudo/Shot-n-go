from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import firestore
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
import base64
from io import BytesIO
from typing import List
# Initialiser Firebase Admin avec Firestore uniquement
cred = credentials.Certificate("KEY/shot-n-go-babc8-firebase-adminsdk-fbsvc-e4ec42301a.json")
firebase_admin.initialize_app(cred)

# Initialiser FastAPI
app = FastAPI()

# Connexion à Firestore
db = firestore.Client.from_service_account_json("KEY/shot-n-go-babc8-firebase-adminsdk-fbsvc-e4ec42301a.json")
collection_shots = db.collection("Shots")  # Collection pour les shots
machines_collection = db.collection("machines")
# Liste des origines autorisées (CORS)
origins = [
    "http://localhost:3000",
    "http://172.19.0.1:3000",
    "https://mon-front.vercel.app",
    "https://mon-site.netlify.app",
    "https://shot-n-go.m1-1.ephec-ti.be/"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Shot(BaseModel):
    name: str
    category: str
    sweetness: int
    alcoholLevel: int
    price: float
    cover: str
    stock: int


class AlcoolItem(BaseModel):
    alcool: Shot
    stock: bool

class MachineSchema(BaseModel):
    nom : str
    alcools : List[AlcoolItem]
    queue : List[str]


@app.post("/shot/send/")
async def add_shot(
    name: str = Form(...),
    alcoholLevel: int = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    sweetness: int = Form(...),
    file: UploadFile = File(...),  # Le fichier d'image
    stock: int = Form(...),
):
    shots_ref = collection_shots.order_by("id", direction=firestore.Query.DESCENDING).limit(1).stream()
    last_id = "s000"
    for shot_doc in shots_ref:
        fetched_id = shot_doc.to_dict().get("id", "s000")
        if fetched_id.startswith("s") and fetched_id[1:].isdigit():
            last_id = fetched_id

    last_num = int(last_id[1:])
    new_id = f"s{last_num + 1:03d}"
    file_bytes = await file.read()
    image_base64 = base64.b64encode(file_bytes).decode("utf-8")

    # Ajouter le nouveau shot dans Firestore
    shot_data = {
        "name": name,
        "alcoholLevel": alcoholLevel,
        "category": category,
        "price": price,
        "sweetness": sweetness,
        "cover": image_base64,
        "id": new_id,
        "stock":stock
    }

    collection_shots.document(new_id).set(shot_data)

    return {"message": "Shot ajouté", "shot_id": new_id}

# Autres routes comme précédemment...
@app.get("/shot/receive/")
def get_shots():
    shots = [doc.to_dict() for doc in collection_shots.stream()]
    return {"shots": shots}


@app.get("/")
def read_root():
    return {"message": "Hello FastAPI & Firestore!"}

@app.delete("/shot/supr/{shot_name}")
def delete_shot(shot_name: str):
    """Supprime un utilisateur par email."""
    shot_to_delete = collection_shots.where("name", "==",shot_name).stream()

    found = False
    for shot in shot_to_delete:
        found = True
        collection_shots.document(shot.id).delete()
        print(f"shot {shot_name} supprimé.")

    if found:
        return {"message": f"shot {shot_name} supprimé"}
    else:
        return {"error": "Utilisateur non trouvé"}, 404



@app.get("/machine/gt_all", response_model=List[MachineSchema])
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
                    alcool_data = alcool_doc.to_dict()
                    alcools.append({
                        "alcool": alcool_data,
                        "stock": stock
                    })

        machines.append({
            "nom": nom,
            "alcools": alcools,
            "queue": queue
        })

    return machines

@app.post("/machine/send")
def add_machines(
    name: str = Form(...),
    alcools: list = Form(...)
):
    machine_ref = machines_collection.order_by("id", direction=firestore.Query.DESCENDING).limit(1).stream()
    last_id = "m000"
    for doc_machine in machine_ref:
        fetched_id = doc_machine.to_dict().get("id", "m000")
        if fetched_id.startswith("m") and fetched_id[1:].isdigit():
            last_id = fetched_id
    
    last_num = int(last_id[1:])
    new_id = f"m{last_num + 1:03d}"

    alcool_refs = []
    for shot_id in alcools:
        alcool_refs.append({
            "alcool": db.document(f"Shots/{shot_id}"),
            "stock": True  # tu peux changer dynamiquement si besoin
        })
    

    machine_data = {
        "id": new_id,
        "nom": name,
        "alcools": alcool_refs,
        "queue": []
    }

    machines_collection.document(new_id).set(machine_data)

    return {"message": "Machine ajoutée", "machine_id": new_id}


@app.get("/queue")
def get_queue():
    user_collection = db.collection("User")
    docs = user_collection.stream()

    queue = []
    for doc in docs:
        data = doc.to_dict()
        full_name = f"{data.get('Prénom', '')} {data.get('Nom', '')}".strip()
        queue.append({
            "id": doc.id,
            "name": full_name
        })
    return{"User": queue}
