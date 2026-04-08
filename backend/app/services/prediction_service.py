import itertools
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timezone
from typing import List, Optional, Dict

from app.models.drug import DrugInDB, DrugResponse
from app.models.prediction import (
    PredictionResult, 
    DrugPairResult, 
    InteractionSeverity, 
    PredictionResponse
)
from app.ml.utils.model_loader import model_loader
from app.services.alternatives_service import suggest_alternatives

async def run_prediction(
    db: AsyncIOMotorDatabase, 
    drug_ids: List[str], 
    user_id: str, 
    user_context: Optional[str]
) -> PredictionResponse:
    """
    Orchestrates the pairwise clinical analysis using the MedGuard AI engine.
    """
    # 1. Fetch drug objects from clinical DB
    drugs = []
    for d_id in drug_ids:
        if not ObjectId.is_valid(d_id):
            continue
        drug_data = await db.drugs.find_one({"_id": ObjectId(d_id)})
        if drug_data:
            drugs.append(DrugInDB(**drug_data))
    
    if len(drugs) < 2:
        raise ValueError("Must provide at least 2 valid drug IDs for interaction check.")

    pair_results = []
    severities = []

    # 2. Sequential Pairwise AI Inference
    for drug_a, drug_b in itertools.combinations(drugs, 2):
        prediction = await model_loader.predict_interaction(drug_a, drug_b)
        
        # Determine Severity Enum from ML output
        severity_value = prediction["severity"].lower()
        if severity_value not in [s.value for s in InteractionSeverity]:
            severity_value = InteractionSeverity.NONE.value
            
        severity_enum = InteractionSeverity(severity_value)
        severities.append(severity_enum)
        
        # Clinical Notes & Mechanism (Mocking high-detail logic for UI showcase)
        # In production, these should be generated based on the model's 'side_effect_probs'
        mechanism = f"Potential pharmacological pathway involves metabolic competition for {drug_a.metabolized_by[0] if drug_a.metabolized_by else 'CYP3A4'} at the clinical site."
        
        # 3. Suggest alternatives for high-risk pairs
        alt_names = []
        if severity_enum in [InteractionSeverity.MAJOR, InteractionSeverity.CONTRAINDICATED]:
            alts = await suggest_alternatives(db, str(drug_a.id), [str(drug_b.id)])
            alt_names = [a.name for a in alts]

        pair_results.append(DrugPairResult(
            drug_a_id=str(drug_a.id),
            drug_b_id=str(drug_b.id),
            drug_a_name=drug_a.name,
            drug_b_name=drug_b.name,
            severity=severity_enum,
            synergy_score=prediction["synergy_score"],
            mechanism=mechanism,
            clinical_notes=f"Monitor for increased side effects like {drug_a.side_effects[0] if drug_a.side_effects else 'nausea'}.",
            alternatives=alt_names
        ))

    # 4. Aggregation: Determine Overall Risk Profile
    risk_hierarchy = {
        InteractionSeverity.NONE: 0,
        InteractionSeverity.MINOR: 1,
        InteractionSeverity.MODERATE: 2,
        InteractionSeverity.MAJOR: 3,
        InteractionSeverity.CONTRAINDICATED: 4
    }
    
    overall_risk = max(severities, key=lambda s: risk_hierarchy[s])
    recommendations = generate_recommendations(pair_results)

    # 5. Persistence: Record clinical result for future reference
    result_dict = {
        "user_id": ObjectId(user_id),
        "drug_ids": [ObjectId(d.id) for d in drugs],
        "pair_results": [p.model_dump() for p in pair_results],
        "overall_risk_level": overall_risk.value,
        "recommendations": recommendations,
        "created_at": datetime.now(timezone.utc)
    }
    
    res = await db.predictions.insert_one(result_dict)
    
    # Update Audit: increment user's prediction counter
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"prediction_count": 1}}
    )

    return PredictionResponse(
        _id=str(res.inserted_id),
        id=str(res.inserted_id),
        **result_dict,
        human_readable_summary=f"Analysis completed successfully with {overall_risk.value.upper()} risk detected across {len(pair_results)} interactions."
    )

def generate_recommendations(pair_results: List[DrugPairResult]) -> List[str]:
    """Rule-based clinical guidance based on pairwise interaction profile."""
    recs = []
    for pair in pair_results:
        # Rule: Prevent fatalities for Contraindicated pairs
        if pair.severity == InteractionSeverity.CONTRAINDICATED:
            recs.append(f"CRITICAL: Do NOT combine {pair.drug_a_name} and {pair.drug_b_name} under any circumstances.")
        
        # Rule: Professional oversight for Major interactions
        elif pair.severity == InteractionSeverity.MAJOR:
            recs.append(f"WARNING: Consult a healthcare professional before taking {pair.drug_a_name} with {pair.drug_b_name}.")
            
        # Rule: Side effect awareness for Moderate interactions
        elif pair.severity == InteractionSeverity.MODERATE:
            recs.append(f"Monitor for side effects like gastrointestinal discomfort when combining {pair.drug_a_name} and {pair.drug_b_name}.")
            
        # Rule: Synergistic awareness
        if pair.synergy_score > 0.7:
            recs.append(f"NOTE: {pair.drug_a_name} and {pair.drug_b_name} may have a beneficial synergistic effect (Score: {pair.synergy_score}). Use with care.")
            
    return sorted(list(set(recs))) # Return unique sorted recommendations

async def get_user_history(db: AsyncIOMotorDatabase, user_id: str, page: int, limit: int) -> Dict:
    """Paginated retrieval of a clinical user's past predictions."""
    total = await db.predictions.count_documents({"user_id": ObjectId(user_id)})
    cursor = db.predictions.find({"user_id": ObjectId(user_id)}).sort("created_at", -1).skip((page-1)*limit).limit(limit)
    
    items = []
    async for item in cursor:
        # Mini response for list view
        items.append({
            "id": str(item["_id"]),
            "drug_names": [p["drug_a_name"] for p in item["pair_results"]] + [item["pair_results"][-1]["drug_b_name"]],
            "overall_risk_level": item["overall_risk_level"],
            "created_at": item["created_at"]
        })
        
    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }
