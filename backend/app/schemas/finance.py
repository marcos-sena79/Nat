from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from ..models.financial_movement import MovementType, MovementCategory

class FinancialMovementBase(BaseModel):
    movement_type: MovementType
    category: MovementCategory
    amount: Decimal
    description: Optional[str] = None
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    movement_date: datetime

class FinancialMovementCreate(FinancialMovementBase):
    pass

class FinancialMovementResponse(FinancialMovementBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class FinancialMovementList(BaseModel):
    id: int
    movement_type: MovementType
    category: MovementCategory
    amount: Decimal
    description: Optional[str]
    movement_date: datetime
    
    class Config:
        from_attributes = True

class CashFlowSummary(BaseModel):
    period_start: datetime
    period_end: datetime
    total_income: Decimal
    total_expenses: Decimal
    net_result: Decimal
    balance: Decimal

class ProfitReport(BaseModel):
    period_start: datetime
    period_end: datetime
    revenue: Decimal
    costs: Decimal
    gross_profit: Decimal
    expenses: Decimal
    net_profit: Decimal
    margin_percent: Decimal

class ProductProfitability(BaseModel):
    product_id: int
    product_name: str
    total_sales: Decimal
    total_cost: Decimal
    profit: Decimal
    margin_percent: Decimal

class ServiceProfitability(BaseModel):
    service_id: int
    service_name: str
    total_appointments: Decimal
    total_revenue: Decimal
    total_cost: Decimal
    profit: Decimal
    margin_percent: Decimal

class DashboardSummary(BaseModel):
    total_revenue: Decimal
    total_expenses: Decimal
    net_profit: Decimal
    pending_orders: int
    pending_appointments: int
    low_stock_items: int
    recent_transactions: list