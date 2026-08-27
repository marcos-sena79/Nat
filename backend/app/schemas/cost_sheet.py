from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from ..models.cost_sheet import ItemType

class CostSheetItemBase(BaseModel):
    supply_id: int
    quantity_used: Decimal

class CostSheetItemCreate(CostSheetItemBase):
    pass

class CostSheetItemResponse(CostSheetItemBase):
    id: int
    cost_sheet_id: int
    supply_name: Optional[str] = None
    supply_unit_cost: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class CostSheetBase(BaseModel):
    item_type: ItemType
    product_id: Optional[int] = None
    service_id: Optional[int] = None
    production_time_hours: Optional[Decimal] = None
    hourly_labor_cost: Optional[Decimal] = None
    indirect_cost_value: Optional[Decimal] = None
    indirect_cost_percent: Optional[Decimal] = None
    payment_fee_percent: Optional[Decimal] = None
    desired_margin_percent: Optional[Decimal] = None
    notes: Optional[str] = None

class CostSheetCreate(CostSheetBase):
    items: List[CostSheetItemCreate] = []

class CostSheetResponse(CostSheetBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[CostSheetItemResponse] = []
    
    # Calculated fields
    total_material_cost: Optional[Decimal] = None
    labor_cost: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    minimum_price: Optional[Decimal] = None
    suggested_price: Optional[Decimal] = None
    estimated_margin: Optional[Decimal] = None
    
    class Config:
        from_attributes = True

class CostSheetList(BaseModel):
    id: int
    item_type: ItemType
    product_name: Optional[str] = None
    service_name: Optional[str] = None
    total_cost: Optional[Decimal] = None
    suggested_price: Optional[Decimal] = None
    
    class Config:
        from_attributes = True

class PriceSimulation(BaseModel):
    supply_costs: Decimal
    labor_cost: Decimal
    indirect_costs: Decimal
    payment_fees: Decimal
    desired_margin: Decimal
    minimum_price: Decimal
    suggested_price: Decimal
    estimated_profit: Decimal
    estimated_margin_percent: Decimal