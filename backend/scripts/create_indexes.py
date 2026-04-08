import asyncio
from app.db.database import connect_db, get_db
from app.db.indexes import create_indexes
from loguru import logger

async def main():
    logger.info("Initializing clinical database indexes...")
    await connect_db()
    db = await get_db()
    await create_indexes(db)
    logger.info("Indexing sequence complete.")

if __name__ == "__main__":
    asyncio.run(main())
