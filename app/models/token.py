from pydantic import BaseModel
from typing import Optional


class TokenData(BaseModel):
    address: Optional[str] = None
    user_id: Optional[int] = None
    uuid: Optional[int] = None


class Proof(BaseModel):
    timestamp: int
    domain: dict
    signature: str
    payload: str


class Account(BaseModel):
    address: str
    chain: str
    publicKey: str
    walletStateInit: str


class OAuthData(BaseModel):
    account: Account
    proof: Proof
