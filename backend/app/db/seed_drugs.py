import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def seed():
    client = AsyncIOMotorClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
    db = client.medguard
    
    drugs = [
        {"name": "Metformin", "generic_name": "Glucophage", "drug_class": "Biguanide", "half_life_hours": 6.2, "bioavailability": 0.5, "is_active": True},
        {"name": "Aspirin", "generic_name": "Acetylsalicylic Acid", "drug_class": "NSAID", "half_life_hours": 0.25, "bioavailability": 0.8, "is_active": True},
        {"name": "Warfarin", "generic_name": "Coumadin", "drug_class": "Anticoagulant", "half_life_hours": 40.0, "bioavailability": 0.95, "is_active": True},
        {"name": "Sertraline", "generic_name": "Zoloft", "drug_class": "SSRI", "half_life_hours": 26.0, "bioavailability": 0.44, "is_active": True},
        {"name": "Atorvastatin", "generic_name": "Lipitor", "drug_class": "Statin", "half_life_hours": 14.0, "bioavailability": 0.12, "is_active": True}
    ]
    
    await db.drugs.delete_many({})
    await db.drugs.insert_many(drugs)
    print("Database seeded with clinical molecules.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
