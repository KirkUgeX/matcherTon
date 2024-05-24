from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_token():
    response = client.post("/token", data={"username": "test_user", "password": "test_password"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_invalid_token():
    response = client.post("/token", data={"username": "invalid_user", "password": "invalid_password"})
    assert response.status_code == 401
