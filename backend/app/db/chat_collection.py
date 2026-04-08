from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timezone
import uuid
from typing import List, Dict, Optional

async def create_conversation(db: AsyncIOMotorDatabase, user_id: str, first_message: str) -> str:
    """Initialize a new clinical chat session in MongoDB."""
    conv_id = f"chat_{uuid.uuid4().hex[:12]}"
    
    # Simple truncated title for UI display
    title = (first_message[:40] + '...') if len(first_message) > 40 else first_message
    
    record = {
        "conv_id": conv_id,
        "user_id": ObjectId(user_id),
        "title": title,
        "message_count": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.conversations.insert_one(record)
    return conv_id

async def add_message(
    db: AsyncIOMotorDatabase, 
    conversation_id: str, 
    role: str, 
    content: str, 
    language: str
) -> None:
    """Persist a message (user/assistant) to a specific medical chat history."""
    msg_record = {
        "conv_id": conversation_id,
        "role": role,
        "content": content,
        "language": language,
        "timestamp": datetime.now(timezone.utc)
    }
    
    await db.messages.insert_one(msg_record)
    
    # Update conversation metadata (optimistic update of message count)
    await db.conversations.update_one(
        {"conv_id": conversation_id},
        {
            "$inc": {"message_count": 1},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )

async def get_history(db: AsyncIOMotorDatabase, conversation_id: str, limit: int = 20) -> List[Dict]:
    """Retrieve the recent medical dialogue window for a conversation."""
    cursor = db.messages.find({"conv_id": conversation_id}).sort("timestamp", -1).limit(limit)
    history = [m async for m in cursor]
    # Reverse to restore chronological order (SRE logic)
    return sorted(history, key=lambda x: x["timestamp"])

async def get_user_conversations(db: AsyncIOMotorDatabase, user_id: str) -> List[Dict]:
    """List all active clinical dialogues for a specific system user."""
    cursor = db.conversations.find({"user_id": ObjectId(user_id)}).sort("updated_at", -1)
    return [
        {
            "id": c["conv_id"],
            "title": c["title"],
            "created_at": c["created_at"],
            "message_count": c["message_count"]
        } 
        async for c in cursor
    ]

async def delete_conversation(db: AsyncIOMotorDatabase, conversation_id: str, user_id: str) -> bool:
    """Atomically wipe a conversation and its full clinical log from the system."""
    res = await db.conversations.delete_one({"conv_id": conversation_id, "user_id": ObjectId(user_id)})
    if res.deleted_count > 0:
        # Cascade delete all messages
        await db.messages.delete_many({"conv_id": conversation_id})
        return True
    return False
