from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class PaymentMethod(str, enum.Enum):
    PIX = "pix"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    CASH = "cash"
    TRANSFER = "transfer"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"

class PaymentOrigin(str, enum.Enum):
    ORDER = "order"
    APPOINTMENT = "appointment"
    DEPOSIT = "deposit"

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    origin = Column(Enum(PaymentOrigin), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    method = Column(Enum(PaymentMethod), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    fee_amount = Column(Numeric(10, 2), default=0)
    infinitepay_id = Column(String)
    receipt_url = Column(String)
    paid_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="payment")
    appointment = relationship("Appointment")