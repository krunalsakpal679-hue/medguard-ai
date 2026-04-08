import pytest
import httpx
import os

# Smoke test configuration
PROD_URL = os.getenv("PROD_API_URL", "https://medguard-api.onrender.com")

@pytest.mark.asyncio
async def test_production_health_endpoint():
    """
    Verifies that the production gateway is responsive and returning the 'ok' heartbeat.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{PROD_URL}/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
        assert response.json()["environment"] == "production"

@pytest.mark.asyncio
async def test_swagger_disabled_in_prod():
    """
    Ensures that the API documentation is not leaking in the production environment.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{PROD_URL}/docs")
        # Should be 404 or redirected to login/dashboard
        assert response.status_code == 404

@pytest.mark.asyncio
async def test_cors_preflight():
    """
    Verifies that the production CORS policy correctly gates cross-origin analytical requests.
    """
    headers = {
        "Origin": "https://medguard.ai",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type"
    }
    async with httpx.AsyncClient() as client:
        response = await client.options(f"{PROD_URL}/api/v1/predictions/check", headers=headers)
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers

@pytest.mark.asyncio
async def test_auth_route_availability():
    """
    Confirms that the authentication gateway exists even if unauthorized.
    """
    async with httpx.AsyncClient() as client:
        # Should return 422 (Unprocessable) due to missing body, not 404 (Not Found)
        response = await client.post(f"{PROD_URL}/api/v1/auth/google")
        assert response.status_code == 422
