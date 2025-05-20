from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.router.shot import router as shot_router
from app.router.image import router as image_router
from app.router.machine import router as machine_router
from app.router.machineShot import router as machineShot_router
from app.router.wallet import router as wallet_router
from app.router.commande import router as commande_router
from app.router.queue import router as queue_router
from app.router.leaderboard import router as leaderboard_router
import logging

# Structure des logs pour redis
logging.basicConfig(
   level=logging.INFO,
   format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

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
   allow_headers=["*"]
)

# Inclure les routes
app.include_router(shot_router)
app.include_router(image_router)
app.include_router(machine_router)
app.include_router(machineShot_router)
app.include_router(wallet_router)
app.include_router(commande_router)
app.include_router(queue_router)
app.include_router(leaderboard_router)

@app.get("/api/")
def read_root():
   return {"message": "API OK"}
