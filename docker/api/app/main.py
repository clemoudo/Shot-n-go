from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.shot import router as shot_router
import logging
import os, shutil
from app.firebase import verify_firebase_token

# Structure des logs pour redis
logging.basicConfig(
   level=logging.INFO,
   format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

# Repertoire des images
IMAGES_DIR = "/images"
os.makedirs(IMAGES_DIR, exist_ok=True)

# Création de l'app FastAPI
app = FastAPI()

origins = [
   "http://localhost:3000",
   "https://shot-n-go.m1-1.ephec-ti.be/"
]
app.add_middleware(
   CORSMiddleware,
   allow_origins=origins,
   allow_credentials=True,
   allow_methods=["*"],
   allow_headers=["*"],
)

# Inclure les routes
app.include_router(shot_router)

@app.get("/api/")
def read_root():
   return {"message": "Hello FastAPI & Firestore!"}

@app.post("/upload")
async def upload_image(file: UploadFile = File(...), _ = Depends(verify_firebase_token)):
   file_path = os.path.join(IMAGES_DIR, file.filename)
   with open(file_path, "wb") as buffer:
      shutil.copyfileobj(file.file, buffer)
   return {"message": "Image uploaded", "filename": file.filename}

@app.get("/images")
def list_images():
   return os.listdir(IMAGES_DIR)

@app.get("/images/{filename}")
def get_image(filename: str):
   file_path = os.path.join(IMAGES_DIR, filename)
   if not os.path.exists(file_path):
      raise HTTPException(status_code=404, detail="Image not found")
   return FileResponse(file_path)

@app.delete("/images/{filename}")
def delete_image(filename: str, _ = Depends(verify_firebase_token)):
   file_path = os.path.join(IMAGES_DIR, filename)
   if not os.path.exists(file_path):
      raise HTTPException(status_code=404, detail="Image not found")
   os.remove(file_path)
   return {"message": "Image deleted"}
