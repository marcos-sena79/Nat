from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class CouponRule(Base):
    __tablename__ = "coupon_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=False)
    scope = Column(String, nullable=False)  # product, category, service
    item_ids = Column(String)  # JSON array of IDs
    exclude_shipping = Column(Boolean, default=True)
    exclude_deposit = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    coupon = relationship("Coupon", back_populates="rules")