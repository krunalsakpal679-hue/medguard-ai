import pytest
import asyncio
from httpx import AsyncClient
from app.main import app
from app.core.config import settings
from app.db.database import get_db
from jose import jwt

@pytest.fixture(scope="session")
def event_loop():
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def test_app():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def test_user():
    return {
        "sub": "66144e000000000000000001",
        "email": "tester@medguard.ai",
        "full_name": "Test User",
        "role": "user"
    }

@pytest.fixture
def user_token(test_user):
    return jwt.encode(test_user, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

@pytest.fixture
def admin_token(test_user):
    admin = test_user.copy()
    admin["role"] = "admin"
    return jwt.encode(admin, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
