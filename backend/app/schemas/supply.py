from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class SupplyBase(BaseModel):
    name: str
    category: str
    unit: str
    supplier: Optional[str] = None
    supplier_code: Optional[str] = None
    min_stock: int = 0
    current_stock: int = 0
    expiration_date: Optional[datetime] = None
    notes: Optional[str] = None

class SupplyCreate(SupplyBase):
    pass

class SupplyResponse(SupplyBase):
    id: int
    average_cost: Decimal
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SupplyList(BaseModel):
    id: int
    name: str
    category: str
    unit: str
    current_stock: int
    min_stock: int
    average_cost: Decimal
    
    class Config:
        from_attributes = True

class SupplyPurchaseBase(BaseModel):
    supply_id: int
    quantity: int
    total_cost: Decimal
    supplier: Optional[str] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None

class SupplyPurchaseCreate(SupplyPurchaseBase):
    pass

class SupplyPurchaseResponse(SupplyPurchaseBase):
    id: int
    unit_cost: Decimal
    purchase_date: datetime
    
    class Config:
        from_attributes = True

class StockAdjustment(BaseModel):
    supply_id: int
    adjustment: int  # Positive or negative
    reason: str