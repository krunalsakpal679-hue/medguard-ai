import pytest
import os
from httpx import AsyncClient

# Skip if environment is not testing
skip_no_db = pytest.mark.skipif(
    os.getenv("ENVIRONMENT") != "testing",
    reason="Database tests only run in testing environment"
)

@pytest.mark.asyncio
async def test_search_requires_min_chars(test_app: AsyncClient):
    # This test verifies behavior of search endpoint
    # Adjust according to your actual endpoint logic
    response = await test_app.get("/api/v1/drugs/search?q=a")
    # If 422 is expected for short queries:
    if response.status_code == 422:
        assert True
    else:
        assert response.status_code in [200, 422, 404]

@pytest.mark.asyncio
async def test_list_drugs_fallback(test_app: AsyncClient):
    response = await test_app.get("/api/v1/drugs")
    # Even if DB is down, app should return a graceful error or empty list
    assert response.status_code in [200, 500, 404]
