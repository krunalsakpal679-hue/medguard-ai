from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Base
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "MedGuard AI"
    
    # Database
    MONGO_URI: str = "mongodb://localhost:27017/medguard"
    
    # Security
    SECRET_KEY: str = "medguard_internal_super_secret_key_898m"
    ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # Infrastructure
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    STORAGE_PROVIDER: str = "local" # local, s3, firebase
    
    # Optional Cloud Providers
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: Optional[str] = "us-east-1"
    S3_BUCKET: Optional[str] = "medguard-assets"
    FIREBASE_CREDENTIALS: Optional[str] = None

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
