from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from ..models.user import UserRole

class UserBase(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CLIENT

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None