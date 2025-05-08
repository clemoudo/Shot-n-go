from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.shot import router as shot_router
import logging

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
