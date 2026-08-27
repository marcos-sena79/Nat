from sqlalchemy import Column, Integer, String, DateTime, Numeric, Boolean, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class ServiceType(str, enum.Enum):
    PIERCING = "piercing"
    JEWELRY_CHANGE = "jewelry_change"
    EVALUATION = "evaluation"
    AFTERCARE = "aftercare"
    HOME_VISIT = "home_visit"

class PaymentPolicy(str, enum.Enum):
    FULL = "full"
    DEPOSIT_ONLY = "deposit_only"
    FREE = "free"

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    service_type = Column(Enum(ServiceType), nullable=False)
    description = Column(Text)
    duration_minutes = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    deposit_amount = Column(Numeric(10, 2), default=0)
    payment_policy = Column(Enum(PaymentPolicy), default=PaymentPolicy.FULL)
    contraindications = Column(Text)
    preparation_guidelines = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    appointments = relationship("Appointment", back_populates="service")
    cost_sheet = relationship("CostSheet", back_populates="service", uselist=False)
    compatible_jewelry = relationship("JewelryServiceCompatibility", back_populates="service")