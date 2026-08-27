from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from ..models.order import OrderStatus

class OrderItemBase(BaseModel):
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    service_id: Optional[int] = None
    quantity: int
    unit_price: Decimal
    discount_amount: Decimal = Decimal("0.00")
    notes: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    cost_price: Optional[Decimal] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    subtotal: Decimal
    shipping_cost: Decimal = Decimal("0.00")
    discount_amount: Decimal = Decimal("0.00")
    coupon_id: Optional[int] = None
    total: Decimal
    status: OrderStatus = OrderStatus.PENDING
    checkout_expires_at: Optional[datetime] = None
    notes: Optional[str] = None

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: Optional[str] = None
    coupon_code: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    client_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []
    
    class Config:
        from_attributes = True

class OrderList(BaseModel):
    id: int
    total: Decimal
    status: OrderStatus
    items_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CartItem(BaseModel):
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    service_id: Optional[int] = None
    quantity: int = 1

class Cart(BaseModel):
    items: List[CartItem]
    coupon_code: Optional[str] = None