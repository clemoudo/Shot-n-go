import os
from firebase_admin import credentials, firestore, initialize_app, auth
from fastapi import Depends, HTTPException, Header

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(BASE_DIR, "..", "KEY", "firebase-key.json")

cred = credentials.Certificate(cred_path)
initialize_app(cred)

db = firestore.client()

def verify_firebase_token(authorization: str = Header(...)):
   if not authorization.startswith("Bearer "):
      raise HTTPException(status_code=403, detail="Invalid auth header")

   id_token = authorization.split(" ")[1]

   try:
      decoded_token = auth.verify_id_token(id_token)
      return decoded_token  # contient email, uid, etc.
   except Exception:
      raise HTTPException(status_code=403, detail="Invalid or expired token")
