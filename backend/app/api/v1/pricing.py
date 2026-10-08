from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
from ...core.database import get_db
from ...core.security import get_current_admin_user
from ...models.cost_sheet import CostSheet, ItemType
from ...models.cost_sheet_item import CostSheetItem
from ...models.supply import Supply
from ...schemas.cost_sheet import (
    CostSheetCreate, CostSheetResponse, CostSheetList,
    CostSheetItemCreate, CostSheetItemResponse,
    PriceSimulation
)

router = APIRouter()

@router.get("/cost-sheets", response_model=List[CostSheetList])
def list_cost_sheets(
    item_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    query = db.query(CostSheet)
    
    if item_type:
        query = query.filter(CostSheet.item_type == item_type)
    
    cost_sheets = query.order_by(CostSheet.created_at.desc()).all()
    results = []
    for cost_sheet in cost_sheets:
        details = get_cost_sheet(cost_sheet.id, db, current_user)
        results.append({
            "id": cost_sheet.id,
            "item_type": cost_sheet.item_type,
            "product_id": cost_sheet.product_id,
            "service_id": cost_sheet.service_id,
            "product_name": cost_sheet.product.name if cost_sheet.product else None,
            "service_name": cost_sheet.service.name if cost_sheet.service else None,
            "total_cost": details.total_cost,
            "suggested_price": details.suggested_price,
        })
    return results

@router.get("/cost-sheets/{cost_sheet_id}", response_model=CostSheetResponse)
def get_cost_sheet(
    cost_sheet_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    cost_sheet = db.query(CostSheet).filter(CostSheet.id == cost_sheet_id).first()
    if not cost_sheet:
        raise HTTPException(status_code=404, detail="Cost sheet not found")
    
    # Calculate costs
    total_material_cost = Decimal("0.00")
    for item in cost_sheet.items:
        supply = db.query(Supply).filter(Supply.id == item.supply_id).first()
        if supply:
            total_material_cost += item.quantity_used * supply.average_cost
    
    labor_cost = Decimal("0.00")
    if cost_sheet.production_time_hours and cost_sheet.hourly_labor_cost:
        labor_cost = cost_sheet.production_time_hours * cost_sheet.hourly_labor_cost
    
    indirect_costs = Decimal("0.00")
    if cost_sheet.indirect_cost_value:
        indirect_costs = cost_sheet.indirect_cost_value
    elif cost_sheet.indirect_cost_percent:
        indirect_costs = (total_material_cost + labor_cost) * (cost_sheet.indirect_cost_percent / 100)
    
    total_cost = total_material_cost + labor_cost + indirect_costs
    
    # Calculate prices
    payment_fee_percent = cost_sheet.payment_fee_percent or Decimal("0")
    desired_margin_percent = cost_sheet.desired_margin_percent or Decimal("0")
    
    minimum_price = total_cost / (1 - (payment_fee_percent / 100))
    suggested_price = total_cost / (1 - (desired_margin_percent / 100) - (payment_fee_percent / 100))
    
    cost_sheet_response = CostSheetResponse.from_orm(cost_sheet)
    cost_sheet_response.total_material_cost = total_material_cost
    cost_sheet_response.labor_cost = labor_cost
    cost_sheet_response.total_cost = total_cost
    cost_sheet_response.minimum_price = minimum_price
    cost_sheet_response.suggested_price = suggested_price
    
    return cost_sheet_response

@router.post("/cost-sheets", response_model=CostSheetResponse)
def create_cost_sheet(
    cost_sheet: CostSheetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    # Validate item exists
    if cost_sheet.item_type == ItemType.PRODUCT:
        from ...models.product import Product
        product = db.query(Product).filter(Product.id == cost_sheet.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
    elif cost_sheet.item_type == ItemType.SERVICE:
        from ...models.service import Service
        service = db.query(Service).filter(Service.id == cost_sheet.service_id).first()
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
    
    # Create cost sheet
    db_cost_sheet = CostSheet(
        item_type=cost_sheet.item_type,
        product_id=cost_sheet.product_id,
        service_id=cost_sheet.service_id,
        production_time_hours=cost_sheet.production_time_hours,
        hourly_labor_cost=cost_sheet.hourly_labor_cost,
        indirect_cost_value=cost_sheet.indirect_cost_value,
        indirect_cost_percent=cost_sheet.indirect_cost_percent,
        payment_fee_percent=cost_sheet.payment_fee_percent,
        desired_margin_percent=cost_sheet.desired_margin_percent,
        notes=cost_sheet.notes
    )
    db.add(db_cost_sheet)
    db.commit()
    db.refresh(db_cost_sheet)
    
    # Add items
    for item in cost_sheet.items:
        db_item = CostSheetItem(
            cost_sheet_id=db_cost_sheet.id,
            supply_id=item.supply_id,
            quantity_used=item.quantity_used
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_cost_sheet)
    
    return get_cost_sheet(db_cost_sheet.id, db, current_user)

@router.put("/cost-sheets/{cost_sheet_id}", response_model=CostSheetResponse)
def update_cost_sheet(
    cost_sheet_id: int,
    cost_sheet: CostSheetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_cost_sheet = db.query(CostSheet).filter(CostSheet.id == cost_sheet_id).first()
    if not db_cost_sheet:
        raise HTTPException(status_code=404, detail="Cost sheet not found")
    
    # Update fields
    for field, value in cost_sheet.dict(exclude_unset=True).items():
        if field != "items":
            setattr(db_cost_sheet, field, value)
    
    # Update items
    if cost_sheet.items:
        # Delete existing items
        db.query(CostSheetItem).filter(CostSheetItem.cost_sheet_id == cost_sheet_id).delete()
        
        # Add new items
        for item in cost_sheet.items:
            db_item = CostSheetItem(
                cost_sheet_id=cost_sheet_id,
                supply_id=item.supply_id,
                quantity_used=item.quantity_used
            )
            db.add(db_item)
    
    db.commit()
    db.refresh(db_cost_sheet)
    
    return get_cost_sheet(cost_sheet_id, db, current_user)

@router.post("/simulate-price", response_model=PriceSimulation)
def simulate_price(
    cost_sheet: CostSheetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    # Calculate costs
    total_material_cost = Decimal("0.00")
    for item in cost_sheet.items:
        supply = db.query(Supply).filter(Supply.id == item.supply_id).first()
        if supply:
            total_material_cost += item.quantity_used * supply.average_cost
    
    labor_cost = Decimal("0.00")
    if cost_sheet.production_time_hours and cost_sheet.hourly_labor_cost:
        labor_cost = cost_sheet.production_time_hours * cost_sheet.hourly_labor_cost
    
    indirect_costs = Decimal("0.00")
    if cost_sheet.indirect_cost_value:
        indirect_costs = cost_sheet.indirect_cost_value
    elif cost_sheet.indirect_cost_percent:
        indirect_costs = (total_material_cost + labor_cost) * (cost_sheet.indirect_cost_percent / 100)
    
    payment_fee_percent = cost_sheet.payment_fee_percent or Decimal("0")
    desired_margin_percent = cost_sheet.desired_margin_percent or Decimal("0")
    
    total_cost = total_material_cost + labor_cost + indirect_costs
    payment_fees = total_cost * (payment_fee_percent / 100)
    
    minimum_price = total_cost / (1 - (payment_fee_percent / 100))
    suggested_price = total_cost / (1 - (desired_margin_percent / 100) - (payment_fee_percent / 100))
    
    estimated_profit = suggested_price - total_cost - (suggested_price * (payment_fee_percent / 100))
    estimated_margin_percent = (estimated_profit / suggested_price * 100) if suggested_price > 0 else Decimal("0")
    
    return PriceSimulation(
        supply_costs=total_material_cost,
        labor_cost=labor_cost,
        indirect_costs=indirect_costs,
        payment_fees=payment_fees,
        desired_margin=desired_margin_percent,
        minimum_price=minimum_price,
        suggested_price=suggested_price,
        estimated_profit=estimated_profit,
        estimated_margin_percent=estimated_margin_percent
    )