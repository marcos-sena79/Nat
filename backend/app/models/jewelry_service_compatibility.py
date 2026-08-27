from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class JewelryServiceCompatibility(Base):
    __tablename__ = "jewelry_service_compatibility"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="compatible_services")
    service = relationship("Service", back_populates="compatible_jewelry")