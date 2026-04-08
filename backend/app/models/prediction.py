from datetime import datetime
from enum import Enum
from typing import List, Optional, Annotated
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator, field_validator
from bson import ObjectId

# Helper for MongoDB ObjectId
PyObjectId = Annotated[
    str,
    BeforeValidator(lambda v: str(v) if ObjectId.is_valid(v) else v),
]

class InteractionSeverity(str, Enum):
    NONE = "none"
    MINOR = "minor"
    MODERATE = "moderate"
    MAJOR = "major"
    CONTRAINDICATED = "contraindicated"

class PredictionRequest(BaseModel):
    drug_ids: List[PyObjectId]
    user_context: Optional[str] = None

    @field_validator('drug_ids')
    @classmethod
    def validate_drug_count(cls, v):
        if len(v) < 2:
            raise ValueError('Must provide at least 2 drugs for interaction check')
        if len(v) > 10:
            raise ValueError('Maximum 10 drugs allowed per prediction')
        return v

class DrugPairResult(BaseModel):
    drug_a_name: str
    drug_b_name: str
    severity: InteractionSeverity
    synergy_score: float = Field(ge=0, le=1)
    mechanism: str
    clinical_notes: str
    alternatives: List[str] = []

class PredictionResult(BaseModel):
    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    user_id: PyObjectId
    drug_ids: List[PyObjectId]
    pair_results: List[DrugPairResult]
    overall_risk_level: InteractionSeverity
    recommendations: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class PredictionResponse(PredictionResult):
    human_readable_summary: str
