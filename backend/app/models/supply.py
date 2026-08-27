from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Supply(Base):
    __tablename__ = "supplies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    unit = Column(String, nullable=False)  # unit, ml, g, meter, pair, etc.
    supplier = Column(String)
    supplier_code = Column(String)
    min_stock = Column(Integer, default=0)
    current_stock = Column(Integer, default=0)
    average_cost = Column(Numeric(10, 2), default=0)
    expiration_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    purchases = relationship("SupplyPurchase", back_populates="supply")
    cost_sheet_items = relationship("CostSheetItem", back_populates="supply")