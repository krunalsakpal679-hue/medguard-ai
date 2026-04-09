import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(test_app: AsyncClient):
    response = await test_app.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_root_endpoint(test_app: AsyncClient):
    response = await test_app.get("/")
    assert response.status_code == 200
    assert "app" in response.json()

@pytest.mark.asyncio
async def test_cors_headers(test_app: AsyncClient):
    response = await test_app.options("/", headers={
        "Origin": "http://localhost:3000", 
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type"
    })
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
