from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.core.logger import logger

from app.api.middleware.error_handler import setup_error_handlers
from app.api.middleware.security import (
    RateLimitMiddleware, 
    SecurityHeadersMiddleware, 
    RequestSizeLimitMiddleware
)

from app.api.routes.drugs import router as drugs_router
from app.api.routes.admin import router as admin_router
from app.api.routes.reports import router as reports_router
from app.api.routes.websocket import router as ws_router

app = FastAPI(title="MedGuard AI Clinical API", version="1.0.0")

# Security Chain (Order is critical)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestSizeLimitMiddleware)
app.add_middleware(RateLimitMiddleware)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_error_handlers(app)

# Sub-routers
app.include_router(drugs_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")
app.include_router(ws_router)
