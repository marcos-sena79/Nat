from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class SupplyPurchase(Base):
    __tablename__ = "supply_purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    supply_id = Column(Integer, ForeignKey("supplies.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_cost = Column(Numeric(10, 2), nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=False)
    supplier = Column(String)
    invoice_number = Column(String)
    notes = Column(Text)
    purchase_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    supply = relationship("Supply", back_populates="purchases")