from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Availability(Base):
    __tablename__ = "availabilities"
    
    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    is_blocked = Column(Boolean, default=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    professional = relationship("User")