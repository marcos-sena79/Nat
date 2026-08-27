from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class ProductImage(Base):
    __tablename__ = "product_images"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    url = Column(String, nullable=False)
    alt_text = Column(String)
    is_primary = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="images")