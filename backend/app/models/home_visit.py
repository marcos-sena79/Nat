from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class HomeVisit(Base):
    __tablename__ = "home_visits"
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True, nullable=False)
    departure_point_id = Column(Integer, ForeignKey("departure_points.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    client_address = Column(Text, nullable=False)
    client_latitude = Column(Numeric(10, 8))
    client_longitude = Column(Numeric(11, 8))
    distance_km = Column(Numeric(10, 2))
    is_round_trip = Column(Boolean, default=True)
    fuel_cost = Column(Numeric(10, 2))
    additional_cost_per_km = Column(Numeric(10, 2))
    fixed_costs = Column(Numeric(10, 2))
    total_travel_cost = Column(Numeric(10, 2))
    suggested_fee = Column(Numeric(10, 2))
    charged_fee = Column(Numeric(10, 2))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    appointment = relationship("Appointment", back_populates="home_visit")
    departure_point = relationship("DeparturePoint")
    vehicle = relationship("Vehicle")