from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class ProductVariationBase(BaseModel):
    attribute: str
    value: str
    sku: Optional[str] = None
    price: Optional[Decimal] = None
    stock: int = 0
    is_eligible_for_piercing: bool = False

class ProductVariationCreate(ProductVariationBase):
    pass

class ProductVariationResponse(ProductVariationBase):
    id: int
    product_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductImageBase(BaseModel):
    url: str
    alt_text: Optional[str] = None
    is_primary: bool = False
    sort_order: int = 0

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageResponse(ProductImageBase):
    id: int
    product_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    base_price: Decimal
    stock: int = 0
    min_stock: int = 0
    is_active: bool = True
    is_eligible_for_piercing: bool = False

class ProductCreate(ProductBase):
    variations: List[ProductVariationCreate] = []
    images: List[ProductImageCreate] = []

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    variations: List[ProductVariationResponse] = []
    images: List[ProductImageResponse] = []
    
    class Config:
        from_attributes = True

class ProductList(BaseModel):
    id: int
    name: str
    category: str
    base_price: Decimal
    stock: int
    is_active: bool
    primary_image: Optional[str] = None
    
    class Config:
        from_attributes = True