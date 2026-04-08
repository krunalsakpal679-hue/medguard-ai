from motor.motor_asyncio import AsyncIOMotorDatabase
import pymongo
from app.core.logger import logger

async def create_indexes(db: AsyncIOMotorDatabase):
    """Create all necessary indexes for the MongoDB collections."""
    try:
        # User Indexes
        await db.users.create_index([("email", pymongo.ASCENDING)], unique=True)
        await db.users.create_index([("google_id", pymongo.ASCENDING)])
        
        # Drug Indexes (Text search and Class-based)
        await db.drugs.create_index([
            ("name", pymongo.TEXT),
            ("generic_name", pymongo.TEXT),
            ("brand_names", pymongo.TEXT)
        ], name="drug_text_search")
        await db.drugs.create_index([("drug_class", pymongo.ASCENDING)])
        
        # Interaction Indexes (Unique pairs)
        await db.interactions.create_index([
            ("drug_a_id", pymongo.ASCENDING),
            ("drug_b_id", pymongo.ASCENDING)
        ], unique=True)
        
        # Prediction Indexes (User history ordered by time)
        await db.predictions.create_index([
            ("user_id", pymongo.ASCENDING),
            ("created_at", pymongo.DESCENDING)
        ])
        
        # Session Indexes (Auto-expiration)
        await db.sessions.create_index([("expires_at", pymongo.ASCENDING)], expireAfterSeconds=0)
        
        logger.info("MongoDB indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating MongoDB indexes: {e}")
        raise e
