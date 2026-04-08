import pytest

@pytest.mark.asyncio
async def test_search_drugs_returns_results(test_app, sample_drugs):
    response = await test_app.get("/drugs/search?q=Met")
    assert response.status_code == 200
    results = response.json()
    assert len(results) >= 1
    assert results[0]["name"] == "Metformin"

@pytest.mark.asyncio
async def test_get_drug_by_id(test_app, sample_drugs):
    drug_id = sample_drugs[0]
    response = await test_app.get(f"/drugs/{drug_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Metformin"

@pytest.mark.asyncio
async def test_create_drug_unauthorized(test_app, user_token):
    headers = {"Authorization": f"Bearer {user_token}"}
    payload = {"name": "NewDrug", "generic_name": "Generic", "drug_class": "Class"}
    response = await test_app.post("/drugs", json=payload, headers=headers)
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_create_drug_admin(test_app, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "name": "AdminDrug", 
        "generic_name": "AdminGen", 
        "drug_class": "AdminClass",
        "half_life_hours": 12.5,
        "bioavailability": 0.85
    }
    response = await test_app.post("/drugs", json=payload, headers=headers)
    assert response.status_code == 201
    assert response.json()["name"] == "AdminDrug"

@pytest.mark.asyncio
async def test_soft_delete_drug(test_app, admin_token, sample_drugs):
    drug_id = sample_drugs[0]
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await test_app.delete(f"/drugs/{drug_id}", headers=headers)
    assert response.status_code == 204
    
    # Verify soft delete
    get_res = await test_app.get(f"/drugs/{drug_id}")
    assert get_res.json()["is_active"] == False
