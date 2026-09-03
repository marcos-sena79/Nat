from datetime import datetime, timedelta
from ..core.celery import celery_app
from ..core.database import SessionLocal
from ..models.appointment import Appointment, AppointmentStatus
from ..models.aftercare import Aftercare
from ..models.aftercare_followup import AftercareFollowUp
from email.message import EmailMessage
import smtplib
import httpx
import logging

logger = logging.getLogger(__name__)


def _send_email(to: str, subject: str, body: str) -> None:
    from ..core.config import settings

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        raise RuntimeError("SMTP_USER and SMTP_PASSWORD must be configured")

    email = EmailMessage()
    email["From"] = settings.SMTP_USER
    email["To"] = to
    email["Subject"] = subject
    email.set_content(body)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(email)


def _send_whatsapp(phone: str, message: str) -> None:
    from ..core.config import settings

    if not settings.WHATSAPP_API_URL or not settings.WHATSAPP_API_TOKEN:
        raise RuntimeError("WHATSAPP_API_URL and WHATSAPP_API_TOKEN must be configured")

    response = httpx.post(
        settings.WHATSAPP_API_URL,
        headers={"Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}"},
        json={"phone": phone, "message": message},
        timeout=15,
    )
    response.raise_for_status()

@celery_app.task(name="app.tasks.notifications.send_appointment_reminders")
def send_appointment_reminders():
    """Send reminders for upcoming appointments"""
    db = SessionLocal()
    try:
        # Get appointments in the next 24 hours
        now = datetime.utcnow()
        tomorrow = now + timedelta(hours=24)
        
        appointments = db.query(Appointment).filter(
            Appointment.start_time >= now,
            Appointment.start_time <= tomorrow,
            Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED])
        ).all()
        
        for appointment in appointments:
            _send_appointment_reminder(appointment)
        
        return f"Sent {len(appointments)} reminders"
    finally:
        db.close()

@celery_app.task(name="app.tasks.notifications.send_aftercare_reminders")
def send_aftercare_reminders():
    """Send aftercare follow-up reminders"""
    db = SessionLocal()
    try:
        # Get aftercare records that need reminders
        now = datetime.utcnow()
        
        # Get aftercare records from the past 30 days
        thirty_days_ago = now - timedelta(days=30)
        
        aftercare_records = db.query(Aftercare).filter(
            Aftercare.created_at >= thirty_days_ago
        ).all()
        
        for aftercare in aftercare_records:
            # Check if last follow-up was more than 3 days ago
            last_follow_up = db.query(AftercareFollowUp).filter(
                AftercareFollowUp.aftercare_id == aftercare.id
            ).order_by(AftercareFollowUp.created_at.desc()).first()
            
            if not last_follow_up or (now - last_follow_up.created_at).days >= 3:
                _send_aftercare_reminder(aftercare)
        
        return f"Processed {len(aftercare_records)} aftercare records"
    finally:
        db.close()


@celery_app.task(name="app.tasks.notifications.send_appointment_reminder")
def send_appointment_reminder(appointment_id: int):
    db = SessionLocal()
    try:
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise ValueError(f"Appointment {appointment_id} not found")
        _send_appointment_reminder(appointment)
        return True
    finally:
        db.close()


@celery_app.task(name="app.tasks.notifications.send_aftercare_reminder")
def send_aftercare_reminder(aftercare_id: int):
    db = SessionLocal()
    try:
        aftercare = db.query(Aftercare).filter(Aftercare.id == aftercare_id).first()
        if not aftercare:
            raise ValueError(f"Aftercare {aftercare_id} not found")
        _send_aftercare_reminder(aftercare)
        return True
    finally:
        db.close()

@celery_app.task(name="app.tasks.notifications.send_whatsapp_message")
def send_whatsapp_message(phone: str, message: str):
    """Send a WhatsApp message"""
    _send_whatsapp(phone, message)
    return True

@celery_app.task(name="app.tasks.notifications.send_email")
def send_email(to: str, subject: str, body: str):
    """Send an email"""
    _send_email(to, subject, body)
    return True


def _send_appointment_reminder(appointment: Appointment) -> None:
    user = appointment.client.user
    message = (
        f"Lembrete: seu atendimento de {appointment.service.name} "
        f"esta agendado para {appointment.start_time:%d/%m/%Y as %H:%M}."
    )
    if user.phone:
        _send_whatsapp(user.phone, message)
    if user.email:
        _send_email(user.email, "Lembrete de atendimento", message)


def _send_aftercare_reminder(aftercare: Aftercare) -> None:
    user = aftercare.appointment.client.user
    message = (
        f"Como esta sua cicatrizacao do piercing de {aftercare.piercing_type} "
        "? Responda esta mensagem se notar algum sinal de alerta."
    )
    if user.phone:
        _send_whatsapp(user.phone, message)
    if user.email:
        _send_email(user.email, "Acompanhamento do seu piercing", message)