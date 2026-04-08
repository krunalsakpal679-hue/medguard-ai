import pytest
from unittest.mock import patch

@pytest.mark.asyncio
async def test_health_check(test_app):
    response = await test_app.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "operational"

@pytest.mark.asyncio
async def test_get_me_unauthenticated(test_app):
    response = await test_app.get("/auth/me")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me_authenticated(test_app, user_token, test_user):
    headers = {"Authorization": f"Bearer {user_token}"}
    response = await test_app.get("/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email

@pytest.mark.asyncio
@patch("app.core.auth_service.verify_google_token")
async def test_google_auth_creates_user(mock_verify, test_app):
    mock_verify.return_value = {
        "email": "new@google.user",
        "name": "Google User",
        "sub": "google123"
    }
    response = await test_app.post("/auth/google", json={"token": "fake_token"})
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["user"]["email"] == "new@google.user"

@pytest.mark.asyncio
async def test_role_protected_route_forbidden(test_app, user_token):
    headers = {"Authorization": f"Bearer {user_token}"}
    response = await test_app.get("/admin/users", headers=headers)
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_role_protected_route_success(test_app, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await test_app.get("/admin/users", headers=headers)
    assert response.status_code == 200
