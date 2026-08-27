from sqlalchemy import Column, Integer, String, DateTime, Numeric, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    average_consumption_kmpl = Column(Numeric(5, 2), nullable=False)
    fuel_type = Column(String, nullable=False)
    fuel_price_per_liter = Column(Numeric(10, 2), nullable=False)
    additional_cost_per_km = Column(Numeric(10, 2), default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    home_visits = relationship("HomeVisit", back_populates="vehicle")