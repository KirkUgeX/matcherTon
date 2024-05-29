from fastapi.testclient import TestClient
from app.main import app
import random
import json
import app.utils.recommendation_sys as rs
client = TestClient(app)

user_data_template={
  "profile_nickname": "string",
  "address": "0x"+str(random.randint(100000000,100000000000)),
  "socials": {
    "x": "string",
    "linkedin": "string",
    "telegram": "string"
  },
  "tags_sphere": [
    "string","two"
  ],
  "work": {
    "position": "string",
    "company": "string"
  },
  "nfts": [
    {
      "name": "string",
      "image_url": "string",
      "opensea_url": "string"
    }
  ],
  "description": "stsa sd ring"
}

def test_add_user():

    wallet = "0xe0e009584836428be45b92459efca0209e969674"
    hash_sign = "0x5d5cd932940f3ebc5fa142b47394445c0a3c6753f428afe2f6f12a2327f2661868bbfd3db8fc1406550d12784d10a52d968c1805396082a69a4384a7cef796db1c"
    sign_msg = "I verify that I'm the owner of 0xe0e009584836428be45b92459efca0209e969674 , I am a MagicalTux cat riding shotgun with AutoBot leader bringing fun, community, and more transactions through 0x34B490578F3BAec3D1AD4eca6bD34271BF772b5E and I'm an optimist (meow)."
    password_part = hash_sign + "|||" + sign_msg
    response = client.post("/token", data={"username": wallet, "password": password_part})

    header = {
        "Authorization": f"Bearer {response.json()['access_token']}"
    }

    response = client.post("/requestAddUser", data=json.dumps(user_data_template),headers=header)
    print(response.json())
    assert response.status_code == 200
    assert response.json()["response"] == "200"
    assert isinstance(response.json()["user_uuid"], str)
    # Проверку добавления в таблицу / в матрицу