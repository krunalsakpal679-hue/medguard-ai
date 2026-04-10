from datetime import datetime
from enum import Enum
from typing import Optional, Annotated, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict, BeforeValidator
from bson import ObjectId

# Helper to handle MongoDB ObjectId in Pydantic v2
PyObjectId = Annotated[
    str,
    BeforeValidator(lambda v: str(v) if ObjectId.is_valid(v) else v),
]

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    profile_picture: Optional[str] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class UserCreate(UserBase):
    google_id: Optional[str] = None
    password: Optional[str] = None
    role: UserRole = UserRole.USER

class UserInDB(UserBase):
    id: PyObjectId = Field(alias="_id")
    google_id: Optional[str] = None
    hashed_password: Optional[str] = None
    role: UserRole = UserRole.USER
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    prediction_count: int = 0

class UserResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    email: EmailStr
    full_name: str
    profile_picture: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    is_active: Optional[bool] = None
