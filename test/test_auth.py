from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_token():
    wallet = "0xe0e009584836428be45b92459efca0209e969674"
    hash_sign = "0x5d5cd932940f3ebc5fa142b47394445c0a3c6753f428afe2f6f12a2327f2661868bbfd3db8fc1406550d12784d10a52d968c1805396082a69a4384a7cef796db1c"
    sign_msg = "I verify that I'm the owner of 0xe0e009584836428be45b92459efca0209e969674 , I am a MagicalTux cat riding shotgun with AutoBot leader bringing fun, community, and more transactions through 0x34B490578F3BAec3D1AD4eca6bD34271BF772b5E and I'm an optimist (meow)."
    password_part=hash_sign+"|||"+sign_msg
    response = client.post("/token", data={"username": wallet, "password": password_part})

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"


def test_invalid_token():
    response = client.post("/token", data={"username": "0xe0e009584836428be45b92459efca0209e969674", "password": "0xe0e009584836428be45b92459efca0209e969674|||0xe0e00sasfff9584836428be45b92459efca0209e969674"})

    assert response.status_code == 200
    assert response.json()["access_token"] == "Sign FALSE"

