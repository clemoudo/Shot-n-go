from pydantic import BaseModel
from typing import List

class Shot(BaseModel):
    id: str
    name: str
    price: float
    stock: float
    image: str
    category: str

class Machine(BaseModel):
    nom: str
    alcools: List[Shot]
    queue: List[str]
