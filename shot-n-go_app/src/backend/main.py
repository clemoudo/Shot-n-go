from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import firestore
from pydantic import BaseModel, Field

# Initialiser l'app FastAPI
app = FastAPI()

origins = [
    "http://localhost:3000",  # Pour développement local
    "http://172.19.0.1:3000",
    "https://mon-front.vercel.app",  # Exemple pour Vercel
    "https://mon-site.netlify.app",  # Exemple pour Netlify
    "https://mon-domaine.com"  # Si tu as un domaine propre
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Liste des origines autorisées
    allow_credentials=True,
    allow_methods=["*"],  # Autoriser toutes les méthodes (GET, POST, etc.)
    allow_headers=["*"],  # Autoriser tous les headers
)

# Connexion à Firestore
db = firestore.Client.from_service_account_json("KEY/shot-n-go-babc8-firebase-adminsdk-fbsvc-e4ec42301a.json")
collection = db.collection("users")
collection_shot = db.collection("Shots")  # Collection Firestore

@app.get("/")
def read_root():
    return {"message": "Hello FastAPI & Firestore!"}

class Shot(BaseModel):
    name: str = Field(...)
    category: str = Field(...)
    sweetness: int = Field(...)
    alcoholLevel: int = Field(...)

@app.post("/add_shot/")
def add_shot(shot: Shot):
    # Récupérer le dernier shot pour générer un nouvel ID
    shots_ref = collection_shot.order_by("id", direction=firestore.Query.DESCENDING).limit(1).stream()
    last_id = "s000"
    for shot_doc in shots_ref:
        fetched_id = shot_doc.to_dict().get("id", "s000")
        if fetched_id.startswith("s") and fetched_id[1:].isdigit():
            last_id = fetched_id

    last_num = int(last_id[1:])
    new_id = f"s{last_num + 1:03d}"

    # Ajouter le nouveau shot dans Firestore
    shot_data = shot.dict()
    shot_data["id"] = new_id
    collection_shot.document(new_id).set(shot_data)

    return {"message": "Shot ajouté", "shot_id": new_id}

@app.post("/add_user/")
def add_user(user: dict):
    """Ajoute un utilisateur à Firestore."""
    doc_ref = collection.document()
    doc_ref.set(user)
    return {"message": "Utilisateur ajouté", "user_id": doc_ref.id}




@app.get("/get_shots/")
def get_shots():
    """Récupère tous les utilisateurs."""
    shots = [doc.to_dict() for doc in collection_shot.stream()]
    print("📢 Liste des utilisateurs récupérés :", shots)
    return {"shots": shots}

@app.get("/get_users/")
def get_users():
    """Récupère tous les utilisateurs."""
    users = [doc.to_dict() for doc in collection.stream()]
    print("📢 Liste des utilisateurs récupérés :", users)
    return {"users": users}

@app.delete("/delete_user/{email}")
def delete_user(email: str):
    """Supprime un utilisateur par email."""
    user_to_delete = collection.where("email", "==", email).stream()

    found = False
    for user in user_to_delete:
        found = True
        collection.document(user.id).delete()
        print(f"Utilisateur avec l'email {email} supprimé.")

    if found:
        return {"message": f"Utilisateur avec l'email {email} supprimé"}
    else:
        return {"error": "Utilisateur non trouvé"}, 404

@app.delete("/delete_shot/{shot_name}")
def delete_shot(shot_name: str):
    """Supprime un utilisateur par email."""
    shot_to_delete = collection_shot.where("name", "==",shot_name).stream()

    found = False
    for shot in shot_to_delete:
        found = True
        collection_shot.document(shot.id).delete()
        print(f"shot {shot_name} supprimé.")

    if found:
        return {"message": f"shot {shot_name} supprimé"}
    else:
        return {"error": "Utilisateur non trouvé"}, 404