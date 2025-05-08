from pydantic import BaseModel
from typing import List

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
    nom: str
    alcools: List[AlcoolItem]
    queue: List[str]
