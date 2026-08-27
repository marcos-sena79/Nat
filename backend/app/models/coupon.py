from sqlalchemy import Column, Integer, String, DateTime, Numeric, Boolean, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class DiscountType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"

class CouponStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    EXPIRED = "expired"
    EXHAUSTED = "exhausted"

class Coupon(Base):
    __tablename__ = "coupons"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    discount_type = Column(Enum(DiscountType), nullable=False)
    discount_value = Column(Numeric(10, 2), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    max_uses = Column(Integer)
    max_uses_per_client = Column(Integer, default=1)
    minimum_order_value = Column(Numeric(10, 2))
    is_cumulative = Column(Boolean, default=False)
    status = Column(Enum(CouponStatus), default=CouponStatus.DRAFT)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    rules = relationship("CouponRule", back_populates="coupon")
    usages = relationship("CouponUsage", back_populates="coupon")
    orders = relationship("Order", back_populates="coupon")