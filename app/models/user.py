from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID

class Socials(BaseModel):
    x: Optional[str] = None
    linkedin: Optional[str] = None
    telegram: Optional[str] = None

class Work(BaseModel):
    position: Optional[str] = None
    company: Optional[str] = None

class NFT(BaseModel):
    name: str
    image_url: str
    opensea_url: str

class AddUserRequest(BaseModel):
    profile_nickname: str
    address: str
    socials: Socials
    tags_sphere: List[str]
    work: Work
    nfts: List[NFT]
    description: str

class SuccessAndUuid(BaseModel):
    response: str
    user_uuid: UUID
