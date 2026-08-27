from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("client_profiles.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True, nullable=False)
    anamnesis = Column(Text)  # Medical history
    contraindications = Column(Text)
    allergies = Column(Text)
    medications = Column(Text)
    consent_given = Column(Boolean, default=False)
    consent_date = Column(DateTime(timezone=True))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    client = relationship("ClientProfile", back_populates="medical_records")
    appointment = relationship("Appointment", back_populates="medical_record")