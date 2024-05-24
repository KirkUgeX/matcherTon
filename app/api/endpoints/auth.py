from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, APIKeyHeader
from fastapi.responses import JSONResponse
from jose import jwt
from typing import Optional

from app.core.config import settings
from app.core.security import create_access_token
from app.models.token import TokenData
from app.utils.auth import verify_signature, check_matcher_nft_wallet
from app.utils.uf import idFromWallet, uuidFromWallet

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=settings.TOKEN_URL)
api_key_header = APIKeyHeader(name=settings.API_KEY_NAME, auto_error=False)

def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещен"
        )

@router.get("/openapi.json", dependencies=[Depends(verify_api_key)])
async def get_open_api_endpoint():
    return JSONResponse(get_openapi(title="FastAPI", version=1, routes=router.routes))

@router.get("/docs", include_in_schema=False)
async def get_documentation(api_key: str = Depends(verify_api_key)):
    return get_swagger_ui_html(openapi_url="/openapi.json", title="docs")

@router.post("/token")
async def generate_token(form_data: OAuth2PasswordRequestForm = Depends()):
    address = form_data.username
    signature_mess = form_data.password
    signature, message = signature_mess.split("|||")
    if not verify_signature(address, signature, message):
        return {"access_token": "Sign FALSE"}
    user_id = uuid_wall = None
    if check_matcher_nft_wallet(address):
        user_id = idFromWallet(address)
        uuid_wall = uuidFromWallet(address)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": address, "user_id": user_id, "uuid": uuid_wall}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        address: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        if address is None:
            raise credentials_exception
        return TokenData(address=address, user_id=user_id)
    except jwt.JWTError:
        raise credentials_exception

async def get_current_holder(token: str = Depends(oauth2_scheme)) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        address: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        if address is None or user_id is None:
            raise credentials_exception
        return TokenData(address=address, user_id=user_id)
    except jwt.JWTError:
        raise credentials_exception
