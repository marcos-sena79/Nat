from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AftercareBase(BaseModel):
    appointment_id: int
    instructions: str
    piercing_type: str
    piercing_location: str
    care_frequency: Optional[str] = None
    healing_time_weeks: Optional[int] = None
    warning_signs: Optional[str] = None

class AftercareCreate(AftercareBase):
    pass

class AftercareResponse(AftercareBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AftercareFollowUpBase(BaseModel):
    aftercare_id: int
    message: str
    media_url: Optional[str] = None

class AftercareFollowUpCreate(BaseModel):
    message: str
    media_url: Optional[str] = None

class AftercareFollowUpResponse(AftercareFollowUpBase):
    id: int
    sent_by_client: Optional[datetime] = None
    responded_at: Optional[datetime] = None
    response: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AIConversationBase(BaseModel):
    appointment_id: int
    client_id: int

class AIConversationCreate(BaseModel):
    appointment_id: int

class AIConversationResponse(AIConversationBase):
    id: int
    consent_given: Optional[datetime] = None
    status: str
    last_interaction: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AIMessageBase(BaseModel):
    conversation_id: int
    content: str
    media_url: Optional[str] = None

class AIMessageCreate(BaseModel):
    content: str
    media_url: Optional[str] = None

class AIMessageResponse(AIMessageBase):
    id: int
    author: str
    risk_level: str
    guidelines_version: Optional[str] = None
    model_version: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class HumanReviewBase(BaseModel):
    conversation_id: int
    priority: str
    reason: str

class HumanReviewCreate(BaseModel):
    reason: str
    priority: str = "medium"

class HumanReviewResponse(HumanReviewBase):
    id: int
    reviewed_by: Optional[int] = None
    decision: str
    notes: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True