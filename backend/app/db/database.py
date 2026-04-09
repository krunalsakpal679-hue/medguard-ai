from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.logger import logger
from fastapi import HTTPException

class Database:
    client: AsyncIOMotorClient = None
    db = None
    
    # Pre-define collections logic
    @property
    def users(self): return self.db.users if self.db is not None else None
    @property
    def drugs(self): return self.db.drugs if self.db is not None else None
    @property
    def predictions(self): return self.db.predictions if self.db is not None else None
    @property
    def sessions(self): return self.db.sessions if self.db is not None else None
    @property
    def audit_logs(self): return self.db.audit_logs if self.db is not None else None

db_instance = Database()

async def connect_db():
    try:
        logger.info(f"Targeting Clinical Cluster: {settings.MONGO_URI.split('@')[-1] if '@' in settings.MONGO_URI else 'local'}")
        db_instance.client = AsyncIOMotorClient(settings.MONGO_URI)
        
        # Determine database name from URI or use default
        db_name = settings.MONGO_URI.split('/')[-1].split('?')[0] or 'medguard'
        db_instance.db = db_instance.client[db_name]
        
        # Verify connection
        await db_instance.client.admin.command('ping')
        logger.info(f"Successfully connected to Clinical Vault: [{db_name}]")
        
    except Exception as e:
        logger.error(f"Vault Integrity Breach: Database connection failed: {e}")
        db_instance.db = None

async def close_db():
    if db_instance.client:
        db_instance.client.close()
        logger.info("Clinical Vault connection terminated.")

async def get_db():
    if db_instance.db is None:
        logger.critical("ACCESS DENIED: Database subsystem offline")
        raise HTTPException(status_code=503, detail="Clinical Database Offline")
    return db_instance.db
