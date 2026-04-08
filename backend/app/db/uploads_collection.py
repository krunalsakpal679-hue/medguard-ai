from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timezone
from typing import List, Dict, Optional

async def create_upload_record(db: AsyncIOMotorDatabase, user_id: str, file_info: Dict) -> str:
    """Initialize a new prescription analysis record in MongoDB."""
    record = {
        "user_id": ObjectId(user_id),
        "file_url": file_info["url"],
        "file_key": file_info["key"],
        "content_type": file_info["content_type"],
        "ocr_status": "processing",
        "extracted_drugs": [],
        "confidence_scores": {},
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await db.predictions.insert_one(record) # Reusing predictions collection for analysis audit
    return str(result.inserted_id)

async def update_ocr_result(
    db: AsyncIOMotorDatabase, 
    upload_id: str, 
    extracted_drugs: List[str], 
    confidence_scores: Dict[str, float]
) -> None:
    """Update the analysis record once OCR/NLP processing completes."""
    if not ObjectId.is_valid(upload_id):
        return
        
    await db.predictions.update_one(
        {"_id": ObjectId(upload_id)},
        {
            "$set": {
                "ocr_status": "completed",
                "extracted_drugs": extracted_drugs,
                "confidence_scores": confidence_scores,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

async def get_upload_status(db: AsyncIOMotorDatabase, upload_id: str) -> Optional[Dict]:
    """Retrieve the current state of a prescription analysis pipeline."""
    if not ObjectId.is_valid(upload_id):
        return None
        
    record = await db.predictions.find_one({"_id": ObjectId(upload_id)})
    if record:
        record["id"] = str(record["_id"])
    return record
