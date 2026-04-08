from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
import time

from app.db.database import get_db
from app.models.drug import DrugCreate, DrugUpdate, DrugResponse
from app.services import drug_service
from app.api.middleware.rate_limiter import RateLimiter
from app.core.logger import logger

router = APIRouter(prefix="/drugs", tags=["drugs"])

# Global Simple Cache for search
search_cache = {}
CACHE_TTL = 60 # 1 minute

# Rate Limiters
search_limiter = RateLimiter(max_calls=100, period=60) # 100/min
admin_limiter = RateLimiter(max_calls=30, period=60)   # 30/min

@router.get("/search", response_model=List[DrugResponse], dependencies=[Depends(search_limiter)])
async def search_drugs(
    q: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Full-text optimized drug search with 60s result caching."""
    cache_key = f"search:{q}:{limit}"
    
    # Check cache
    if cache_key in search_cache:
        timestamp, data = search_cache[cache_key]
        if time.time() - timestamp < CACHE_TTL:
            return data

    results = await drug_service.search_drugs(db, q, limit)
    
    # Update cache
    search_cache[cache_key] = (time.time(), results)
    return results

@router.get("/{drug_id}", response_model=DrugResponse, dependencies=[Depends(RateLimiter(max_calls=100, period=60))])
async def get_drug(drug_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Retrieve metadata for a specific active drug."""
    drug = await drug_service.get_drug_by_id(db, drug_id)
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")
    return drug

@router.post("/", response_model=DrugResponse, status_code=201, dependencies=[Depends(admin_limiter)])
async def create_drug(drug_data: DrugCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """(Admin) Add a new clinical drug record to the system."""
    try:
        new_drug = await drug_service.create_drug(db, drug_data)
        # Log to audit_logs (Simple direct insertion for demonstration)
        await db.audit_logs.insert_one({
            "action": "create_drug",
            "drug_name": drug_data.name,
            "timestamp": time.time()
        })
        return new_drug
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{drug_id}", response_model=DrugResponse, dependencies=[Depends(admin_limiter)])
async def update_drug(drug_id: str, update_data: DrugUpdate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """(Admin) Perform partial metadata updates on an existing clinical drug."""
    updated = await drug_service.update_drug(db, drug_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Drug not found")
    return updated

@router.delete("/{drug_id}", status_code=204, dependencies=[Depends(admin_limiter)])
async def delete_drug(drug_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """(Admin) Soft delete a drug from active status."""
    success = await drug_service.soft_delete_drug(db, drug_id)
    if not success:
        raise HTTPException(status_code=404, detail="Drug not found")
    return None

@router.get("/", response_model=dict)
async def list_drugs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    drug_class: Optional[str] = None,
    sort_by: str = Query("name", regex="^(name|drug_class)$"),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Paginated retrieval of all clinical documentation with optional class filtering."""
    return await drug_service.list_drugs(db, page, limit, drug_class, sort_by)
