from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class ClientProfile(Base):
    __tablename__ = "client_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    birth_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="client_profile")
    appointments = relationship("Appointment", back_populates="client")
    orders = relationship("Order", back_populates="client")
    medical_records = relationship("MedicalRecord", back_populates="client")