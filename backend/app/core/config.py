from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Body Piercing Platform"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/body_piercing_db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OAuth - Google
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    
    # OAuth - Facebook
    FACEBOOK_CLIENT_ID: Optional[str] = None
    FACEBOOK_CLIENT_SECRET: Optional[str] = None
    
    # InfinitePay
    INFINITEPAY_API_KEY: Optional[str] = None
    INFINITEPAY_WEBHOOK_SECRET: Optional[str] = None
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # S3 Storage
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_BUCKET_NAME: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    
    # WhatsApp
    WHATSAPP_API_URL: Optional[str] = None
    WHATSAPP_API_TOKEN: Optional[str] = None
    
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # AI Service
    AI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gpt-4-vision-preview"
    
    # Maps/Geocoding
    MAPS_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()