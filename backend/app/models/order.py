from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("client_profiles.id"), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    shipping_cost = Column(Numeric(10, 2), default=0)
    discount_amount = Column(Numeric(10, 2), default=0)
    coupon_id = Column(Integer, ForeignKey("coupons.id"))
    total = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    checkout_expires_at = Column(DateTime(timezone=True))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    client = relationship("ClientProfile", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    coupon = relationship("Coupon", back_populates="orders")
    appointments = relationship("Appointment", back_populates="order")
    payment = relationship("Payment", back_populates="order", uselist=False)