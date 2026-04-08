from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from typing import List, Optional, Dict
import time

from app.db.database import get_db
from app.core.security import get_current_active_user
from app.models.user import UserInDB
from app.services.chat_service import chat_service
from app.db import chat_collection
from app.core.logger import logger

router = APIRouter(prefix="/chat", tags=["chatbot"])

class ChatMessageRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    conversation_id: Optional[str] = None

@router.post("/message")
async def send_message(
    request: ChatMessageRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    (Authorized) Clinical multi-turn chat interface with automated drug detection.
    Supports English, Hindi, and Gujarati with AI-powered safety context.
    """
    # 1. New or Existing Conversation Flow
    conv_id = request.conversation_id
    if not conv_id:
        conv_id = await chat_collection.create_conversation(db, str(current_user.id), request.message)
    
    # 2. Logic: History Management
    history = await chat_collection.get_history(db, conv_id, limit=6) # 6 turn context window
    
    # 3. Clinical Detection: Drug names in query
    # Pull from cache (Simplified: In a real system, use app.services.drug_service cache)
    cursor = db.drugs.find({}, {"name": 1}).limit(100)
    drug_names = [d["name"] async for d in cursor]
    detected = chat_service.detect_drug_mentions(request.message, drug_names)
    
    # 4. Persistence: Log user's clinical query
    await chat_collection.add_message(db, conv_id, "user", request.message, request.language)
    
    # 5. Generation: Multilingual LLM orchestration (Gemini -> Mistral)
    response = await chat_service.generate_response(
        request.message, 
        request.language, 
        history, 
        detected
    )
    
    # 6. Persistence: Log AI's safety guidance
    await chat_collection.add_message(db, conv_id, "assistant", response, request.language)
    
    return {
        "response": response,
        "conversation_id": conv_id,
        "language": request.language,
        "detected_drugs": detected
    }

@router.get("/conversations")
async def list_conversations(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """(Authorized) List the user's past medical chat logs."""
    return await chat_collection.get_user_conversations(db, str(current_user.id))

@router.get("/conversations/{conversation_id}")
async def get_conversation_history(
    conversation_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """(Authorized) Retrieve chronological clinical dialogue for a specific session."""
    history = await chat_collection.get_history(db, conversation_id, limit=50)
    if not history:
        raise HTTPException(status_code=404, detail="Clinical conversation trace not found")
    
    # Basic security check on first message trace (SRE logic)
    # Check if first message user_id matches (optional: add user_id to conversation record)
    
    return history

@router.delete("/conversations/{conversation_id}")
async def end_conversation(
    conversation_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """(Authorized) Immediate deletion of a clinical conversation trace for privacy."""
    success = await chat_collection.delete_conversation(db, conversation_id, str(current_user.id))
    if not success:
        raise HTTPException(status_code=404, detail="Conversation trace not found or already purged.")
    return {"message": "Clinical record purged successfully."}
