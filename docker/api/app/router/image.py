from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
import os, shutil
from app.firebase import verify_firebase_token

# Repertoire des images
IMAGES_DIR = "/images"
os.makedirs(IMAGES_DIR, exist_ok=True)

router = APIRouter()

@router.post("/images/upload")
async def upload_image(
   file: UploadFile = File(...),
   user_data: dict = Depends(verify_firebase_token)
):
   if user_data["role"] != "admin":
      raise HTTPException(status_code=403, detail="Access denied: admin only")
   
   file_path = os.path.join(IMAGES_DIR, file.filename)
   with open(file_path, "wb") as buffer:
      shutil.copyfileobj(file.file, buffer)
   return {"message": "Image uploaded", "filename": file.filename}

@router.get("/images")
def list_images():
   return os.listdir(IMAGES_DIR)

@router.get("/images/{filename}")
def get_image(filename: str):
   file_path = os.path.join(IMAGES_DIR, filename)
   if not os.path.exists(file_path):
      raise HTTPException(status_code=404, detail="Image not found")
   return FileResponse(file_path)

@router.delete("/images/{filename}")
def delete_image(
   filename: str,
   user_data: dict = Depends(verify_firebase_token)
):
   if user_data["role"] != "admin":
      raise HTTPException(status_code=403, detail="Access denied: admin only")

   file_path = os.path.join(IMAGES_DIR, filename)
   if not os.path.exists(file_path):
      raise HTTPException(status_code=404, detail="Image not found")

   os.remove(file_path)
   return {"message": "Image deleted"}