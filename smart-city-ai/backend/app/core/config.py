import os
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URI: str = Field(default="")
    DATABASE_NAME: str = Field(default="smart_city_ai")
    
    # SMTP Settings (Gmail, Mailtrap, etc.)
    SMTP_HOST: str = Field(default="")
    SMTP_PORT: int = Field(default=587)
    SMTP_USER: str = Field(default="")
    SMTP_PASSWORD: str = Field(default="")
    SMTP_FROM: str = Field(default="alerts@smartcity.gov")
    
    # File storage paths
    UPLOAD_DIR: str = Field(default="uploads")
    STATIC_DIR: str = Field(default="static")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure uploads and static directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.STATIC_DIR, exist_ok=True)
