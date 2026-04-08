import time
from typing import Dict, Tuple
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        # In-memory store: { ip: { endpoint: (count, reset_time) } }
        self.store: Dict[str, Dict[str, Tuple[int, float]]] = {}
        
        # Rules: (requests, period_seconds)
        self.rules = {
            "/api/v1/auth/google": (10, 60),
            "/api/v1/predictions/check": (20, 60),
            "/api/v1/upload": (5, 60),
            "default": (100, 60)
        }

    async def dispatch(self, request: Request, call_next):
        ip = request.client.host
        path = request.url.path
        
        # Determine applicable rule
        limit, period = self.rules.get(path, self.rules["default"])
        
        now = time.time()
        
        # Initialize store for IP
        if ip not in self.store:
            self.store[ip] = {}
            
        current_count, reset_time = self.store[ip].get(path, (0, now + period))
        
        # Reset if period expired
        if now > reset_time:
            current_count = 0
            reset_time = now + period
            
        if current_count >= limit:
            retry_after = int(reset_time - now)
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "rate_limit_exceeded",
                    "message": "Too many clinical requests. Please wait.",
                    "retry_after": retry_after
                },
                headers={
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(reset_time))
                }
            )
            
        # Increment and proceed
        self.store[ip][path] = (current_count + 1, reset_time)
        
        response = await call_next(request)
        
        # Add headers to response
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(limit - (current_count + 1))
        response.headers["X-RateLimit-Reset"] = str(int(reset_time))
        
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Production Hardening Headers
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'; object-src 'none';"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response

class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, max_size_bytes: int = 11 * 1024 * 1024): # 11MB
        super().__init__(app)
        self.max_size_bytes = max_size_bytes

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.max_size_bytes:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={
                    "error": "payload_too_large",
                    "message": f"Maximum allowed payload is {self.max_size_bytes / (1024*1024)}MB"
                }
            )
        return await call_next(request)
