import time
import psutil
import functools
import traceback
from typing import Any, Dict, Callable
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential
from motor.motor_asyncio import AsyncIOMotorDatabase

def timed(func: Callable):
    """
    Decorator for tracking execution latency of clinical functions.
    """
    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = await func(*args, **kwargs)
        end = time.perf_counter()
        logger.debug(f"LATENCY | {func.__name__} | {round((end - start) * 1000, 2)}ms")
        return result

    @functools.wraps(func)
    def sync_wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        logger.debug(f"LATENCY | {func.__name__} | {round((end - start) * 1000, 2)}ms")
        return result

    return async_wrapper if functools.iscoroutinefunction(func) else sync_wrapper

class DBQueryLogger:
    """
    Context manager to profile and detect slow MongoDB operations.
    """
    def __init__(self, operation: str, threshold_ms: int = 100):
        self.operation = operation
        self.threshold = threshold_ms
        self.start_time = None

    async def __aenter__(self):
        self.start_time = time.perf_counter()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        duration = (time.perf_counter() - self.start_time) * 1000
        if duration > self.threshold:
            logger.warning(f"SLOW_QUERY | {self.operation} | {round(duration, 2)}ms | Threshold: {self.threshold}ms")

def get_memory_usage() -> Dict[str, Any]:
    """
    Returns high-level memory metrics for the runtime process.
    """
    process = psutil.Process()
    mem_info = process.memory_info()
    return {
        "rss_mb": round(mem_info.rss / 1024 / 1024, 2),
        "vms_mb": round(mem_info.vms / 1024 / 1024, 2),
        "percent": round(process.memory_percent(), 2)
    }

async def health_check_db(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
    """
    Directly pings the clinical database to verify connectivity and latency.
    """
    try:
        start = time.perf_counter()
        await db.command("ping")
        latency = (time.perf_counter() - start) * 1000
        return {"status": "healthy", "latency_ms": round(latency, 2)}
    except Exception as e:
        return {"status": "degraded", "error": str(e)}

def format_exception(exc: Exception) -> str:
    """
    Formats a full exception traceback for clinical logging.
    """
    return "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
