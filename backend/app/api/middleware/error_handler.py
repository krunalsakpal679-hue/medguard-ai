import uuid
import time
import traceback
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
from ...core.config import settings

class CustomHTTPException(HTTPException):
    def __init__(
        self, 
        status_code: int, 
        detail: str, 
        error_code: str = "GLOBAL_ERROR",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        self.details = details or {}

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        start_time = time.time()

        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time-MS"] = str(round(process_time, 2))
            return response

        except Exception as exc:
            return await self.handle_exception(request, exc, request_id)

    async def handle_exception(self, request: Request, exc: Exception, request_id: str):
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        error_code = "INTERNAL_SERVER_ERROR"
        message = "A critical system disturbance occurred."
        details = {}

        if isinstance(exc, CustomHTTPException):
            status_code = exc.status_code
            error_code = exc.error_code
            message = exc.detail
            details = exc.details
        elif isinstance(exc, HTTPException):
            status_code = exc.status_code
            message = exc.detail

        # Log trace for 500s or in development
        if status_code >= 500 or settings.ENVIRONMENT == "development":
            logger.error(f"Request {request_id} failed: {str(exc)}")
            logger.error(traceback.format_exc())

        error_response = {
            "error": error_code,
            "message": message,
            "request_id": request_id,
            "path": str(request.url.path),
            "timestamp": datetime.utcnow().isoformat(),
            "details": details
        }

        # Include stack trace ONLY in development
        if settings.ENVIRONMENT == "development" and status_code >= 500:
            error_response["traceback"] = traceback.format_exc().split("\n")

        return JSONResponse(status_code=status_code, content=error_response)

def setup_error_handlers(app):
    """
    Registers the error handling infrastructure to the FastAPI application.
    """
    app.add_middleware(ErrorHandlerMiddleware)
