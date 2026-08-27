from datetime import datetime, timedelta
from ..core.celery import celery_app
from ..core.database import SessionLocal
from ..models.order import Order, OrderStatus
from ..models.appointment import Appointment, AppointmentStatus, ReservationStatus

@celery_app.task(name="app.tasks.orders.expire_pending_checkouts")
def expire_pending_checkouts():
    """Expire pending checkouts after timeout"""
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        
        # Find expired pending orders
        expired_orders = db.query(Order).filter(
            Order.status == OrderStatus.PENDING,
            Order.checkout_expires_at < now
        ).all()
        
        for order in expired_orders:
            # Update order status
            order.status = OrderStatus.CANCELLED
            
            # Release reserved appointments
            for appointment in order.appointments:
                appointment.status = AppointmentStatus.CANCELLED
                appointment.reservation_status = ReservationStatus.EXPIRED
        
        db.commit()
        
        return f"Expired {len(expired_orders)} pending checkouts"
    finally:
        db.close()

@celery_app.task(name="app.tasks.orders.confirm_order_payment")
def confirm_order_payment(order_id: int, payment_id: str):
    """Confirm order payment and update status"""
    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return f"Order {order_id} not found"
        
        # Update order status
        order.status = OrderStatus.PAID
        
        # Confirm associated appointments
        for appointment in order.appointments:
            appointment.status = AppointmentStatus.CONFIRMED
            appointment.reservation_status = ReservationStatus.CONFIRMED
        
        db.commit()
        
        return f"Order {order_id} confirmed"
    finally:
        db.close()