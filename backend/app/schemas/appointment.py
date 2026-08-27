from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from ..models.appointment import AppointmentStatus, ReservationStatus

class AppointmentBase(BaseModel):
    service_id: int
    start_time: datetime
    end_time: datetime
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase):
    id: int
    client_id: int
    professional_id: Optional[int] = None
    status: AppointmentStatus
    reservation_status: ReservationStatus
    deposit_paid: Decimal
    total_amount: Decimal
    order_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class AppointmentList(BaseModel):
    id: int
    service_name: str
    start_time: datetime
    end_time: datetime
    status: AppointmentStatus
    client_name: str
    
    class Config:
        from_attributes = True

class AvailabilityCheck(BaseModel):
    service_id: int
    date: datetime

class AvailableSlot(BaseModel):
    start_time: datetime
    end_time: datetime
    professional_id: Optional[int] = None
    professional_name: Optional[str] = None