from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Security, status
from app.core.security import ProofBearer
from app.models.token import OAuthData,OAuthDataTG
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, APIKeyHeader
from fastapi.responses import JSONResponse
from jose import jwt
from typing import Optional
from dotenv import load_dotenv

from app.core.config import settings
from app.core.security import create_access_token
from app.models.token import TokenData
from app.utils.auth import check_proof, generate_payload, validate
from app.utils.auth import verify_signature, check_matcher_nft_wallet
from app.utils.uf import idFromWallet, uuidFromWallet
import app.utils.uf as uf

router = APIRouter()

oauth2_scheme = ProofBearer(tokenUrl=settings.TOKEN_URL)
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
async def generate_token(form_data: OAuthData):
    account = form_data.account
    proof = form_data.proof
    address = account.address
    result = await check_proof([proof, account])

    if not result["result"]:
        raise HTTPException(
            status_code=401,
            detail="Sign validation failed",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = uuid_wall = None
    if await uf.idFromWallet(address) != None:
        user_id = await uf.idFromWallet(address)
        uuid_wall = await uf.uuidFromWallet(address)
        #print(uuid_wall)

    access_token_expires = timedelta(minutes=20)
    access_token = await create_access_token(
        data={"sub": address, "user_id": user_id, "uuid": uuid_wall}, expires_delta=access_token_expires
    )
    print({"sub": address, "user_id": user_id, "uuid": uuid_wall})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/tokentg")
async def generate_token_tg(form_data: OAuthDataTG):
    load_dotenv()
    hash =form_data.hash
    init_data=form_data.init_data
    user_tg_id=form_data.user_tg_id

    result = await validate(hash,init_data,os.getenv("BOT_TOKEN"))

    if not result:
        raise HTTPException(
            status_code=401,
            detail="Sign validation failed",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = uuid_wall = None
    if await uf.idFromTG(user_tg_id) != None:
        user_id = await uf.idFromTG(user_tg_id)
        uuid_wall = await uf.idFromTG(user_tg_id)
        #print(uuid_wall)

    access_token_expires = timedelta(minutes=20)
    access_token = await create_access_token(
        data={"sub": user_tg_id, "user_id": user_id, "uuid": uuid_wall}, expires_delta=access_token_expires
    )
    print({"sub": user_tg_id, "user_id": user_id, "uuid": uuid_wall})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/generate-payload")
async def generate_payload_for_auth():
    return await generate_payload()


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
        token_data = TokenData(address=address, user_id=user_id)
    except jwt.JWTError:
        raise credentials_exception
    return token_data


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

        if address is None:
            raise credentials_exception
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(address=address, user_id=user_id)
    except jwt.JWTError:
        raise credentials_exception
    return token_data
