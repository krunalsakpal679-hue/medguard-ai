from pydantic_settings import BaseSettings
from typing import List
import logging
import sys

class ProductionSettings(BaseSettings):
    # Security
    DEBUG: bool = False
    RELOAD: bool = False
    DOCS_URL: str = None  # Disable Swagger in prod for security hardening
    REDOC_URL: str = None
    
    # Cookie Security
    COOKIE_SAMESITE: str = "lax"
    COOKIE_SECURE: bool = True
    COOKIE_HTTPONLY: bool = True
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 50
    
    # CORS
    # In production, this must be strictly defined
    CORS_ALLOWED_DOMAINS: List[str] = [
        "https://medguard.ai",
        "https://admin.medguard.ai",
        "https://medguard-frontend.onrender.com"
    ]

    def configure_logging(self):
        """
        Configures JSON-structured logging for production log aggregators (Loggly, DataDog, etc.)
        """
        logging.basicConfig(
            format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}',
            level=logging.INFO,
            stream=sys.stdout
        )

# Singleton instance for production orchestration
prod_config = ProductionSettings()
