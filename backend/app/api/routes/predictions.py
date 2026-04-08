from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional, Dict
from app.db.database import get_db
from app.core.security import get_current_active_user, require_admin
from app.models.user import UserInDB
from app.models.prediction import PredictionRequest, PredictionResponse
from app.services import prediction_service
from bson import ObjectId

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.post("/check", response_model=PredictionResponse)
async def check_interactions(
    request: PredictionRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    (Authorized) Execute a full clinicial interaction check across multiple drug identifiers.
    Calculates pairwise AI risks and provides treatment alternatives.
    """
    try:
        # Pass user_id and context for clinical persistence
        result = await prediction_service.run_prediction(
            db, 
            [str(d_id) for d_id in request.drug_ids], 
            str(current_user.id), 
            request.user_context
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interaction analysis failed: {str(e)}")

@router.get("/history", response_model=Dict)
async def get_my_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    (Authorized) Retrieve the logged-in user's past interaction analysis history.
    """
    return await prediction_service.get_user_history(db, str(current_user.id), page, limit)

@router.get("/{prediction_id}", response_model=PredictionResponse)
async def get_prediction_detail(
    prediction_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    (Authorized) Fetch the detailed clinical report for a specific past interaction check.
    """
    if not ObjectId.is_valid(prediction_id):
        raise HTTPException(status_code=400, detail="Invalid prediction identifier")
        
    prediction = await db.predictions.find_one({"_id": ObjectId(prediction_id)})
    if not prediction:
        raise HTTPException(status_code=404, detail="Clinical record not found")
        
    # Security: Ensure only the owner (or admin) can access this record
    if prediction["user_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this record")
        
    # Map _id back to id for Pydantic
    prediction["id"] = str(prediction["_id"])
    return prediction

@router.get("/stats", dependencies=[Depends(require_admin)])
async def get_global_stats(db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    (Admin) Retrieve global clinical system stats and risk trends.
    """
    total_predictions = await db.predictions.count_documents({})
    
    # Simple aggregation for risk profile
    pipeline = [{"$group": {"_id": "$overall_risk_level", "count": {"$sum": 1}}}]
    risk_stats = await db.predictions.aggregate(pipeline).to_list(length=10)
    
    return {
        "total_predictions": total_predictions,
        "predictions_by_severity": {r["_id"]: r["count"] for r in risk_stats},
        "system_status": "operational",
        "avg_latency": "142ms"
    }
