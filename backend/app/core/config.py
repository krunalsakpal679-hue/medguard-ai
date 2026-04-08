from functools import cached_property
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import EmailStr, field_validator

class Settings(BaseSettings):
    MONGO_URI: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET: str = ""
    FIREBASE_CREDENTIALS: str = ""
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "*"
    ADMIN_EMAIL: str = "admin@medguard.ai"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key_length(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v

    @cached_property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
