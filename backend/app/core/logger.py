import os
import sys
from loguru import logger
from app.core.config import settings

def setup_logging():
    # Ensure log directory
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Clear default
    logger.remove()

    # Console output level mapping
    log_level = "DEBUG" if settings.ENVIRONMENT == "development" else "INFO"
    
    # Console Handler
    logger.add(
        sys.stdout, 
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=log_level
    )

    # File Handler (all logs)
    logger.add(
        "logs/app.log",
        rotation="10 MB",
        retention="30 days",
        level="INFO",
        compression="zip"
    )

    # Error Handler
    logger.add(
        "logs/errors.log",
        level="ERROR",
        backtrace=True,
        diagnose=True
    )

setup_logging()
