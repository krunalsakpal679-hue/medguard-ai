from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.logger import logger

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_db():
    try:
        db_instance.client = AsyncIOMotorClient(settings.MONGO_URI)
        db_instance.db = db_instance.client.get_default_database()
        
        # Verify connection
        await db_instance.client.admin.command('ping')
        logger.info("Connected to MongoDB Instance successfully.")
        
        # Initialize Collections
        db_instance.users = db_instance.db.users
        db_instance.drugs = db_instance.db.drugs
        db_instance.interactions = db_instance.db.interactions
        db_instance.predictions = db_instance.db.predictions
        db_instance.sessions = db_instance.db.sessions
        db_instance.audit_logs = db_instance.db.audit_logs
        db_instance.uploads = db_instance.db.uploads
        db_instance.conversations = db_instance.db.conversations
        db_instance.messages = db_instance.db.messages
        
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        # We don't raise here so the app can still boot in restricted mode
        pass

async def close_db():
    if db_instance.client:
        db_instance.client.close()
        logger.info("Closed MongoDB connection.")

async def get_db():
    return db_instance.db
