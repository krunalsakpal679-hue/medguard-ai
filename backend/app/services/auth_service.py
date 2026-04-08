from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.user import UserInDB, UserCreate, UserUpdate, UserRole
from bson import ObjectId
from datetime import datetime, timezone
import uuid
from typing import Optional

async def get_or_create_user(db: AsyncIOMotorDatabase, google_info: dict) -> UserInDB:
    """Handle the OAuth2 logical flow: retrieve or create a new clinical user."""
    google_id = google_info.get("sub")
    email = google_info.get("email")
    
    # Search by google_id or email (ensuring users can transition to Google OIDC)
    user_data = await db.users.find_one({"$or": [{"google_id": google_id}, {"email": email}]})
    
    if user_data:
        # Update google_id if it was null (email match)
        if not user_data.get("google_id"):
            await db.users.update_one(
                {"_id": user_data["_id"]},
                {"$set": {"google_id": google_id}}
            )
        return UserInDB(**user_data)
    
    # Create new system user
    user_dict = {
        "email": email,
        "full_name": google_info.get("name"),
        "profile_picture": google_info.get("picture"),
        "google_id": google_id,
        "role": UserRole.USER,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "last_login": datetime.now(timezone.utc),
        "prediction_count": 0
    }
    
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    return UserInDB(**user_dict)

async def update_last_login(db: AsyncIOMotorDatabase, user_id: str) -> None:
    """Update the user's last login timestamp for audit and activity tracking."""
    if not ObjectId.is_valid(user_id):
        return
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )

async def blacklist_token(db: AsyncIOMotorDatabase, jti: str, expires_at: datetime) -> None:
    """Store blacklisted JWT IDs (JTI) until they naturally expire via TTL index."""
    await db.sessions.insert_one({
        "jti": jti,
        "blacklisted": True,
        "expires_at": expires_at
    })

async def is_token_blacklisted(db: AsyncIOMotorDatabase, jti: str) -> bool:
    """Verify if a specific JWT identifier has been explicitly revoked."""
    if not jti:
        return False
    entry = await db.sessions.find_one({"jti": jti, "blacklisted": True})
    return bool(entry)
