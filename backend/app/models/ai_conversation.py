from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class ConversationStatus(str, enum.Enum):
    ACTIVE = "active"
    PENDING_REVIEW = "pending_review"
    RESOLVED = "resolved"
    ESCALATED = "escalated"

class AIConversation(Base):
    __tablename__ = "ai_conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("client_profiles.id"), nullable=False)
    consent_given = Column(DateTime(timezone=True))
    status = Column(Enum(ConversationStatus), default=ConversationStatus.ACTIVE)
    last_interaction = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    appointment = relationship("Appointment")
    client = relationship("ClientProfile")
    messages = relationship("AIMessage", back_populates="conversation")
    media = relationship("ConversationMedia", back_populates="conversation")
    reviews = relationship("HumanReview", back_populates="conversation")