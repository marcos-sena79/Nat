from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # paintings, jewelry, aftercare
    description = Column(Text)
    base_price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, default=0)
    min_stock = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_eligible_for_piercing = Column(Boolean, default=False)  # Only for jewelry
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    variations = relationship("ProductVariation", back_populates="product")
    images = relationship("ProductImage", back_populates="product")
    cost_sheet = relationship("CostSheet", back_populates="product", uselist=False)
    compatible_services = relationship("JewelryServiceCompatibility", back_populates="product")