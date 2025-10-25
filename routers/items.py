from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas, auth, database, models

router = APIRouter(
    prefix="/api/items",
    tags=["items"],
    dependencies=[Depends(auth.get_current_active_user)], # Protect all item routes
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Item)
def create_item_for_user(
    item: schemas.ItemCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    return crud.create_user_item(db=db, item=item, user_id=current_user.id)

@router.get("/", response_model=List[schemas.Item])
def read_items(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    items = crud.get_items(db, owner_id=current_user.id, skip=skip, limit=limit)
    return items

@router.put("/{item_id}", response_model=schemas.Item)
def update_user_item(
    item_id: int,
    item_update: schemas.ItemUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_item = crud.update_item(db=db, item_id=item_id, item_update=item_update, owner_id=current_user.id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found or not owned by user")
    return db_item

@router.delete("/{item_id}", response_model=schemas.Item)
def delete_user_item(
    item_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_item = crud.delete_item(db=db, item_id=item_id, owner_id=current_user.id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found or not owned by user")
    return db_item # Or return a confirmation message
