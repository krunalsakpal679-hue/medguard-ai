import pytest
import io
from unittest.mock import patch, MagicMock

@pytest.mark.asyncio
@patch("app.services.upload_service.s3_client")
async def test_upload_valid_image(mock_s3, test_app, user_token):
    mock_s3.upload_fileobj = MagicMock()
    
    headers = {"Authorization": f"Bearer {user_token}"}
    file_content = b"fake-image-data"
    files = {"file": ("prescription.jpg", io.BytesIO(file_content), "image/jpeg")}
    
    response = await test_app.post("/upload/prescription", files=files, headers=headers)
    assert response.status_code == 200
    assert "upload_id" in response.json()
    assert response.json()["ocr_status"] == "processing"

@pytest.mark.asyncio
async def test_upload_invalid_type(test_app, user_token):
    headers = {"Authorization": f"Bearer {user_token}"}
    files = {"file": ("malicious.exe", io.BytesIO(b"data"), "application/octet-stream")}
    response = await test_app.post("/upload/prescription", files=files, headers=headers)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_text_parsing_nlp(test_app, user_token):
    headers = {"Authorization": f"Bearer {user_token}"}
    payload = {"text": "Patient is currently taking Metformin 500mg and Aspirin daily."}
    response = await test_app.post("/upload/text", json=payload, headers=headers)
    assert response.status_code == 200
    assert "extracted_drugs" in response.json()
    # Assuming NLP finds them
    assert any("Metformin" in d for d in response.json()["extracted_drugs"])

@pytest.mark.asyncio
async def test_ocr_status_polling(test_app, user_token, test_db_conn):
    # Insert mock upload
    upload_data = {
        "user_id": "test_user",
        "ocr_status": "completed",
        "extracted_drugs": ["Metformin", "Aspirin"],
        "confidence_scores": {"Metformin": 0.95}
    }
    res = await test_db_conn.uploads.insert_one(upload_data)
    upload_id = str(res.inserted_id)
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response = await test_app.get(f"/upload/{upload_id}/status", headers=headers)
    assert response.status_code == 200
    assert response.json()["ocr_status"] == "completed"
    assert "Metformin" in response.json()["extracted_drugs"]
