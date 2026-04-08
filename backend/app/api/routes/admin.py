from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from ...db.database import get_db
from ...core.auth_service import get_current_active_user
from ...models.user import UserInDB, UserRole, UserUpdate
from ...models.drug import DrugCreate
from ...services.admin_service import admin_service
from ...utils.audit_logger import audit_logger

router = APIRouter(prefix="/admin", tags=["admin"])

async def require_admin(user: UserInDB = Depends(get_current_active_user)):
    """
    Security dependency to ensure only members of the Admin Cluster can access routes.
    """
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Administrative clearance required."
        )
    return user

@router.get("/users")
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: UserInDB = Depends(require_admin)
):
    return await admin_service.get_users_list(db, page, limit, search, role)

@router.get("/users/{user_id}")
async def get_user_details(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: UserInDB = Depends(require_admin)
):
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User Identity Not Found")
    return user

@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    updates: UserUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: UserInDB = Depends(require_admin)
):
    return await admin_service.update_user_state(db, user_id, updates.dict(exclude_unset=True), str(admin.id))

@router.get("/system-health")
async def get_health(
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: UserInDB = Depends(require_admin)
):
    return await admin_service.get_system_health(db)

@router.get("/audit-logs")
async def get_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    action: Optional[str] = None,
    actor_id: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: UserInDB = Depends(require_admin)
):
    query = {}
    if action: query["action"] = action
    if actor_id: query["actor_id"] = actor_id
    
    skip = (page - 1) * limit
    cursor = db.audit_logs.find(query).sort("timestamp", -1).skip(skip).limit(limit)
    logs = await cursor.to_list(length=limit)
    total = await db.audit_logs.count_documents(query)
    
    return {"logs": logs, "total": total}

@router.post("/drugs/bulk-import")
async def bulk_import(
    drugs: List[DrugCreate],
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: UserInDB = Depends(require_admin)
):
    return await admin_service.bulk_import_drugs(db, drugs, str(admin.id))

@router.get("/predictions/export")
async def export_data(
    date_from: datetime = Query(...),
    date_to: datetime = Query(default_factory=datetime.utcnow),
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: UserInDB = Depends(require_admin)
):
    filename = f"medguard_export_{datetime.now().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        admin_service.export_predictions_csv(db, date_from, date_to),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
