import asyncio
import logging
import json
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from pymongo.errors import CollectionInvalid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ATLAS_SEARCH_INDEX_DEF = {
    "name": "drugs_search",
    "definition": {
        "mappings": {
            "dynamic": False,
            "fields": {
                "name": { "type": "string", "analyzer": "lucene.standard" },
                "generic_name": { "type": "string", "analyzer": "lucene.standard" },
                "brand_names": { "type": "string", "analyzer": "lucene.standard" },
                "drug_class": { "type": "string", "analyzer": "lucene.keyword" },
                "is_active": { "type": "boolean" }
            }
        }
    }
}

async def setup_atlas():
    logger.info("Initializing MongoDB Atlas Production Setup...")
    
    # 1. Test connection to Atlas
    try:
        client = AsyncIOMotorClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[settings.MONGO_DB_NAME]
        await client.server_info()
        logger.info("✅ Connection to Atlas cluster established.")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Atlas: {e}")
        return

    # 2. Create foundational collections
    collections_needed = ["users", "drugs", "predictions", "prescriptions"]
    existing_collections = await db.list_collection_names()
    
    for coll in collections_needed:
        if coll not in existing_collections:
            try:
                await db.create_collection(coll)
                logger.info(f"Created collection: {coll}")
            except CollectionInvalid:
                pass
                
    # 3. Create Production Indexes (Standard)
    logger.info("Creating standard production indexes...")
    from scripts.create_indexes import create_indexes
    await create_indexes()
    logger.info("✅ Standard indexes created.")

    # 4. Enable Atlas Search index for Full-Text Search
    logger.info("Setting up Atlas Search index for 'drugs' collection...")
    try:
        # Check if search index exists
        search_indexes = []
        async for index in db.drugs.list_search_indexes():
            search_indexes.append(index["name"])
            
        if "drugs_search" not in search_indexes:
            logger.info("Creating 'drugs_search' Atlas Search index. This may take a few minutes to build on Atlas.")
            await db.drugs.create_search_index(model=ATLAS_SEARCH_INDEX_DEF)
            logger.info("✅ Atlas Search index creation command sent.")
        else:
            logger.info("✅ 'drugs_search' index already exists.")
            
    except AttributeError:
        # list_search_indexes / create_search_index might not be mapped in all motor versions.
        logger.warning(f"Notice: Upgrade to PyMongo 4.5+ / Motor 3.3+ for native search index creation.")
        logger.warning(f"Alternatively, create the index '{ATLAS_SEARCH_INDEX_DEF['name']}' directly in the Atlas UI.")
    except Exception as e:
        logger.error(f"❌ Failed to create Atlas Search index: {e}")

    logger.info("🎉 MongoDB Atlas setup complete!")

if __name__ == "__main__":
    asyncio.run(setup_atlas())
