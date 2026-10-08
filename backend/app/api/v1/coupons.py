from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.security import get_current_admin_user
from ...models.coupon import Coupon, CouponStatus, DiscountType
from ...models.coupon_rule import CouponRule
from ...schemas.coupon import CouponCreate, CouponList, CouponResponse

router = APIRouter()


def validate_coupon(coupon: CouponCreate) -> None:
    if not coupon.code.strip() or not coupon.name.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Coupon code and name cannot be empty",
        )
    if coupon.start_date >= coupon.end_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Coupon end_date must be after start_date",
        )
    if coupon.discount_value <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Coupon discount_value must be greater than zero",
        )
    if coupon.discount_type == DiscountType.PERCENTAGE and coupon.discount_value > 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Percentage discount cannot exceed 100",
        )
    if coupon.max_uses is not None and coupon.max_uses < 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Coupon max_uses must be greater than zero",
        )
    if coupon.max_uses_per_client < 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Coupon max_uses_per_client must be greater than zero",
        )
    if coupon.minimum_order_value is not None and coupon.minimum_order_value < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Coupon minimum_order_value cannot be negative",
        )


def coupon_payload(coupon: CouponCreate) -> dict:
    values = coupon.model_dump(exclude={"rules"})
    values["code"] = values["code"].strip().upper()
    values["name"] = values["name"].strip()
    return values


@router.get("", response_model=list[CouponList])
def list_coupons(
    coupon_status: CouponStatus | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    query = db.query(Coupon)
    if coupon_status:
        query = query.filter(Coupon.status == coupon_status)
    if search:
        query = query.filter(
            (Coupon.code.ilike(f"%{search}%"))
            | (Coupon.name.ilike(f"%{search}%"))
        )
    return query.order_by(Coupon.created_at.desc()).all()


@router.post("", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(
    coupon: CouponCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    validate_coupon(coupon)
    values = coupon_payload(coupon)
    if db.query(Coupon.id).filter(Coupon.code == values["code"]).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A coupon with this code already exists",
        )

    db_coupon = Coupon(**values)
    db.add(db_coupon)
    db.flush()
    for rule in coupon.rules:
        db.add(CouponRule(coupon_id=db_coupon.id, **rule.model_dump()))
    db.commit()
    db.refresh(db_coupon)
    return db_coupon


@router.get("/{coupon_id}", response_model=CouponResponse)
def get_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return coupon


@router.put("/{coupon_id}", response_model=CouponResponse)
def update_coupon(
    coupon_id: int,
    coupon: CouponCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    validate_coupon(coupon)
    db_coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not db_coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    values = coupon_payload(coupon)
    duplicate = db.query(Coupon.id).filter(
        Coupon.code == values["code"],
        Coupon.id != coupon_id,
    ).first()
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A coupon with this code already exists",
        )

    for field, value in values.items():
        setattr(db_coupon, field, value)

    db.query(CouponRule).filter(CouponRule.coupon_id == coupon_id).delete(
        synchronize_session=False
    )
    db.flush()
    for rule in coupon.rules:
        db.add(CouponRule(coupon_id=coupon_id, **rule.model_dump()))

    db.commit()
    db.refresh(db_coupon)
    return db_coupon


@router.put("/{coupon_id}/status", response_model=CouponList)
def update_coupon_status(
    coupon_id: int,
    new_status: CouponStatus,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    coupon.status = new_status
    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    coupon.status = CouponStatus.PAUSED
    db.commit()
