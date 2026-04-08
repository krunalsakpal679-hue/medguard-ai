from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List, Optional, Dict
from app.models.drug import DrugInDB, DrugResponse
from app.ml.utils.model_loader import model_loader

async def suggest_alternatives(
    db: AsyncIOMotorDatabase, 
    drug_id: str, 
    interacting_drug_ids: List[str]
) -> List[DrugResponse]:
    """
    Suggests non-interacting medications within the same clinical drug class.
    """
    # 1. Fetch the target drug record
    if not ObjectId.is_valid(drug_id):
        return []
    target_drug = await db.drugs.find_one({"_id": ObjectId(drug_id)})
    if not target_drug:
        return []
    
    drug_class = target_drug.get("drug_class")
    if not drug_class:
        return []

    # 2. Fetch medications in the same class (excluding the target itself)
    cursor = db.drugs.find({
        "drug_class": drug_class,
        "_id": {"$ne": ObjectId(drug_id)},
        "is_active": True
    }).limit(10)
    
    candidates = [DrugInDB(**d) async for d in cursor]
    
    # 3. Fetch current interacting drug records
    interacting_drugs = []
    for d_id in interacting_drug_ids:
        if ObjectId.is_valid(d_id):
            d = await db.drugs.find_one({"_id": ObjectId(d_id)})
            if d:
                interacting_drugs.append(DrugInDB(**d))

    safe_alternatives = []

    # 4. Filter candidates by checking for AI-predicted interactions
    for candidate in candidates:
        is_safe = True
        for other in interacting_drugs:
            # Run AI inference for the candidate
            prediction = await model_loader.predict_interaction(candidate, other)
            
            # Risk Threshold: Major/Contraindicated are strictly rejected for alternatives
            if prediction["severity"] in ["MAJOR", "CONTRAINDICATED"]:
                is_safe = False
                break
        
        if is_safe:
            safe_alternatives.append(DrugResponse(**candidate.model_dump()))
            if len(safe_alternatives) >= 5: # Limit UI noise
                break
                
    return safe_alternatives
