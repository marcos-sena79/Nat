from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.v1 import api_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API para plataforma de Body Piercing e Pinturas em Tecido",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to Body Piercing Platform API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}