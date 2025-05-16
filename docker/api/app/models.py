from pydantic import BaseModel
from typing import List

class Shot(BaseModel):
    id: str
    name: str
    price: float
    image: str
    category: str

class Machine(BaseModel):
    id: str
    nom: str
