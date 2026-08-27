from datetime import datetime
from ..core.celery import celery_app
from ..core.database import SessionLocal
from ..models.payment import Payment, PaymentStatus
from ..models.order import Order, OrderStatus
from ..models.appointment import Appointment, AppointmentStatus, ReservationStatus

@celery_app.task(name="app.tasks.webhooks.process_infinitepay_webhook")
def process_infinitepay_webhook(payload: dict):
    """Process InfinitePay webhook notification"""
    db = SessionLocal()
    try:
        event = payload.get("event")
        payment_id = payload.get("data", {}).get("payment_id")
        
        if event == "payment.approved":
            # Find payment
            payment = db.query(Payment).filter(Payment.infinitepay_id == payment_id).first()
            if not payment:
                return f"Payment {payment_id} not found"
            
            # Update payment status
            payment.status = PaymentStatus.APPROVED
            payment.paid_at = datetime.utcnow()
            
            # Update order if exists
            if payment.order_id:
                order = db.query(Order).filter(Order.id == payment.order_id).first()
                if order:
                    order.status = OrderStatus.PAID
                    
                    # Confirm appointments
                    for appointment in order.appointments:
                        appointment.status = AppointmentStatus.CONFIRMED
                        appointment.reservation_status = ReservationStatus.CONFIRMED
            
            # Update appointment if direct payment
            if payment.appointment_id:
                appointment = db.query(Appointment).filter(
                    Appointment.id == payment.appointment_id
                ).first()
                if appointment:
                    appointment.status = AppointmentStatus.CONFIRMED
                    appointment.reservation_status = ReservationStatus.CONFIRMED
            
            db.commit()
            return f"Payment {payment_id} approved"
        
        elif event == "payment.rejected":
            payment = db.query(Payment).filter(Payment.infinitepay_id == payment_id).first()
            if payment:
                payment.status = PaymentStatus.REJECTED
                
                # Release reserved slots
                if payment.order_id:
                    order = db.query(Order).filter(Order.id == payment.order_id).first()
                    if order:
                        for appointment in order.appointments:
                            appointment.status = AppointmentStatus.CANCELLED
                            appointment.reservation_status = ReservationStatus.EXPIRED
                
                db.commit()
            
            return f"Payment {payment_id} rejected"
        
        return f"Unknown event: {event}"
    finally:
        db.close()