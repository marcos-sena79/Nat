from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ...core.database import get_db
from ...core.security import get_current_active_user, get_current_admin_user
from ...core.config import settings
from ...tasks.notifications import send_email as send_email_task
from ...tasks.notifications import send_whatsapp_message as send_whatsapp_task
from ...tasks.notifications import send_appointment_reminder as send_appointment_reminder_task
from ...tasks.notifications import send_aftercare_reminder as send_aftercare_reminder_task
from ...models.appointment import Appointment
from ...models.aftercare import Aftercare

router = APIRouter()

@router.post("/email")
async def send_email(
    to: str,
    subject: str,
    body: str,
    current_user = Depends(get_current_admin_user)
):
    task = send_email_task.delay(to, subject, body)
    return {"message": "Email queued", "task_id": task.id}

@router.post("/whatsapp")
async def send_whatsapp(
    phone: str,
    message: str,
    current_user = Depends(get_current_admin_user)
):
    task = send_whatsapp_task.delay(phone, message)
    return {"message": "WhatsApp message queued", "task_id": task.id}

@router.post("/reminders/appointment")
async def send_appointment_reminder(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    if not db.query(Appointment).filter(Appointment.id == appointment_id).first():
        raise HTTPException(status_code=404, detail="Appointment not found")
    task = send_appointment_reminder_task.delay(appointment_id)
    return {"message": "Appointment reminder queued", "task_id": task.id}

@router.post("/reminders/aftercare")
async def send_aftercare_reminder(
    aftercare_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    if not db.query(Aftercare).filter(Aftercare.id == aftercare_id).first():
        raise HTTPException(status_code=404, detail="Aftercare record not found")
    task = send_aftercare_reminder_task.delay(aftercare_id)
    return {"message": "Aftercare reminder queued", "task_id": task.id}