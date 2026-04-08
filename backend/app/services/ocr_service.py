import os
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.ml.utils.ocr_engine import ocr_engine
from app.ml.utils.drug_name_parser import drug_parser
from app.db import uploads_collection
from app.core.logger import logger

async def process_prescription(upload_id: str, file_path: str, db: AsyncIOMotorDatabase) -> None:
    """
    Background Task: Orchestrates the transformation from digital image to clinical drug list.
    """
    try:
        logger.info(f"Starting OCR Pipeline for Upload {upload_id}...")
        
        # 1. Image To Text
        raw_text = await ocr_engine.extract_text(file_path)
        if not raw_text:
            logger.warning(f"No text extracted for {upload_id}")
            await _mark_as_failed(db, upload_id, "No readable text found in image.")
            return
            
        logger.info(f"Raw text extracted from {upload_id}: {raw_text[:50]}...")

        # 2. Text To Clinical Entities
        matches = await drug_parser.parse_drug_names(raw_text, db)
        
        # 3. Persistence
        extracted_names = [m["name"] for m in matches]
        confidence_scores = {m["name"]: m["confidence"] for m in matches}
        
        await uploads_collection.update_ocr_result(
            db, 
            upload_id, 
            extracted_names, 
            confidence_scores
        )
        
        logger.info(f"OCR Pipeline succeeded for {upload_id}. Found {len(extracted_names)} drugs.")

    except Exception as e:
        logger.error(f"OCR Pipeline failed for {upload_id}: {str(e)}")
        await _mark_as_failed(db, upload_id, str(e))

async def _mark_as_failed(db: AsyncIOMotorDatabase, upload_id: str, error: str):
    """Update MongoDB record with failure status and error details."""
    await db.predictions.update_one(
        {"_id": upload_id if isinstance(upload_id, object) else upload_id}, # Handles both string and ObjectId
        {"$set": {"ocr_status": "failed", "error_message": error}}
    )
