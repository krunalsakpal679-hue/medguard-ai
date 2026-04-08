from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from typing import List, Dict, Optional
import asyncio

from app.db.database import get_db
from app.core.security import get_current_active_user
from app.models.user import UserInDB
from app.services.storage_service import storage_service
from app.db import uploads_collection
from app.core.logger import logger

router = APIRouter(prefix="/upload", tags=["upload"])

class TextPrescriptionRequest(BaseModel):
    text: str

@router.post("/prescription", status_code=201)
async def upload_prescription(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    (Authorized) Upload a clinical prescription document for AI analysis.
    Starts an asynchronous OCR pipeline.
    """
    # 1. Store the file (S3 or Local)
    file_info = await storage_service.upload_file(file, str(current_user.id))
    
    # 2. Record the analysis request in MongoDB
    upload_id = await uploads_collection.create_upload_record(db, str(current_user.id), file_info)
    
    # 3. Trigger Mock Async OCR Task (Replace with actual Celery/Task queue later)
    # Background task to demonstrate the process
    asyncio.create_task(mock_ocr_pipeline(db, upload_id, file.filename))
    
    return {
        "upload_id": upload_id,
        "file_url": file_info["url"],
        "ocr_status": "processing",
        "message": "Prescription received. AI analysis is running in the background."
    }

@router.get("/{upload_id}/status")
async def get_analysis_status(
    upload_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Check the current status and extracted results of a prescription analysis.
    """
    record = await uploads_collection.get_upload_status(db, upload_id)
    if not record:
        raise HTTPException(status_code=404, detail="Upload record not found")
        
    # Security: Ensure only the owner can check status
    if record["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this clinical record")
        
    return {
        "upload_id": record["id"],
        "ocr_status": record["ocr_status"],
        "extracted_drugs": record["extracted_drugs"],
        "confidence_scores": record["confidence_scores"],
        "file_url": record["file_url"]
    }

@router.post("/text")
async def process_raw_text(
    request: TextPrescriptionRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Directly analyze drug information from raw clinical text (no OCR needed).
    """
    # Logic note: This will eventually call the NLP drug extractor
    # Currently returning a placeholder for integration testing
    return {
        "extracted_drugs": ["Aspirin", "Metformin"], # Placeholder logic
        "confidence": 0.95
    }

async def mock_ocr_pipeline(db: AsyncIOMotorDatabase, upload_id: str, original_name: str):
    """
    Simulation of an async OCR/NLP pipeline that completes after a delay.
    """
    try:
        await asyncio.sleep(5) # Simulate processing time
        
        # Mock results based on user's clinical data structure
        extracted = ["Sertraline", "Warfarin"]
        scores = {"Sertraline": 0.98, "Warfarin": 0.94}
        
        await uploads_collection.update_ocr_result(db, upload_id, extracted, scores)
        logger.info(f"Mock OCR completed for {upload_id}")
    except Exception as e:
        logger.error(f"Mock OCR failed for {upload_id}: {e}")
