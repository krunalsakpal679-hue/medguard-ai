import asyncio
import pytest
import pytest_asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from httpx import AsyncClient
from typing import AsyncGenerator
from bson import ObjectId

from app.main import app
from app.db.database import get_db
from app.core.config import settings
from app.core.auth_service import auth_service
from app.models.user import UserInDB, UserRole

# 1. Database Setup
TEST_MONGO_URL = f"mongodb://{settings.MONGO_HOST}:{settings.MONGO_PORT}"
test_client = AsyncIOMotorClient(TEST_MONGO_URL)
test_db_conn = test_client["medguard_test"]

async def override_get_db():
    yield test_db_conn

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session")
async def test_app() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest_asyncio.fixture(autouse=True)
async def clean_db():
    """Wipes test collections before each test to ensure clinical isolation."""
    collections = await test_db_conn.list_collection_names()
    for col in collections:
        await test_db_conn[col].delete_many({})
    yield

# 2. Identity Fixtures
@pytest_asyncio.fixture
async def test_user():
    user_data = {
        "full_name": "Test User",
        "email": "test@user.com",
        "role": UserRole.USER,
        "is_active": True,
        "prediction_count": 0
    }
    res = await test_db_conn.users.insert_one(user_data)
    user_data["id"] = res.inserted_id
    return UserInDB(**user_data)

@pytest_asyncio.fixture
async def admin_user():
    user_data = {
        "full_name": "Admin User",
        "email": "admin@medguard.ai",
        "role": UserRole.ADMIN,
        "is_active": True,
        "prediction_count": 0
    }
    res = await test_db_conn.users.insert_one(user_data)
    user_data["id"] = res.inserted_id
    return UserInDB(**user_data)

@pytest.fixture
def user_token(test_user):
    return auth_service.create_access_token({"sub": str(test_user.id)})

@pytest.fixture
def admin_token(admin_user):
    return auth_service.create_access_token({"sub": str(admin_user.id)})

# 3. Clinical Fixtures
@pytest_asyncio.fixture
async def sample_drugs():
    drugs = [
        {"name": "Metformin", "generic_name": "Metformin Hydrochloride", "drug_class": "Biguanide", "is_active": True},
        {"name": "Aspirin", "generic_name": "Acetylsalicylic Acid", "drug_class": "NSAID", "is_active": True},
        {"name": "Warfarin", "generic_name": "Warfarin Sodium", "drug_class": "Anticoagulant", "is_active": True}
    ]
    res = await test_db_conn.drugs.insert_many(drugs)
    return [str(id) for id in res.inserted_ids]
