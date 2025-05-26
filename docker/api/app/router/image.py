from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from werkzeug.utils import secure_filename
import os, shutil

from app.firebase import verify_firebase_token

# Répertoire des images
IMAGES_DIR = "/images"
os.makedirs(IMAGES_DIR, exist_ok=True)

# Extensions autorisées
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/gif", "image/webp"}

router = APIRouter()

@router.post("/api/images/upload")
async def upload_image(
   file: UploadFile = File(...),
   user_data: dict = Depends(verify_firebase_token)
):
   if user_data["role"] != "admin":
      raise HTTPException(status_code=403, detail="Access denied: admin only")

   # Vérifie le content-type
   if file.content_type not in ALLOWED_CONTENT_TYPES:
      raise HTTPException(status_code=400, detail="Type de fichier non autorisé.")

   # Vérifie l’extension du nom de fichier
   ext = os.path.splitext(file.filename)[1].lower()
   if ext not in ALLOWED_EXTENSIONS:
      raise HTTPException(status_code=400, detail="Extension de fichier non autorisée.")

   # Sécurise le nom de fichier
   filename = secure_filename(file.filename)
   file_path = os.path.join(IMAGES_DIR, filename)

   # Écrit le fichier en disque
   with open(file_path, "wb") as buffer:
      shutil.copyfileobj(file.file, buffer)

   return {"message": "Image uploaded", "filename": filename}

@router.get("/api/images")
def list_images():
   return os.listdir(IMAGES_DIR)

@router.get("/api/images/{filename}")
def get_image(filename: str):
   filename = secure_filename(filename)
   file_path = os.path.join(IMAGES_DIR, filename)
   if not os.path.exists(file_path):
      raise HTTPException(status_code=404, detail="Image not found")
   return FileResponse(file_path)

@router.delete("/api/images/{filename}")
def delete_image(
   filename: str,
   user_data: dict = Depends(verify_firebase_token)
):
   if user_data["role"] != "admin":
      raise HTTPException(status_code=403, detail="Access denied: admin only")

   filename = secure_filename(filename)
   file_path = os.path.join(IMAGES_DIR, filename)
   if not os.path.exists(file_path):
      raise HTTPException(status_code=404, detail="Image not found")

   os.remove(file_path)
   return {"message": "Image deleted"}
