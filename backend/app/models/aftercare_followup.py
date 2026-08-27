from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class AftercareFollowUp(Base):
    __tablename__ = "aftercare_follow_ups"
    
    id = Column(Integer, primary_key=True, index=True)
    aftercare_id = Column(Integer, ForeignKey("aftercare.id"), nullable=False)
    message = Column(Text, nullable=False)
    media_url = Column(String)
    sent_by_client = Column(DateTime(timezone=True))
    responded_at = Column(DateTime(timezone=True))
    response = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    aftercare = relationship("Aftercare", back_populates="follow_ups")