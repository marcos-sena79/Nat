from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class CostSheetItem(Base):
    __tablename__ = "cost_sheet_items"
    
    id = Column(Integer, primary_key=True, index=True)
    cost_sheet_id = Column(Integer, ForeignKey("cost_sheets.id"), nullable=False)
    supply_id = Column(Integer, ForeignKey("supplies.id"), nullable=False)
    quantity_used = Column(Numeric(10, 4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    cost_sheet = relationship("CostSheet", back_populates="items")
    supply = relationship("Supply", back_populates="cost_sheet_items")