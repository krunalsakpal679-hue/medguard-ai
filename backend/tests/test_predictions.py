import pytest

@pytest.mark.asyncio
async def test_predict_interaction_flow(test_app, user_token, sample_drugs):
    headers = {"Authorization": f"Bearer {user_token}"}
    payload = {
        "drug_ids": [sample_drugs[0], sample_drugs[1]],
        "user_context": "Patient with mild hypertension"
    }
    
    # 1. Execute Prediction
    response = await test_app.post("/predictions/check", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "overall_risk_level" in data
    assert len(data["pair_results"]) == 1

    # 2. Verify History Persistence
    history_res = await test_app.get("/predictions/history", headers=headers)
    assert history_res.status_code == 200
    assert len(history_res.json()) >= 1
    assert history_res.json()[0]["overall_risk_level"] == data["overall_risk_level"]

@pytest.mark.asyncio
async def test_predict_too_few_drugs(test_app, user_token, sample_drugs):
    headers = {"Authorization": f"Bearer {user_token}"}
    payload = {"drug_ids": [sample_drugs[0]]}
    response = await test_app.post("/predictions/check", json=payload, headers=headers)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_prediction_auth_isolation(test_app, user_token, sample_drugs, test_db_conn):
    # Create prediction for user A
    headers = {"Authorization": f"Bearer {user_token}"}
    res = await test_app.post("/predictions/check", json={"drug_ids": [sample_drugs[0], sample_drugs[1]]}, headers=headers)
    pred_id = res.json()["id"]

    # Try to access as user B (admin in this case to simplify)
    admin_data = {"email": "another@user.com", "role": "USER", "is_active": True}
    res_b = await test_db_conn.users.insert_one(admin_data)
    from app.core.auth_service import auth_service
    token_b = auth_service.create_access_token({"sub": str(res_b.inserted_id)})
    
    headers_b = {"Authorization": f"Bearer {token_b}"}
    response = await test_app.get(f"/predictions/{pred_id}", headers=headers_b)
    assert response.status_code == 403
