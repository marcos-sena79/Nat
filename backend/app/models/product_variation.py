from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class ProductVariation(Base):
    __tablename__ = "product_variations"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    attribute = Column(String, nullable=False)  # color, size, material, etc.
    value = Column(String, nullable=False)
    sku = Column(String)
    price = Column(Numeric(10, 2))
    stock = Column(Integer, default=0)
    is_eligible_for_piercing = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="variations")