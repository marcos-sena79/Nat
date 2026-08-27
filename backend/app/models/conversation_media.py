from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class MediaStatus(str, enum.Enum):
    ACTIVE = "active"
    DELETED = "deleted"
    EXPIRED = "expired"

class ConversationMedia(Base):
    __tablename__ = "conversation_media"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id"), nullable=False)
    file_url = Column(String, nullable=False)
    file_type = Column(String)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    status = Column(Enum(MediaStatus), default=MediaStatus.ACTIVE)
    
    # Relationships
    conversation = relationship("AIConversation", back_populates="media")