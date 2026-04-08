import sys
from loguru import logger
from app.core.config import settings

def setup_logger():
    # Remove default handler
    logger.remove()

    # Console handler
    log_level = "WARNING" if settings.ENVIRONMENT == "production" else "INFO"
    custom_format = "{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{line} | {message}"

    logger.add(
        sys.stdout,
        level=log_level,
        format=custom_format,
        colorize=True
    )

    # File handler for all logs
    logger.add(
        "logs/app.log",
        rotation="10 MB",
        retention="30 days",
        format=custom_format,
        level="INFO"
    )

    # File handler for errors
    logger.add(
        "logs/errors.log",
        format=custom_format,
        level="ERROR"
    )

setup_logger()
