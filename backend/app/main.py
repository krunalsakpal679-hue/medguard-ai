import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.logger import logger
from app.db.database import connect_db, close_db

import traceback

# Clinical Router Orchestration
try:
    from app.api.routes.auth import router as auth_router
    from app.api.routes.drugs import router as drugs_router
    from app.api.routes.predictions import router as predictions_router
    from app.api.routes.admin import router as admin_router
    from app.api.routes.upload import router as upload_router
    from app.api.routes.chat import router as chat_router
except Exception as e:
    logger.error(f"SYSTEM CRITICAL - ORCHESTRATION FAILURE: {e}")
    logger.error(traceback.format_exc())
    raise e

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing MedGuard API Ecosystem...")
    try:
        await connect_db()
    except Exception as e:
        logger.warning(f"Database unavailable on startup: {e}")
    yield
    await close_db()
    logger.info("System shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc"
)

# CORS - Nuclear Option: Broad and Early
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.middleware("http")
async def add_cors_header_manually(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Internal Routing Integration
# Primary (v1)
app.include_router(auth_router, prefix="/v1", tags=["Identity"])
app.include_router(drugs_router, prefix="/v1", tags=["Pharmacology"])
app.include_router(predictions_router, prefix="/v1", tags=["Analytics"])
app.include_router(admin_router, prefix="/v1", tags=["Control Plane"])
app.include_router(upload_router, prefix="/v1", tags=["Ingestion"])
app.include_router(chat_router, prefix="/v1", tags=["Assistance"])

# Legacy/Alternative (api/v1)
app.include_router(auth_router, prefix="/api/v1", tags=["Identity"])
app.include_router(drugs_router, prefix="/api/v1", tags=["Pharmacology"])
app.include_router(predictions_router, prefix="/api/v1", tags=["Analytics"])
app.include_router(admin_router, prefix="/api/v1", tags=["Control Plane"])
app.include_router(upload_router, prefix="/api/v1", tags=["Ingestion"])
app.include_router(chat_router, prefix="/api/v1", tags=["Assistance"])

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "docs": "/api/v1/docs",
        "health": "/health",
        "timestamp": int(time.time())
    }

@app.get("/health")
async def health():
    from app.db.database import db_instance
    db_status = "connected" if db_instance.db is not None else "disconnected"
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "version": "1.0.0",
        "database": db_status,
        "environment": settings.ENVIRONMENT,
        "timestamp": int(time.time())
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "path": request.url.path}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Clinical Error", "detail": str(exc)}
    )
