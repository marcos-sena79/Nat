from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class MessageAuthor(str, enum.Enum):
    CLIENT = "client"
    AI = "ai"
    ADMIN = "admin"

class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class AIMessage(Base):
    __tablename__ = "ai_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id"), nullable=False)
    author = Column(Enum(MessageAuthor), nullable=False)
    content = Column(Text, nullable=False)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.LOW)
    guidelines_version = Column(String)
    model_version = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    conversation = relationship("AIConversation", back_populates="messages")