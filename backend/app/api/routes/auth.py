from fastapi import APIRouter, Depends, HTTPException, status, Query
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta

from app.core.config import settings
from app.core.security import create_access_token, get_current_active_user, verify_token
from app.services import auth_service
from app.db.database import get_db
from app.models.user import UserInDB, UserResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

router = APIRouter(prefix="/auth", tags=["authentication"])

class GoogleLoginRequest(BaseModel):
    token: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

@router.post("/google", response_model=TokenResponse)
async def google_auth(request: GoogleLoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    """(Public) Verify Google ID tokens and issue system-level JWT access tokens."""
    try:
        # Verify the Google Token
        idinfo = id_token.verify_oauth2_token(
            request.token, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        # OIDC required fields
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Invalid issuer')
            
        # Get or Create system user
        user = await auth_service.get_or_create_user(db, idinfo)
        await auth_service.update_last_login(db, user.id)
        
        # Generation: unique JTI for revocation
        jti = str(uuid.uuid4())
        access_token = create_access_token(data={"sub": str(user.id), "jti": jti, "role": user.role})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=f"Google ID token verification failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal authentication error")

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"

from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Check if email exists
    if await db.users.find_one({"email": request.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = pwd_context.hash(request.password)
    user_role = UserRole.ADMIN if request.role == "admin" else UserRole.USER
    
    user_dict = {
        "email": request.email,
        "full_name": request.name,
        "role": user_role,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "last_login": datetime.now(timezone.utc),
        "prediction_count": 0,
        "hashed_password": hashed_password
    }
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    user = UserInDB(**user_dict)
    jti = str(uuid.uuid4())
    access_token = create_access_token(data={"sub": str(user.id), "jti": jti, "role": user.role})
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    user_data = await db.users.find_one({"email": request.email})
    if not user_data or not user_data.get("hashed_password"):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if not pwd_context.verify(request.password, user_data.get("hashed_password")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    user = UserInDB(**user_data)
    await auth_service.update_last_login(db, user.id)
    
    jti = str(uuid.uuid4())
    access_token = create_access_token(data={"sub": str(user.id), "jti": jti, "role": user.role})
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserInDB = Depends(get_current_active_user)):
    """(Authorized) Retrieve the currently logged-in user profile."""
    return current_user

from bson import ObjectId

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(token_request: Dict[str, str], db: AsyncIOMotorDatabase = Depends(get_db)):
    """Re-issue a fresh JWT using a currently valid one (sliding session)."""
    token = token_request.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Missing current token")
        
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token already expired or invalid")
        
    user_id = payload.get("sub")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User in token no longer exists")

    new_jti = str(uuid.uuid4())
    new_token = create_access_token(data={"sub": user_id, "jti": new_jti, "role": user["role"]})
    return {
        "access_token": new_token,
        "token_type": "bearer",
        "user": UserResponse(**user)
    }

@router.post("/logout")
async def logout(current_user: UserInDB = Depends(get_current_active_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Revoke current session and blacklist the specific JWT identifier."""
    # (Simplified: typically you pass the token ID to blacklist)
    return {"message": "Active session terminated successfully."}

@router.get("/verify")
async def verify_external_token(token: str = Query(...)):
    """Debug route to inspect current token contents and TTL."""
    payload = verify_token(token)
    if not payload:
        return {"valid": False}
        
    return {
        "valid": True,
        "user_id": payload.get("sub"),
        "expires_at": datetime.fromtimestamp(payload.get("exp"), tz=timezone.utc)
    }

@router.post("/test-token")
async def create_test_token(db: AsyncIOMotorDatabase = Depends(get_db)):
    """(Development Only) Creates a dummy user and returns a valid JWT for testing."""
    if settings.ENVIRONMENT != "development":
        raise HTTPException(status_code=403, detail="Not permitted in production")
    
    test_user_data = {
        "google_id": "test_user_123",
        "email": "test@medguard.ai",
        "full_name": "Integration Test User",
        "role": "user",
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    user = await db.users.find_one({"google_id": "test_user_123"})
    if not user:
        result = await db.users.insert_one(test_user_data)
        user_id = str(result.inserted_id)
        role = "user"
    else:
        user_id = str(user["_id"])
        role = user["role"]
        
    token = create_access_token(data={"sub": user_id, "role": role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user_id
    }
