from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ...core.database import get_db
from ...core.security import get_current_active_user, get_current_admin_user
from ...models.product import Product
from ...models.product_variation import ProductVariation
from ...models.product_image import ProductImage
from ...schemas.product import (
    ProductCreate, ProductResponse, ProductList,
    ProductVariationCreate, ProductVariationResponse
)

router = APIRouter()

@router.get("/products", response_model=List[ProductList])
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)
    
    if category:
        query = query.filter(Product.category == category)
    
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/products", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_product = Product(
        name=product.name,
        category=product.category,
        description=product.description,
        base_price=product.base_price,
        stock=product.stock,
        min_stock=product.min_stock,
        is_active=product.is_active,
        is_eligible_for_piercing=product.is_eligible_for_piercing
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Add variations
    for variation in product.variations:
        db_variation = ProductVariation(
            product_id=db_product.id,
            attribute=variation.attribute,
            value=variation.value,
            sku=variation.sku,
            price=variation.price,
            stock=variation.stock,
            is_eligible_for_piercing=variation.is_eligible_for_piercing
        )
        db.add(db_variation)
    
    # Add images
    for image in product.images:
        db_image = ProductImage(
            product_id=db_product.id,
            url=image.url,
            alt_text=image.alt_text,
            is_primary=image.is_primary,
            sort_order=image.sort_order
        )
        db.add(db_image)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for field, value in product.dict(exclude_unset=True).items():
        if field not in ["variations", "images"]:
            setattr(db_product, field, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db_product.is_active = False
    db.commit()
    return {"message": "Product deactivated successfully"}

@router.get("/products/{product_id}/variations", response_model=List[ProductVariationResponse])
def list_product_variations(product_id: int, db: Session = Depends(get_db)):
    variations = db.query(ProductVariation).filter(
        ProductVariation.product_id == product_id,
        ProductVariation.is_active == True
    ).all()
    return variations

@router.post("/products/{product_id}/variations", response_model=ProductVariationResponse)
def create_product_variation(
    product_id: int,
    variation: ProductVariationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_variation = ProductVariation(
        product_id=product_id,
        attribute=variation.attribute,
        value=variation.value,
        sku=variation.sku,
        price=variation.price,
        stock=variation.stock,
        is_eligible_for_piercing=variation.is_eligible_for_piercing
    )
    db.add(db_variation)
    db.commit()
    db.refresh(db_variation)
    return db_variation