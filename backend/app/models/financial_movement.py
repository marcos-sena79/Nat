from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class MovementType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"

class MovementCategory(str, enum.Enum):
    # Income
    SALE = "sale"
    DEPOSIT = "deposit"
    SERVICE_PAYMENT = "service_payment"
    REFUND = "refund"
    ADJUSTMENT_IN = "adjustment_in"
    
    # Expenses
    SUPPLY_PURCHASE = "supply_purchase"
    RENT = "rent"
    UTILITIES = "utilities"
    INTERNET = "internet"
    TRANSPORT = "transport"
    MARKETING = "marketing"
    FEES = "fees"
    OTHER_EXPENSE = "other_expense"
    ADJUSTMENT_OUT = "adjustment_out"

class FinancialMovement(Base):
    __tablename__ = "financial_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    movement_type = Column(Enum(MovementType), nullable=False)
    category = Column(Enum(MovementCategory), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    description = Column(Text)
    reference_id = Column(Integer)  # ID of related order, appointment, etc.
    reference_type = Column(String)  # order, appointment, manual
    payment_method = Column(String)
    status = Column(String, default="completed")
    notes = Column(Text)
    movement_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    creator = relationship("User")