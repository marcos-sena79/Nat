from datetime import datetime, timedelta
from ..core.celery import celery_app
from ..core.database import SessionLocal
from ..models.appointment import Appointment, AppointmentStatus
from ..models.aftercare import Aftercare, AftercareFollowUp

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
            # TODO: Send WhatsApp/Email reminder
            print(f"Reminder sent for appointment {appointment.id}")
        
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
                # TODO: Send aftercare reminder
                print(f"Aftercare reminder sent for {aftercare.id}")
        
        return f"Processed {len(aftercare_records)} aftercare records"
    finally:
        db.close()

@celery_app.task(name="app.tasks.notifications.send_whatsapp_message")
def send_whatsapp_message(phone: str, message: str):
    """Send a WhatsApp message"""
    # TODO: Implement WhatsApp API integration
    print(f"WhatsApp message sent to {phone}")
    return True

@celery_app.task(name="app.tasks.notifications.send_email")
def send_email(to: str, subject: str, body: str):
    """Send an email"""
    # TODO: Implement email sending
    print(f"Email sent to {to}")
    return True