from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.core.logger import logger

from app.api.middleware.error_handler import setup_error_handlers
from app.api.routes.drugs import router as drugs_router
from app.api.routes.admin import router as admin_router
# from app.api.routes.auth import router as auth_router # TODO: Ensure auth exists
# from app.api.routes.predictions import router as predictions_router # TODO: Ensure predictions exists

# ... existing code ...

app = FastAPI(...)

# CORS must be first
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the Resilience Tier
setup_error_handlers(app)

# Sub-routers
app.include_router(drugs_router, prefix="/api/v1/drugs", tags=["drugs"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
# ... rest of routers ...
