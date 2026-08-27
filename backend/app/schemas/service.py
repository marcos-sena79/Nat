from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from ..models.service import ServiceType, PaymentPolicy

class ServiceBase(BaseModel):
    name: str
    service_type: ServiceType
    description: Optional[str] = None
    duration_minutes: int
    price: Decimal
    deposit_amount: Decimal = Decimal("0.00")
    payment_policy: PaymentPolicy = PaymentPolicy.FULL
    contraindications: Optional[str] = None
    preparation_guidelines: Optional[str] = None
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ServiceList(BaseModel):
    id: int
    name: str
    service_type: ServiceType
    duration_minutes: int
    price: Decimal
    deposit_amount: Decimal
    is_active: bool
    
    class Config:
        from_attributes = True