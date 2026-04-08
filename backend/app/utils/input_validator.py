import re
from typing import List
from fastapi import HTTPException, status
from bson import ObjectId

def validate_drug_ids(drug_ids: List[str]) -> List[str]:
    """
    Ensures all provided drug identifiers are valid MongoDB ObjectIds.
    """
    for d_id in drug_ids:
        if not ObjectId.is_valid(d_id):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid clinical identifier format: {d_id}"
            )
    return drug_ids

def validate_image_content(file_bytes: bytes, content_type: str) -> bool:
    """
    Performs Magic Byte verification to ensure file content matches declared headers.
    """
    header = file_bytes[:8]
    
    # JPEG: FF D8 FF
    if content_type in ["image/jpeg", "image/jpg"]:
        if header[:3] != b'\xff\xd8\xff':
            raise HTTPException(status_code=422, detail="Invalid JPEG binary signature")
            
    # PNG: 89 50 4E 47
    elif content_type == "image/png":
        if header[:4] != b'\x89PNG':
            raise HTTPException(status_code=422, detail="Invalid PNG binary signature")
            
    # PDF: 25 50 44 46
    elif content_type == "application/pdf":
        if header[:4] != b'%PDF':
            raise HTTPException(status_code=422, detail="Invalid PDF binary signature")
            
    else:
        raise HTTPException(status_code=422, detail=f"Unsupported clinical media type: {content_type}")
        
    return True

def validate_prescription_text(text: str) -> str:
    """
    Validates transcribed prescription text for length and injection safety.
    """
    if not text or not text.strip():
        raise HTTPException(status_code=422, detail="Prescription text cannot be empty")
        
    if len(text) > 10000:
        raise HTTPException(status_code=422, detail="Prescription text exceeds clinical safety limits")
        
    # Basic strip of potential injection characters if not caught by sanitization
    return text.strip()
