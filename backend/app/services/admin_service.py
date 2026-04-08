import time
import csv
import io
from datetime import datetime
from typing import Dict, List, Any, AsyncGenerator, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status
from ..models.user import UserInDB, UserRole
from ..models.drug import DrugCreate
from ..utils.audit_logger import audit_logger

class AdminService:
    async def get_users_list(
        self, 
        db: AsyncIOMotorDatabase, 
        page: int = 1, 
        limit: int = 20,
        search: Optional[str] = None,
        role: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieves a paginated registry of clinical users with filtering.
        """
        query = {}
        if search:
            query["$or"] = [
                {"full_name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]
        if role:
            query["role"] = role

        skip = (page - 1) * limit
        cursor = db.users.find(query).skip(skip).limit(limit)
        users = await cursor.to_list(length=limit)
        total = await db.users.count_documents(query)
        
        return {
            "users": users,
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit
        }

    async def update_user_state(
        self, 
        db: AsyncIOMotorDatabase, 
        user_id: str, 
        updates: Dict[str, Any], 
        admin_id: str
    ) -> Dict[str, Any]:
        """
        Modifies a user's cluster role or activity status.
        """
        result = await db.users.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": updates},
            return_document=True
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="User Identity Not Found")
            
        await audit_logger.log_action(
            db, admin_id, "USER_UPDATED", "USER", user_id, 
            details={"changes": updates}
        )
        return result

    async def get_system_health(self, db: AsyncIOMotorDatabase) -> Dict[str, Any]:
        """
        Aggregates multi-node health metrics for the admin dashboard.
        """
        start_time = time.time()
        await db.command("ping")
        ping_ms = (time.time() - start_time) * 1000
        
        total_drugs = await db.drugs.count_documents({})
        total_users = await db.users.count_documents({})
        total_predictions = await db.predictions.count_documents({})

        return {
            "db_connected": True,
            "db_ping_ms": round(ping_ms, 2),
            "ml_model_loaded": True,
            "total_drugs": total_drugs,
            "total_users": total_users,
            "total_predictions": total_predictions,
            "environment": "clinical_production",
            "timestamp": datetime.utcnow()
        }

    async def bulk_import_drugs(
        self, 
        db: AsyncIOMotorDatabase, 
        drugs: List[DrugCreate], 
        admin_id: str
    ) -> Dict[str, Any]:
        """
        Atomic bulk ingestion of pharmacological data.
        """
        drug_dicts = [d.dict() for d in drugs]
        for d in drug_dicts:
            d["created_at"] = datetime.utcnow()
            
        result = await db.drugs.insert_many(drug_dicts)
        
        await audit_logger.log_action(
            db, admin_id, "DRUGS_BULK_IMPORTED", "DRUG_COLLECTION", 
            details={"count": len(result.inserted_ids)}
        )
        
        return {
            "inserted_count": len(result.inserted_ids),
            "status": "success"
        }

    async def export_predictions_csv(
        self, 
        db: AsyncIOMotorDatabase, 
        date_from: datetime, 
        date_to: datetime
    ) -> AsyncGenerator[str, None]:
        """
        Streams analytical prediction logs as structured CSV rows.
        """
        query = {"created_at": {"$gte": date_from, "$lte": date_to}}
        cursor = db.predictions.find(query).sort("created_at", -1)
        
        # CSV Header
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Timestamp", "User ID", "Drug List", "Overall Risk", "Pairs Analyzed"])
        yield output.getvalue()
        output.truncate(0)
        output.seek(0)

        async for pred in cursor:
            writer.writerow([
                str(pred["_id"]),
                pred["created_at"].isoformat(),
                pred["user_id"],
                ", ".join(pred["drug_names"]),
                pred["overall_risk_level"],
                len(pred["pair_results"])
            ])
            yield output.getvalue()
            output.truncate(0)
            output.seek(0)

admin_service = AdminService()
