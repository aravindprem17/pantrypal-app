from pydantic import BaseModel
from typing import Optional, List
from datetime import date

# --- Item Schemas ---
class ItemBase(BaseModel):
    name: str
    category: Optional[str] = "Uncategorized"
    quantity: float
    unit: Optional[str] = "pcs"
    purchase_date: Optional[date] = None
    expiry_date: Optional[date] = None
    low_stock_threshold: Optional[float] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    purchase_date: Optional[date] = None
    expiry_date: Optional[date] = None
    low_stock_threshold: Optional[float] = None

class Item(ItemBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True # Changed from orm_mode for Pydantic v2

# --- User Schemas ---
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    items: List[Item] = []

    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
