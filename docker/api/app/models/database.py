from sqlalchemy import Column, DateTime, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Wallet(Base):
    __tablename__ = "Wallet"

    id = Column(Integer, primary_key=True)
    user_id = Column(String(128), unique=True, nullable=False)
    user_email = Column(String(128), unique=True, nullable=False)
    credit = Column(Float, default=0, nullable=False)

    commandes = relationship("Commande", back_populates="wallet")


class Shot(Base):
    __tablename__ = "Shot"

    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    price = Column(Float)
    image = Column(String(255))
    category = Column(String(50))


class Machine(Base):
    __tablename__ = "Machine"

    id = Column(Integer, primary_key=True)
    name = Column(String(100))

    commandes = relationship("Commande", back_populates="machine")


class MachineShot(Base):
    __tablename__ = "Machine_Shot"

    machine_id = Column(Integer, ForeignKey("Machine.id"), primary_key=True)
    shot_id = Column(Integer, ForeignKey("Shot.id"), primary_key=True)
    stock = Column(Float)


class Commande(Base):
    __tablename__ = "Commande"

    id = Column(Integer, primary_key=True)
    wallet_id = Column(Integer, ForeignKey("Wallet.id"))
    machine_id = Column(Integer, ForeignKey("Machine.id"))
    user_id = Column(String)
    order_date = Column(DateTime)
    state = Column(String(50))

    wallet = relationship("Wallet", back_populates="commandes")
    machine = relationship("Machine", back_populates="commandes")


class ComShot(Base):
    __tablename__ = "Com_Shot"

    commande_id = Column(Integer, ForeignKey("Commande.id"), primary_key=True)
    shot_id = Column(Integer, ForeignKey("Shot.id"), primary_key=True)
    quantity = Column(Integer)
