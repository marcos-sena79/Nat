from datetime import datetime, timedelta
from ..core.celery import celery_app
from ..core.database import SessionLocal
from ..models.financial_movement import FinancialMovement, MovementType
from ..models.order import Order, OrderStatus
from ..models.appointment import Appointment, AppointmentStatus

@celery_app.task(name="app.tasks.reports.generate_daily_report")
def generate_daily_report():
    """Generate daily financial report"""
    db = SessionLocal()
    try:
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        
        # Get daily income
        income = db.query(FinancialMovement).filter(
            FinancialMovement.movement_type == MovementType.INCOME,
            FinancialMovement.movement_date >= today,
            FinancialMovement.movement_date < tomorrow,
            FinancialMovement.status == "completed"
        ).all()
        
        total_income = sum(m.amount for m in income)
        
        # Get daily expenses
        expenses = db.query(FinancialMovement).filter(
            FinancialMovement.movement_type == MovementType.EXPENSE,
            FinancialMovement.movement_date >= today,
            FinancialMovement.movement_date < tomorrow,
            FinancialMovement.status == "completed"
        ).all()
        
        total_expenses = sum(m.amount for m in expenses)
        
        # Get daily orders
        orders = db.query(Order).filter(
            Order.created_at >= today,
            Order.created_at < tomorrow
        ).count()
        
        # Get daily appointments
        appointments = db.query(Appointment).filter(
            Appointment.start_time >= today,
            Appointment.start_time < tomorrow
        ).count()
        
        # TODO: Save report to database and/or send via email
        report = {
            "date": today.isoformat(),
            "income": float(total_income),
            "expenses": float(total_expenses),
            "net": float(total_income - total_expenses),
            "orders": orders,
            "appointments": appointments
        }
        
        print(f"Daily report generated: {report}")
        
        return report
    finally:
        db.close()

@celery_app.task(name="app.tasks.reports.generate_weekly_report")
def generate_weekly_report():
    """Generate weekly financial report"""
    db = SessionLocal()
    try:
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=7)
        
        # Similar logic as daily report but for the week
        # TODO: Implement weekly report
        
        return {"status": "weekly report generated"}
    finally:
        db.close()