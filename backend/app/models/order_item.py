from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"))
    variation_id = Column(Integer, ForeignKey("product_variations.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0)
    cost_price = Column(Numeric(10, 2))  # Frozen cost at time of sale
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
    variation = relationship("ProductVariation")
    service = relationship("Service")