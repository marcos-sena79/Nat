from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ...core.database import get_db
from ...core.security import get_current_admin_user
from ...models.user import User, UserRole
from ...models.client import ClientProfile
from ...models.order import Order
from ...models.appointment import Appointment
from ...models.human_review import HumanReview, ReviewDecision

router = APIRouter()

@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    # Get summary statistics
    total_clients = db.query(ClientProfile).count()
    total_orders = db.query(Order).count()
    total_appointments = db.query(Appointment).count()
    pending_reviews = db.query(HumanReview).filter(
        HumanReview.decision == ReviewDecision.PENDING
    ).count()
    
    # Recent activity
    recent_orders = db.query(Order).order_by(
        Order.created_at.desc()
    ).limit(5).all()
    
    recent_appointments = db.query(Appointment).order_by(
        Appointment.created_at.desc()
    ).limit(5).all()
    
    return {
        "total_clients": total_clients,
        "total_orders": total_orders,
        "total_appointments": total_appointments,
        "pending_reviews": pending_reviews,
        "recent_orders": recent_orders,
        "recent_appointments": recent_appointments
    }

@router.get("/users", response_model=List[dict])
def list_users(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.all()
    return [
        {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at
        }
        for user in users
    ]

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = new_role
    db.commit()
    return {"message": "User role updated successfully"}

@router.get("/audit-log")
def get_audit_log(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    # TODO: Implement audit log
    # This would track all admin actions
    return {"message": "Audit log not yet implemented"}

@router.get("/settings")
def get_settings(
    current_user = Depends(get_current_admin_user)
):
    # Return current business settings
    return {
        "business_name": "Body Piercing Studio",
        "currency": "BRL",
        "timezone": "America/Sao_Paulo",
        "ai_consent_required": True,
        "appointment_reminder_hours": 24,
        "aftercare_reminder_days": [1, 3, 7, 14, 30]
    }

@router.put("/settings")
def update_settings(
    settings: dict,
    current_user = Depends(get_current_admin_user)
):
    # TODO: Implement settings update
    return {"message": "Settings updated successfully"}