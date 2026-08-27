from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from ..models.payment import PaymentMethod, PaymentStatus, PaymentOrigin

class PaymentBase(BaseModel):
    origin: PaymentOrigin
    amount: Decimal
    method: PaymentMethod
    order_id: Optional[int] = None
    appointment_id: Optional[int] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: int
    status: PaymentStatus
    fee_amount: Decimal
    infinitepay_id: Optional[str] = None
    receipt_url: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaymentList(BaseModel):
    id: int
    amount: Decimal
    method: PaymentMethod
    status: PaymentStatus
    origin: PaymentOrigin
    created_at: datetime
    
    class Config:
        from_attributes = True

class WebhookPayload(BaseModel):
    event: str
    data: dict
    signature: str

class CheckoutRequest(BaseModel):
    order_id: int
    payment_method: PaymentMethod
    return_url: str