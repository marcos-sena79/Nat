from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from ..models.coupon import DiscountType, CouponStatus

class CouponRuleBase(BaseModel):
    scope: str  # product, category, service
    item_ids: Optional[str] = None  # JSON array
    exclude_shipping: bool = True
    exclude_deposit: bool = True

class CouponRuleCreate(CouponRuleBase):
    pass

class CouponRuleResponse(CouponRuleBase):
    id: int
    coupon_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CouponBase(BaseModel):
    code: str
    name: str
    discount_type: DiscountType
    discount_value: Decimal
    start_date: datetime
    end_date: datetime
    max_uses: Optional[int] = None
    max_uses_per_client: int = 1
    minimum_order_value: Optional[Decimal] = None
    is_cumulative: bool = False
    status: CouponStatus = CouponStatus.DRAFT
    notes: Optional[str] = None

class CouponCreate(CouponBase):
    rules: List[CouponRuleCreate] = []

class CouponResponse(CouponBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    rules: List[CouponRuleResponse] = []
    
    class Config:
        from_attributes = True

class CouponList(BaseModel):
    id: int
    code: str
    name: str
    discount_type: DiscountType
    discount_value: Decimal
    status: CouponStatus
    start_date: datetime
    end_date: datetime
    
    class Config:
        from_attributes = True

class CouponValidate(BaseModel):
    code: str
    cart_total: Decimal
    items: List[dict]  # List of item IDs and categories