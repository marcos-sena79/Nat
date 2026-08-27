from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from ...core.database import get_db
from ...core.security import get_current_active_user, get_current_admin_user
from ...models.order import Order, OrderItem, OrderStatus
from ...models.product import Product, ProductVariation
from ...models.service import Service
from ...models.coupon import Coupon, CouponUsage
from ...schemas.order import (
    OrderCreate, OrderResponse, OrderList,
    CartItem, Cart
)

router = APIRouter()

@router.post("/cart/validate", response_model=OrderResponse)
def validate_cart(
    cart: Cart,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    items = []
    subtotal = Decimal("0.00")
    
    for cart_item in cart.items:
        if cart_item.product_id:
            product = db.query(Product).filter(
                Product.id == cart_item.product_id,
                Product.is_active == True
            ).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {cart_item.product_id} not found")
            
            if product.stock < cart_item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for {product.name}"
                )
            
            price = product.base_price
            
            if cart_item.variation_id:
                variation = db.query(ProductVariation).filter(
                    ProductVariation.id == cart_item.variation_id,
                    ProductVariation.product_id == product.id
                ).first()
                if not variation:
                    raise HTTPException(status_code=404, detail="Variation not found")
                
                if variation.stock < cart_item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Insufficient stock for variation"
                    )
                
                if variation.price:
                    price = variation.price
            
            items.append({
                "product_id": product.id,
                "variation_id": cart_item.variation_id,
                "quantity": cart_item.quantity,
                "unit_price": price
            })
            subtotal += price * cart_item.quantity
        
        elif cart_item.service_id:
            service = db.query(Service).filter(
                Service.id == cart_item.service_id,
                Service.is_active == True
            ).first()
            if not service:
                raise HTTPException(status_code=404, detail=f"Service {cart_item.service_id} not found")
            
            items.append({
                "service_id": service.id,
                "quantity": 1,
                "unit_price": service.price
            })
            subtotal += service.price
    
    # Apply coupon if provided
    discount_amount = Decimal("0.00")
    coupon_id = None
    
    if cart.coupon_code:
        coupon = db.query(Coupon).filter(
            Coupon.code == cart.coupon_code,
            Coupon.status == "active"
        ).first()
        
        if coupon:
            # Validate coupon
            now = datetime.utcnow()
            if coupon.start_date <= now <= coupon.end_date:
                # Check usage limits
                usage_count = db.query(CouponUsage).filter(
                    CouponUsage.coupon_id == coupon.id
                ).count()
                
                if coupon.max_uses is None or usage_count < coupon.max_uses:
                    # Calculate discount
                    if coupon.discount_type == "percentage":
                        discount_amount = subtotal * (coupon.discount_value / 100)
                    else:
                        discount_amount = min(coupon.discount_value, subtotal)
                    
                    coupon_id = coupon.id
    
    total = subtotal - discount_amount
    
    return {
        "items": items,
        "subtotal": subtotal,
        "discount_amount": discount_amount,
        "coupon_id": coupon_id,
        "total": total,
        "status": OrderStatus.PENDING
    }

@router.post("/orders", response_model=OrderResponse)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    # Validate and create order
    validated_order = validate_cart(
        Cart(items=order.items, coupon_code=order.coupon_code),
        db,
        current_user
    )
    
    # Create order
    db_order = Order(
        client_id=current_user.client_profile.id,
        subtotal=validated_order["subtotal"],
        discount_amount=validated_order["discount_amount"],
        coupon_id=validated_order["coupon_id"],
        total=validated_order["total"],
        checkout_expires_at=datetime.utcnow() + timedelta(minutes=30),
        notes=order.notes
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Create order items
    for item_data in validated_order["items"]:
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item_data.get("product_id"),
            variation_id=item_data.get("variation_id"),
            service_id=item_data.get("service_id"),
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"]
        )
        db.add(db_item)
    
    # Record coupon usage
    if validated_order["coupon_id"]:
        db_usage = CouponUsage(
            coupon_id=validated_order["coupon_id"],
            order_id=db_order.id,
            client_id=current_user.client_profile.id,
            discount_applied=validated_order["discount_amount"]
        )
        db.add(db_usage)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/orders", response_model=List[OrderList])
def list_orders(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    query = db.query(Order)
    
    if current_user.role == "client":
        query = query.filter(Order.client_id == current_user.client_profile.id)
    
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.created_at.desc()).all()
    return orders

@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check access permission
    if current_user.role == "client" and order.client_id != current_user.client_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return order

@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = new_status
    db.commit()
    return {"message": "Order status updated successfully"}