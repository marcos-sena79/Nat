from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class AppointmentStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"

class ReservationStatus(str, enum.Enum):
    TEMPORARY = "temporary"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("client_profiles.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    professional_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.PENDING)
    reservation_status = Column(Enum(ReservationStatus), default=ReservationStatus.TEMPORARY)
    deposit_paid = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    notes = Column(Text)
    order_id = Column(Integer, ForeignKey("orders.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    client = relationship("ClientProfile", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")
    professional = relationship("User")
    order = relationship("Order", back_populates="appointments")
    medical_record = relationship("MedicalRecord", back_populates="appointment", uselist=False)
    home_visit = relationship("HomeVisit", back_populates="appointment", uselist=False)