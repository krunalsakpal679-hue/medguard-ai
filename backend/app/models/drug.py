from datetime import datetime
from typing import List, Optional, Annotated
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from bson import ObjectId

# Helper for MongoDB ObjectId
PyObjectId = Annotated[
    str,
    BeforeValidator(lambda v: str(v) if ObjectId.is_valid(v) else v),
]

class DrugBase(BaseModel):
    name: str
    generic_name: str
    brand_names: List[str] = []
    drug_class: str
    mechanism_of_action: str
    half_life_hours: float
    bioavailability: float
    protein_binding_percent: float
    metabolized_by: List[str] = Field(description="Enzymes e.g. ['CYP3A4', 'CYP2D6']")
    contraindications: List[str] = []
    side_effects: List[str] = []

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class DrugCreate(DrugBase):
    pass

class DrugInDB(DrugBase):
    id: PyObjectId = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class DrugResponse(DrugBase):
    id: PyObjectId
    drug_class: str
    is_active: bool

class DrugUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    brand_names: Optional[List[str]] = None
    drug_class: Optional[str] = None
    mechanism_of_action: Optional[str] = None
    half_life_hours: Optional[float] = None
    bioavailability: Optional[float] = None
    protein_binding_percent: Optional[float] = None
    metabolized_by: Optional[List[str]] = None
    contraindications: Optional[List[str]] = None
    side_effects: Optional[List[str]] = None
    is_active: Optional[bool] = None
