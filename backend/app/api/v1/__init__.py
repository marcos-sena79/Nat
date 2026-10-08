from fastapi import APIRouter
from .auth import router as auth_router
from .catalog import router as catalog_router
from .inventory import router as inventory_router
from .pricing import router as pricing_router
from .orders import router as orders_router
from .payments import router as payments_router
from .scheduling import router as scheduling_router
from .aftercare import router as aftercare_router
from .finance import router as finance_router
from .notifications import router as notifications_router
from .admin import router as admin_router
from .coupons import router as coupons_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(catalog_router, prefix="/catalog", tags=["Catalog"])
api_router.include_router(inventory_router, prefix="/inventory", tags=["Inventory"])
api_router.include_router(pricing_router, prefix="/pricing", tags=["Pricing"])
api_router.include_router(orders_router, prefix="/orders", tags=["Orders"])
api_router.include_router(payments_router, prefix="/payments", tags=["Payments"])
api_router.include_router(scheduling_router, prefix="/scheduling", tags=["Scheduling"])
api_router.include_router(aftercare_router, prefix="/aftercare", tags=["Aftercare"])
api_router.include_router(finance_router, prefix="/finance", tags=["Finance"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin"])
api_router.include_router(coupons_router, prefix="/coupons", tags=["Coupons"])