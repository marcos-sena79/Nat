from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class ReviewPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class ReviewDecision(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    NEEDS_FOLLOWUP = "needs_followup"
    ESCALATED_TO_MEDICAL = "escalated_to_medical"

class HumanReview(Base):
    __tablename__ = "human_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id"), nullable=False)
    priority = Column(Enum(ReviewPriority), default=ReviewPriority.MEDIUM)
    reason = Column(Text, nullable=False)
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    decision = Column(Enum(ReviewDecision), default=ReviewDecision.PENDING)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True))
    
    # Relationships
    conversation = relationship("AIConversation", back_populates="reviews")
    reviewer = relationship("User")