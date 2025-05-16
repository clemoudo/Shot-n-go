from pydantic import BaseModel
from datetime import datetime

# === Wallet ===
class WalletRead(BaseModel):
    id: int
    user_id: int
    credit: float

    class Config:
        orm_mode = True

class WalletCreate(BaseModel):
    user_id: int
    credit: float

# === Shot ===
class ShotBase(BaseModel):
    name: str
    price: float
    image: str
    category: str

class ShotCreate(ShotBase):
    pass

class ShotRead(ShotBase):
    id: int

    class Config:
        orm_mode = True

# === Machine ===
class MachineBase(BaseModel):
    name: str

class MachineCreate(MachineBase):
    pass

class MachineRead(MachineBase):
    id: int

    class Config:
        orm_mode = True

# === MachineShot ===
class MachineShotRead(BaseModel):
    machine_id: int
    shot_id: int
    stock: float

    class Config:
        orm_mode = True

# === Commande ===
class CommandeBase(BaseModel):
    wallet_id: int
    user_id: int
    order_date: datetime
    state: str

class CommandeCreate(CommandeBase):
    pass

class CommandeRead(CommandeBase):
    id: int

    class Config:
        orm_mode = True

# === ComShot ===
class ComShotRead(BaseModel):
    commande_id: int
    shot_id: int
    quantity: int

    class Config:
        orm_mode = True
