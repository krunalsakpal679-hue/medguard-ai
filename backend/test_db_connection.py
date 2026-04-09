import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Set PYTHONPATH to current directory
sys.path.append(os.getcwd())
from app.core.config import settings

async def test_db():
    print(f"DEBUG: Starting DB Test...")
    print(f"DEBUG: MONGO_URI starts with: {settings.MONGO_URI[:20]}...")
    
    client = AsyncIOMotorClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
    db_name = settings.MONGO_URI.split('/')[-1].split('?')[0] or 'medguard'
    print(f"DEBUG: Targeting Database: {db_name}")
    db = client[db_name]
    
    try:
        # Ping
        print("DEBUG: Pinging admin...")
        await client.admin.command('ping')
        print("SUCCESS: MongoDB Ping Successful")
        
        # Test Write
        print("DEBUG: Attempting test write to 'users' collection...")
        test_user = {"email": "test_connection@medguard.ai", "test": True}
        result = await db.users.insert_one(test_user)
        print(f"SUCCESS: Test Write Successful. ID: {result.inserted_id}")
        
        # Test Read
        print(f"DEBUG: Attempting to read ID: {result.inserted_id}")
        found = await db.users.find_one({"_id": result.inserted_id})
        if found:
            print(f"SUCCESS: Test Read Successful: {found.get('email')}")
        else:
            print("FAILURE: Test Read failed (document not found)")
        
        # Cleanup
        print("DEBUG: Cleaning up...")
        await db.users.delete_one({"_id": result.inserted_id})
        print("SUCCESS: Test Cleanup Successful")
        
    except Exception as e:
        print(f"ERROR: DB Test Failed: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_db())
