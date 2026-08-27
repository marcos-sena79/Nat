from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
from ...core.database import get_db
from ...core.security import get_current_active_user, get_current_admin_user
from ...models.supply import Supply
from ...models.supply_purchase import SupplyPurchase
from ...schemas.supply import (
    SupplyCreate, SupplyResponse, SupplyList,
    SupplyPurchaseCreate, SupplyPurchaseResponse,
    StockAdjustment
)

router = APIRouter()

@router.get("/supplies", response_model=List[SupplyList])
def list_supplies(
    category: Optional[str] = None,
    search: Optional[str] = None,
    low_stock: bool = False,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    query = db.query(Supply)
    
    if category:
        query = query.filter(Supply.category == category)
    
    if search:
        query = query.filter(Supply.name.ilike(f"%{search}%"))
    
    if low_stock:
        query = query.filter(Supply.current_stock <= Supply.min_stock)
    
    supplies = query.all()
    return supplies

@router.get("/supplies/{supply_id}", response_model=SupplyResponse)
def get_supply(
    supply_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    supply = db.query(Supply).filter(Supply.id == supply_id).first()
    if not supply:
        raise HTTPException(status_code=404, detail="Supply not found")
    return supply

@router.post("/supplies", response_model=SupplyResponse)
def create_supply(
    supply: SupplyCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_supply = Supply(**supply.dict())
    db.add(db_supply)
    db.commit()
    db.refresh(db_supply)
    return db_supply

@router.put("/supplies/{supply_id}", response_model=SupplyResponse)
def update_supply(
    supply_id: int,
    supply: SupplyCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_supply = db.query(Supply).filter(Supply.id == supply_id).first()
    if not db_supply:
        raise HTTPException(status_code=404, detail="Supply not found")
    
    for field, value in supply.dict(exclude_unset=True).items():
        setattr(db_supply, field, value)
    
    db.commit()
    db.refresh(db_supply)
    return db_supply

@router.post("/supplies/{supply_id}/purchases", response_model=SupplyPurchaseResponse)
def record_purchase(
    supply_id: int,
    purchase: SupplyPurchaseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    supply = db.query(Supply).filter(Supply.id == supply_id).first()
    if not supply:
        raise HTTPException(status_code=404, detail="Supply not found")
    
    # Calculate unit cost
    unit_cost = purchase.total_cost / purchase.quantity
    
    # Update average cost using weighted average
    total_quantity = supply.current_stock + purchase.quantity
    if total_quantity > 0:
        new_average_cost = (
            (supply.average_cost * supply.current_stock) + 
            (unit_cost * purchase.quantity)
        ) / total_quantity
    else:
        new_average_cost = unit_cost
    
    # Update supply
    supply.current_stock += purchase.quantity
    supply.average_cost = new_average_cost
    
    # Create purchase record
    db_purchase = SupplyPurchase(
        supply_id=supply_id,
        quantity=purchase.quantity,
        total_cost=purchase.total_cost,
        unit_cost=unit_cost,
        supplier=purchase.supplier,
        invoice_number=purchase.invoice_number,
        notes=purchase.notes
    )
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    
    return db_purchase

@router.post("/supplies/adjust-stock", response_model=SupplyResponse)
def adjust_stock(
    adjustment: StockAdjustment,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    supply = db.query(Supply).filter(Supply.id == adjustment.supply_id).first()
    if not supply:
        raise HTTPException(status_code=404, detail="Supply not found")
    
    new_stock = supply.current_stock + adjustment.adjustment
    if new_stock < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock cannot be negative"
        )
    
    supply.current_stock = new_stock
    db.commit()
    db.refresh(supply)
    return supply

@router.get("/supplies/{supply_id}/purchases", response_model=List[SupplyPurchaseResponse])
def list_purchases(
    supply_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    purchases = db.query(SupplyPurchase).filter(
        SupplyPurchase.supply_id == supply_id
    ).order_by(SupplyPurchase.purchase_date.desc()).all()
    return purchases