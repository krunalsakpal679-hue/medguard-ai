import json
import logging
from typing import Dict, List, Optional
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.database import get_db
from app.core.security import verify_token
from app.core.logger import logger

router = APIRouter()

class ConnectionManager:
    """
    Manages active WebSocket connections for real-time clinical notifications.
    """
    def __init__(self):
        # Maps user_id strings to active WebSocket connections
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        # If user is already connected (different tab), the new connection replaces it
        # or we could manage a list per user. For simplicity, we'll do 1-1.
        self.active_connections[user_id] = websocket
        logger.info(f"WebSocket: User {user_id} connected.")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"WebSocket: User {user_id} disconnected.")

    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Failed to send WS message to user {user_id}: {e}")
                self.disconnect(user_id)

    async def broadcast(self, message: dict):
        disconnected_users = []
        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected_users.append(user_id)
        
        for user_id in disconnected_users:
            self.disconnect(user_id)

manager = ConnectionManager()

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """
    Stateful real-time notification bridge for MedGuard AI.
    """
    # 1. Verify Authentication
    payload = verify_token(token)
    if not payload:
        await websocket.close(code=4001) # Unauthorized
        return

    user_id = str(payload.get("sub"))
    if not user_id:
        await websocket.close(code=4002) # Invalid ID
        return

    # 2. Establish Connection
    await manager.connect(user_id, websocket)
    
    try:
        # Initial handshake
        await websocket.send_json({
            "type": "connected",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Keep-alive loop
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong", "timestamp": datetime.utcnow().isoformat()})
            except json.JSONDecodeError:
                continue
                
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(user_id)

async def notify_user(
    db: AsyncIOMotorDatabase,
    user_id: str, 
    notification_type: str, 
    data: dict
):
    """
    Utility to dispatch a notification to a specific user.
    Attempts real-time delivery via WebSocket, with persistent DB fallback.
    """
    notification = {
        "user_id": user_id,
        "type": notification_type,
        "data": data,
        "read": False,
        "timestamp": datetime.utcnow()
    }
    
    # 1. Persist to Database for offline retrieval
    try:
        await db.notifications.insert_one(notification)
    except Exception as e:
        logger.error(f"Failed to persist notification: {e}")

    # 2. Attempt Real-time delivery
    # Prepare JSON serializable version of notification
    ws_message = {
        "type": notification_type,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.send_to_user(user_id, ws_message)
