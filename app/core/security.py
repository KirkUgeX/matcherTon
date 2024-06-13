from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes
from fastapi import HTTPException
import asyncio
import os
import base64
from fastapi.security import OAuth2
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.openapi.models import OAuthFlowPassword as OAuthFlowPasswordModel
from fastapi import Request, status

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
password = os.getenv('CHAT_CRYPT_PAS')


async def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


class AESCipher(object):
    def __init__(self, key):
        self.key = key

    async def encrypt(self, raw):
        loop = asyncio.get_event_loop()
        raw = await loop.run_in_executor(None, self._pad, raw.encode('utf-8'))
        iv = await loop.run_in_executor(None, get_random_bytes, AES.block_size)
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        encrypted = await loop.run_in_executor(None, cipher.encrypt, raw)
        return base64.b64encode(iv + encrypted)

    async def decrypt(self, enc):
        loop = asyncio.get_event_loop()
        enc = await loop.run_in_executor(None, base64.b64decode, enc)
        iv = enc[:AES.block_size]
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        decrypted = await loop.run_in_executor(None, cipher.decrypt, enc[AES.block_size:])
        decrypted = await loop.run_in_executor(None, self._unpad, decrypted)
        return decrypted.decode('utf-8')

    def _pad(self, s):
        # Extension to multiples of 16 bytes
        return s + bytes([AES.block_size - len(s) % AES.block_size] * (AES.block_size - len(s) % AES.block_size))

    def _unpad(self, s):
        # Deleting an add-on after transcription
        return s[:-s[-1]]


class ProofBearer(OAuth2):
    def __init__(self, tokenUrl: str):
        self.model = OAuthFlowsModel(password=OAuthFlowPasswordModel(tokenUrl=tokenUrl))
        super().__init__(flows=self.model)

    async def __call__(self, request: Request) -> str:
        auth_header: str = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated"
            )
        return auth_header.split(" ")[1]


async def encrypter(data, password=password):
    try:
        salt = get_random_bytes(16)
        kdf = await asyncio.to_thread(PBKDF2, password, salt, dkLen=32, count=1000)
        key = kdf[:32]

        cipher = AESCipher(key)
        encrypted_data = await cipher.encrypt(data)
        stroke_key = base64.b64encode(key).decode('ASCII')
        return {"encrypted_data": str(encrypted_data), "key": stroke_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Message encryption error :{str(e)}")


async def decrypter(encrypted_data, stoke_key) -> str:
    try:
        key = base64.b64decode(stoke_key)
        cipher = AESCipher(key)
        byte_data = encrypted_data[2:-1].encode()
        decrypted_data = await cipher.decrypt(byte_data)
        print(f'Decrypted: {decrypted_data}')
        return str(decrypted_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Message decryption error :{str(e)}")
