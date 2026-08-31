from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class TriagePolicy(Base):
    __tablename__ = "triage_policies"
    
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String, nullable=False)
    warning_signs = Column(Text, nullable=False)  # JSON with signs for each level
    referral_message = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    creator = relationship("User")