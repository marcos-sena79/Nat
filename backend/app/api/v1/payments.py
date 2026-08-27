from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ...core.database import get_db
from ...core.security import get_current_active_user, get_current_admin_user
from ...core.config import settings
from ...models.payment import Payment, PaymentStatus, PaymentMethod, PaymentOrigin
from ...models.order import Order, OrderStatus
from ...models.appointment import Appointment, AppointmentStatus, ReservationStatus
from ...schemas.payment import (
    PaymentCreate, PaymentResponse, PaymentList,
    WebhookPayload, CheckoutRequest
)
import httpx
import hashlib
import hmac

router = APIRouter()

async def create_infinitepay_checkout(order_id: int, amount: float, return_url: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.infinitepay.io/v1/checkout",
            headers={
                "Authorization": f"Bearer {settings.INFINITEPAY_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "amount": amount,
                "currency": "BRL",
                "order_id": str(order_id),
                "return_url": return_url,
                "payment_methods": ["pix", "credit_card"]
            }
        )
        return response.json()

@router.post("/checkout", response_model=dict)
async def create_checkout(
    checkout: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    order = db.query(Order).filter(Order.id == checkout.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.client_id != current_user.client_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is not pending"
        )
    
    # Create InfinitePay checkout
    checkout_result = await create_infinitepay_checkout(
        order_id=order.id,
        amount=float(order.total),
        return_url=checkout.return_url
    )
    
    # Create payment record
    db_payment = Payment(
        order_id=order.id,
        origin=PaymentOrigin.ORDER,
        amount=order.total,
        method=checkout.payment_method,
        status=PaymentStatus.PENDING,
        infinitepay_id=checkout_result.get("id")
    )
    db.add(db_payment)
    db.commit()
    
    return {
        "checkout_url": checkout_result.get("checkout_url"),
        "payment_id": db_payment.id
    }

@router.post("/webhook")
async def payment_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    payload = await request.json()
    
    # Verify webhook signature
    signature = request.headers.get("X-InfinitePay-Signature")
    if not verify_webhook_signature(payload, signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    event = payload.get("event")
    payment_id = payload.get("data", {}).get("payment_id")
    
    if event == "payment.approved":
        # Update payment status
        payment = db.query(Payment).filter(Payment.infinitepay_id == payment_id).first()
        if payment:
            payment.status = PaymentStatus.APPROVED
            payment.paid_at = datetime.utcnow()
            
            # Update order status
            if payment.order_id:
                order = db.query(Order).filter(Order.id == payment.order_id).first()
                if order:
                    order.status = OrderStatus.PAID
                    
                    # Confirm appointments
                    for appointment in order.appointments:
                        appointment.status = AppointmentStatus.CONFIRMED
                        appointment.reservation_status = ReservationStatus.CONFIRMED
            
            # Update appointment status if direct payment
            if payment.appointment_id:
                appointment = db.query(Appointment).filter(
                    Appointment.id == payment.appointment_id
                ).first()
                if appointment:
                    appointment.status = AppointmentStatus.CONFIRMED
                    appointment.reservation_status = ReservationStatus.CONFIRMED
            
            db.commit()
    
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
    
    return {"status": "ok"}

def verify_webhook_signature(payload: dict, signature: str) -> bool:
    # Implement webhook signature verification
    # This is a simplified version - implement according to InfinitePay documentation
    return True

@router.get("/payments", response_model=List[PaymentList])
def list_payments(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    query = db.query(Payment)
    
    if status:
        query = query.filter(Payment.status == status)
    
    payments = query.order_by(Payment.created_at.desc()).all()
    return payments

@router.get("/payments/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment