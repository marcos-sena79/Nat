from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from ...core.database import get_db
from ...core.security import get_current_active_user, get_current_admin_user
from ...models.service import Service
from ...models.appointment import Appointment, AppointmentStatus, ReservationStatus
from ...models.availability import Availability
from ...schemas.appointment import (
    AppointmentCreate, AppointmentResponse, AppointmentList,
    AvailabilityCheck, AvailableSlot
)
from ...schemas.service import ServiceCreate, ServiceResponse, ServiceList

router = APIRouter()

@router.get("/services", response_model=List[ServiceList])
def list_services(
    service_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Service).filter(Service.is_active == True)
    
    if service_type:
        query = query.filter(Service.service_type == service_type)
    
    services = query.all()
    return services

@router.get("/services/{service_id}", response_model=ServiceResponse)
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.post("/services", response_model=ServiceResponse)
def create_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_service = Service(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@router.get("/availability", response_model=List[AvailableSlot])
def check_availability(
    service_id: int,
    date: datetime,
    db: Session = Depends(get_db)
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get available slots for the date
    start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = start_of_day + timedelta(days=1)
    
    # Get existing appointments
    existing_appointments = db.query(Appointment).filter(
        Appointment.start_time >= start_of_day,
        Appointment.end_time <= end_of_day,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED])
    ).all()
    
    # Get blocked times
    blocked_times = db.query(Availability).filter(
        Availability.start_time >= start_of_day,
        Availability.end_time <= end_of_day,
        Availability.is_blocked == True
    ).all()
    
    # Calculate available slots (simplified logic)
    available_slots = []
    current_time = start_of_day.replace(hour=9, minute=0)  # Start at 9 AM
    
    while current_time + timedelta(minutes=service.duration_minutes) <= end_of_day.replace(hour=18, minute=0):
        slot_end = current_time + timedelta(minutes=service.duration_minutes)
        
        # Check if slot conflicts with existing appointments
        conflict = False
        for appointment in existing_appointments:
            if (current_time < appointment.end_time and slot_end > appointment.start_time):
                conflict = True
                break
        
        # Check if slot conflicts with blocked times
        for blocked in blocked_times:
            if (current_time < blocked.end_time and slot_end > blocked.start_time):
                conflict = True
                break
        
        if not conflict:
            available_slots.append(AvailableSlot(
                start_time=current_time,
                end_time=slot_end
            ))
        
        current_time += timedelta(minutes=30)  # 30-minute intervals
    
    return available_slots

@router.post("/appointments", response_model=AppointmentResponse)
def create_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    service = db.query(Service).filter(Service.id == appointment.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Check if slot is available
    existing_appointment = db.query(Appointment).filter(
        Appointment.start_time < appointment.end_time,
        Appointment.end_time > appointment.start_time,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED])
    ).first()
    
    if existing_appointment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Time slot already booked"
        )
    
    # Calculate total amount
    total_amount = service.price
    
    db_appointment = Appointment(
        client_id=current_user.client_profile.id,
        service_id=appointment.service_id,
        start_time=appointment.start_time,
        end_time=appointment.end_time,
        total_amount=total_amount,
        deposit_paid=service.deposit_amount,
        notes=appointment.notes
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.get("/appointments", response_model=List[AppointmentList])
def list_appointments(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    query = db.query(Appointment)
    
    if current_user.role == "client":
        query = query.filter(Appointment.client_id == current_user.client_profile.id)
    
    if status:
        query = query.filter(Appointment.status == status)
    
    appointments = query.order_by(Appointment.start_time.desc()).all()
    return appointments

@router.get("/appointments/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check access permission
    if current_user.role == "client" and appointment.client_id != current_user.client_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return appointment

@router.put("/appointments/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check access permission
    if current_user.role == "client" and appointment.client_id != current_user.client_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    appointment.status = AppointmentStatus.CANCELLED
    db.commit()
    return {"message": "Appointment cancelled successfully"}