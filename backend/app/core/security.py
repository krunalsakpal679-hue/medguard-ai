from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from app.db.database import get_db
from app.models.user import UserInDB, UserRole, UserResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import passlib.hash as hash_utils

# Standard OAuth2 scheme for JWT bearer tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Pre-warm bcrypt for faster subsequent calls
# hash_utils.bcrypt.hash("PreWarmBcrypt")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate a JWT access token with a configurable expiration."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.JWT_EXPIRE_MINUTES))
    # Standard claims (sub: user_id, exp: expiration, jti: unique id)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token without raising immediate exceptions."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_db)) -> UserInDB:
    """FastAPI Dependency: verifies JWT and retrieves the user from MongoDB."""
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("sub")
    if not user_id or not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user ID in token")
    
    # Check blacklist (Implementation specific, assume sessions collection is used)
    jti = payload.get("jti")
    if jti:
        is_blacklisted = await db.sessions.find_one({"jti": jti, "blacklisted": True})
        if is_blacklisted:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been blacklisted (Logged out)")

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    return UserInDB(**user)

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    """Dependency: ensures the authenticated user is currently active."""
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return current_user

async def require_admin(current_user: UserInDB = Depends(get_current_active_user)) -> UserInDB:
    """Dependency: ensures the user has ADMIN privileges."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Administrative privileges required"
        )
    return current_user
