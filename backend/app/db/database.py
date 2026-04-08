from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.logger import logger
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None
    users = None
    drugs = None
    interactions = None
    predictions = None
    sessions = None
    audit_logs = None

db_instance = Database()

async def connect_db():
    """Establish connection to MongoDB and map collections."""
    db_instance.client = AsyncIOMotorClient(settings.MONGO_URI)
    db_instance.db = db_instance.client.medguard
    
    # Define collections
    db_instance.users = db_instance.db.users
    db_instance.drugs = db_instance.db.drugs
    db_instance.interactions = db_instance.db.interactions
    db_instance.predictions = db_instance.db.predictions
    db_instance.sessions = db_instance.db.sessions
    db_instance.audit_logs = db_instance.db.audit_logs
    
    try:
        # Ping the server to verify connection
        await db_instance.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

async def close_db():
    """Close MongoDB connection."""
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed")

async def get_db():
    """FastAPI dependency to get the database instance."""
    return db_instance.db
