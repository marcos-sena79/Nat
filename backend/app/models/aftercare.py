from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Aftercare(Base):
    __tablename__ = "aftercare"
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    instructions = Column(Text, nullable=False)
    piercing_type = Column(String, nullable=False)
    piercing_location = Column(String, nullable=False)
    care_frequency = Column(String)
    healing_time_weeks = Column(Integer)
    warning_signs = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    appointment = relationship("Appointment")
    follow_ups = relationship("AftercareFollowUp", back_populates="aftercare")