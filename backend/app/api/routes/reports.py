from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
import io
import logging

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import UserInDB
from app.services.report_service import ReportService
from app.services import drug_service
from app.core.logger import logger

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/prediction/{prediction_id}")
async def get_prediction_report(
    prediction_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Generates and returns a downloadable PDF report for a drug interaction prediction.
    """
    # 1. Fetch Prediction Result
    prediction = await db.predictions.find_one({"_id": prediction_id})
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction report not found")
        
    # Check ownership
    if str(prediction["user_id"]) != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized access to this report")

    # Adapt prediction to model
    from app.models.prediction import PredictionResult
    prediction_obj = PredictionResult(**prediction)

    # 2. Fetch associated Drugs
    from app.models.drug import DrugInDB
    drugs = []
    for d_id in prediction_obj.drug_ids:
        drug_data = await db.drugs.find_one({"_id": d_id})
        if drug_data:
            drugs.append(DrugInDB(**drug_data))

    # 3. Generate PDF
    try:
        pdf_bytes = ReportService.generate_prediction_report(
            prediction=prediction_obj,
            user=current_user,
            drugs=drugs
        )
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=medguard_report_{prediction_id}.pdf"
            }
        )
    except Exception as e:
        logger.error(f"Failed to generate PDF report: {e}")
        raise HTTPException(
            status_code=500, 
            detail="An error occurred during report generation"
        )

@router.get("/user-summary")
async def get_user_summary_report(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Placeholder for monthly user summary report.
    Future implementation: Aggregate last month's data and generate summary PDF.
    """
    # For now, return a basic response or implement if needed
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED, 
        detail="Summary reports are coming in the next clinical release."
    )
