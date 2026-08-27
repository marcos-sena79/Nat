from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from ...core.database import get_db
from ...core.security import get_current_admin_user
from ...models.financial_movement import FinancialMovement, MovementType, MovementCategory
from ...schemas.finance import (
    FinancialMovementCreate, FinancialMovementResponse, FinancialMovementList,
    CashFlowSummary, ProfitReport, ProductProfitability, ServiceProfitability,
    DashboardSummary
)

router = APIRouter()

@router.get("/movements", response_model=List[FinancialMovementList])
def list_movements(
    movement_type: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    query = db.query(FinancialMovement)
    
    if movement_type:
        query = query.filter(FinancialMovement.movement_type == movement_type)
    
    if category:
        query = query.filter(FinancialMovement.category == category)
    
    if start_date:
        query = query.filter(FinancialMovement.movement_date >= start_date)
    
    if end_date:
        query = query.filter(FinancialMovement.movement_date <= end_date)
    
    movements = query.order_by(FinancialMovement.movement_date.desc()).all()
    return movements

@router.post("/movements", response_model=FinancialMovementResponse)
def create_movement(
    movement: FinancialMovementCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_movement = FinancialMovement(
        movement_type=movement.movement_type,
        category=movement.category,
        amount=movement.amount,
        description=movement.description,
        reference_id=movement.reference_id,
        reference_type=movement.reference_type,
        payment_method=movement.payment_method,
        notes=movement.notes,
        movement_date=movement.movement_date
    )
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    return db_movement

@router.get("/cash-flow", response_model=CashFlowSummary)
def get_cash_flow(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    # Calculate income
    income_query = db.query(FinancialMovement).filter(
        FinancialMovement.movement_type == MovementType.INCOME,
        FinancialMovement.movement_date >= start_date,
        FinancialMovement.movement_date <= end_date,
        FinancialMovement.status == "completed"
    )
    total_income = sum(m.amount for m in income_query.all())
    
    # Calculate expenses
    expense_query = db.query(FinancialMovement).filter(
        FinancialMovement.movement_type == MovementType.EXPENSE,
        FinancialMovement.movement_date >= start_date,
        FinancialMovement.movement_date <= end_date,
        FinancialMovement.status == "completed"
    )
    total_expenses = sum(m.amount for m in expense_query.all())
    
    # Calculate previous balance
    previous_balance_query = db.query(FinancialMovement).filter(
        FinancialMovement.movement_date < start_date,
        FinancialMovement.status == "completed"
    )
    previous_balance = Decimal("0.00")
    for movement in previous_balance_query.all():
        if movement.movement_type == MovementType.INCOME:
            previous_balance += movement.amount
        else:
            previous_balance -= movement.amount
    
    net_result = total_income - total_expenses
    balance = previous_balance + net_result
    
    return CashFlowSummary(
        period_start=start_date,
        period_end=end_date,
        total_income=total_income,
        total_expenses=total_expenses,
        net_result=net_result,
        balance=balance
    )

@router.get("/profit-report", response_model=ProfitReport)
def get_profit_report(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    # This is a simplified version - in reality you'd need to join with orders/appointments
    # to get actual revenue and costs
    
    # Get sales revenue
    sales_query = db.query(FinancialMovement).filter(
        FinancialMovement.movement_type == MovementType.INCOME,
        FinancialMovement.category.in_([
            MovementCategory.SALE,
            MovementCategory.SERVICE_PAYMENT,
            MovementCategory.DEPOSIT
        ]),
        FinancialMovement.movement_date >= start_date,
        FinancialMovement.movement_date <= end_date,
        FinancialMovement.status == "completed"
    )
    revenue = sum(m.amount for m in sales_query.all())
    
    # Get supply costs
    supply_costs_query = db.query(FinancialMovement).filter(
        FinancialMovement.movement_type == MovementType.EXPENSE,
        FinancialMovement.category == MovementCategory.SUPPLY_PURCHASE,
        FinancialMovement.movement_date >= start_date,
        FinancialMovement.movement_date <= end_date,
        FinancialMovement.status == "completed"
    )
    supply_costs = sum(m.amount for m in supply_costs_query.all())
    
    gross_profit = revenue - supply_costs
    
    # Get other expenses
    other_expenses_query = db.query(FinancialMovement).filter(
        FinancialMovement.movement_type == MovementType.EXPENSE,
        FinancialMovement.category != MovementCategory.SUPPLY_PURCHASE,
        FinancialMovement.movement_date >= start_date,
        FinancialMovement.movement_date <= end_date,
        FinancialMovement.status == "completed"
    )
    other_expenses = sum(m.amount for m in other_expenses_query.all())
    
    net_profit = gross_profit - other_expenses
    margin_percent = (net_profit / revenue * 100) if revenue > 0 else Decimal("0")
    
    return ProfitReport(
        period_start=start_date,
        period_end=end_date,
        revenue=revenue,
        costs=supply_costs,
        gross_profit=gross_profit,
        expenses=other_expenses,
        net_profit=net_profit,
        margin_percent=margin_percent
    )

@router.get("/dashboard", response_model=DashboardSummary)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    # Get summary data
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = today.replace(day=1)
    
    # Revenue this month
    revenue_query = db.query(FinancialMovement).filter(
        FinancialMovement.movement_type == MovementType.INCOME,
        FinancialMovement.movement_date >= month_start,
        FinancialMovement.status == "completed"
    )
    total_revenue = sum(m.amount for m in revenue_query.all())
    
    # Expenses this month
    expense_query = db.query(FinancialMovement).filter(
        FinancialMovement.movement_type == MovementType.EXPENSE,
        FinancialMovement.movement_date >= month_start,
        FinancialMovement.status == "completed"
    )
    total_expenses = sum(m.amount for m in expense_query.all())
    
    net_profit = total_revenue - total_expenses
    
    # Pending orders
    from ...models.order import Order, OrderStatus
    pending_orders = db.query(Order).filter(
        Order.status == OrderStatus.PENDING
    ).count()
    
    # Pending appointments
    from ...models.appointment import Appointment, AppointmentStatus
    pending_appointments = db.query(Appointment).filter(
        Appointment.status == AppointmentStatus.PENDING
    ).count()
    
    # Low stock items
    from ...models.supply import Supply
    low_stock_items = db.query(Supply).filter(
        Supply.current_stock <= Supply.min_stock
    ).count()
    
    # Recent transactions
    recent_movements = db.query(FinancialMovement).order_by(
        FinancialMovement.movement_date.desc()
    ).limit(10).all()
    
    return DashboardSummary(
        total_revenue=total_revenue,
        total_expenses=total_expenses,
        net_profit=net_profit,
        pending_orders=pending_orders,
        pending_appointments=pending_appointments,
        low_stock_items=low_stock_items,
        recent_transactions=recent_movements
    )