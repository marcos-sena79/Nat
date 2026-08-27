from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class DeparturePoint(Base):
    __tablename__ = "departure_points"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    home_visits = relationship("HomeVisit", back_populates="departure_point")