from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class ItemType(str, enum.Enum):
    PRODUCT = "product"
    SERVICE = "service"

class CostSheet(Base):
    __tablename__ = "cost_sheets"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), unique=True)
    service_id = Column(Integer, ForeignKey("services.id"), unique=True)
    item_type = Column(Enum(ItemType), nullable=False)
    production_time_hours = Column(Numeric(5, 2))
    hourly_labor_cost = Column(Numeric(10, 2))
    indirect_cost_value = Column(Numeric(10, 2))
    indirect_cost_percent = Column(Numeric(5, 2))
    payment_fee_percent = Column(Numeric(5, 2))
    desired_margin_percent = Column(Numeric(5, 2))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="cost_sheet")
    service = relationship("Service", back_populates="cost_sheet")
    items = relationship("CostSheetItem", back_populates="cost_sheet")