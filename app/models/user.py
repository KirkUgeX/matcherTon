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


class getAllUserInfoRequest(BaseModel):
    userID: int


class getAllUserInfoResponse(BaseModel):
    nickname: str
    address: str
    socialLinks: Socials
    tagsSphere: list[str]
    work: Work
    ban: bool
    mute: bool
    nfts: list[NFT]
    score: int
    achievements: list[str]
    description: str
    points: int


class getMinUserInfoRequest(BaseModel):
    userID: int


class getMinUserInfoResponse(BaseModel):
    nickname: str
    address: str
    socialLinks: Socials
    tagsSphere: list[str]
    work: Work
    ban: bool
    mute: bool
    nfts: list[NFT]


class change_user_info(BaseModel):
    userID: int
    profileNickname: str
    address: str
    socials: Socials
    tagsSphere: list[str]
    work: Work
    nfts: list[NFT]
    description: str


class responseSuccess(BaseModel):
    response: str


class uniquenameRequest(BaseModel):
    username: str


class uniquenameResponse(BaseModel):
    unique: bool


class ban(BaseModel):
    userID: int
    newBanStatus: bool


class mute(BaseModel):
    userID: int
    newMuteStatus: bool


class NFTgetALL(BaseModel):
    address: str
    chain: str


class NFTgetALLResponse(BaseModel):
    nfts: list[NFT]


class AddNFTS(BaseModel):
    address: str
    picked_nfts_list: list[NFT]


class reactionLikeDislike(BaseModel):
    user_id: int
    target_id: int
    reaction_type: str


class reactionLikeDislikeResponse(BaseModel):
    resultMatchOrNoMatch: str


class nextUser(BaseModel):
    user_id: int


class nextUserResponse(BaseModel):
    nextUserId: int or None


class getAllMatches(BaseModel):
    user_id: int


class Match(BaseModel):
    user_id: int
    nick: str
    NFT: NFT


class getAllMatchesResponse(BaseModel):
    matches: list[Match or None]


class delMatch(BaseModel):
    target_id: int


class whitelistreq(BaseModel):
    email: str
