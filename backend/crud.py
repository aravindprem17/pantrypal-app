from sqlalchemy.orm import Session
from . import models, schemas, auth
from fastapi import HTTPException, status

# --- User CRUD ---
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Item CRUD ---
def get_items(db: Session, owner_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Item).filter(models.Item.owner_id == owner_id).offset(skip).limit(limit).all()

def create_user_item(db: Session, item: schemas.ItemCreate, user_id: int):
    db_item = models.Item(**item.model_dump(), owner_id=user_id) # Use model_dump() for Pydantic v2
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item(db: Session, item_id: int, item_update: schemas.ItemUpdate, owner_id: int):
    db_item = db.query(models.Item).filter(models.Item.id == item_id, models.Item.owner_id == owner_id).first()
    if db_item is None:
        return None

    update_data = item_update.model_dump(exclude_unset=True) # exclude_unset ensures only provided fields are updated
    for key, value in update_data.items():
        setattr(db_item, key, value)

    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_item(db: Session, item_id: int, owner_id: int):
    db_item = db.query(models.Item).filter(models.Item.id == item_id, models.Item.owner_id == owner_id).first()
    if db_item is None:
        return None
    db.delete(db_item)
    db.commit()
    return db_item
