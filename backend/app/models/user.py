from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class UserRole(str, enum.Enum):
    CLIENT = "client"
    ADMIN = "admin"
    PROFESSIONAL = "professional"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.CLIENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    client_profile = relationship("ClientProfile", back_populates="user", uselist=False)
    social_accounts = relationship("SocialAccount", back_populates="user")