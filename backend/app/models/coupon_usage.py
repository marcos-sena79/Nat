from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class CouponUsage(Base):
    __tablename__ = "coupon_usages"
    
    id = Column(Integer, primary_key=True, index=True)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("client_profiles.id"), nullable=False)
    discount_applied = Column(Numeric(10, 2), nullable=False)
    used_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    coupon = relationship("Coupon", back_populates="usages")
    order = relationship("Order")
    client = relationship("ClientProfile")