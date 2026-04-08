from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.drug import DrugInDB, DrugCreate, DrugUpdate, DrugResponse
from bson import ObjectId
from datetime import datetime
from typing import List, Optional, Dict
import pymongo
from app.core.logger import logger

async def search_drugs(db: AsyncIOMotorDatabase, query: str, limit: int) -> List[DrugInDB]:
    """Search drugs using MongoDB text indexing or partial regex matching."""
    try:
        # Prioritize full-text search index
        cursor = db.drugs.find(
            {
                "$text": {"$search": query},
                "is_active": True
            },
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).limit(limit)
        
        results = [DrugInDB(**drug) async for drug in cursor]
        
        # Fallback to regex if no text results or for partial prefix matches
        if not results:
            cursor = db.drugs.find({
                "name": {"$regex": query, "$options": "i"},
                "is_active": True
            }).limit(limit)
            results = [DrugInDB(**drug) async for drug in cursor]
            
        return results
    except Exception as e:
        logger.error(f"Drug search error: {e}")
        return []

async def get_drug_by_id(db: AsyncIOMotorDatabase, drug_id: str) -> Optional[DrugInDB]:
    """Retrieve a single active drug by its ID."""
    if not ObjectId.is_valid(drug_id):
        return None
    drug = await db.drugs.find_one({"_id": ObjectId(drug_id), "is_active": True})
    return DrugInDB(**drug) if drug else None

async def create_drug(db: AsyncIOMotorDatabase, drug_data: DrugCreate) -> DrugInDB:
    """Create a new drug with duplicate check by name."""
    existing = await db.drugs.find_one({"name": {"$regex": f"^{drug_data.name}$", "$options": "i"}})
    if existing:
        raise ValueError(f"Drug with name '{drug_data.name}' already exists.")
    
    drug_dict = drug_data.model_dump()
    drug_dict["created_at"] = datetime.utcnow()
    drug_dict["updated_at"] = datetime.utcnow()
    drug_dict["is_active"] = True
    
    result = await db.drugs.insert_one(drug_dict)
    drug_dict["_id"] = result.inserted_id
    return DrugInDB(**drug_dict)

async def update_drug(db: AsyncIOMotorDatabase, drug_id: str, update_data: DrugUpdate) -> Optional[DrugInDB]:
    """Partially update an existing drug's metadata."""
    if not ObjectId.is_valid(drug_id):
        return None
        
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        return await get_drug_by_id(db, drug_id)
        
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.drugs.find_one_and_update(
        {"_id": ObjectId(drug_id), "is_active": True},
        {"$set": update_dict},
        return_document=pymongo.ReturnDocument.AFTER
    )
    
    return DrugInDB(**result) if result else None

async def soft_delete_drug(db: AsyncIOMotorDatabase, drug_id: str) -> bool:
    """Soft delete by setting is_active to False with timestamp."""
    if not ObjectId.is_valid(drug_id):
        return False
        
    result = await db.drugs.update_one(
        {"_id": ObjectId(drug_id)},
        {"$set": {"is_active": False, "deleted_at": datetime.utcnow()}}
    )
    return result.modified_count > 0

async def list_drugs(
    db: AsyncIOMotorDatabase, 
    page: int, 
    limit: int, 
    drug_class: Optional[str], 
    sort_by: str
) -> Dict:
    """Paginated retrieval of active drugs with optional filtering and sorting."""
    filter_query = {"is_active": True}
    if drug_class:
        filter_query["drug_class"] = drug_class
        
    total = await db.drugs.count_documents(filter_query)
    
    cursor = db.drugs.find(filter_query).sort(sort_by, pymongo.ASCENDING).skip((page - 1) * limit).limit(limit)
    items = [DrugInDB(**drug) async for drug in cursor]
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }
