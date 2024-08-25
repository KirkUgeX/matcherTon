from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID



class Socials(BaseModel):
    x: str | None = None
    linkedin: str | None = None
    telegram: str | None = None


class Work(BaseModel):
    position: str | None = None
    company: str | None = None


class NFT(BaseModel):
    name: str | None
    image_url: str
    opensea_url: str | None


class AddUserRequest(BaseModel):
    profileNickname: str
    address: str
    socials: Socials
    tagsSphere: list[str]
    work: Work
    nfts: list[NFT]
    description: str
    tg_userId: int
    avatar: str | None

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
    tg_userid: int | str | None
    avatar: str | None


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

class NumPointsSwipesResponse(BaseModel):
    points: int
    swipes:int

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
    user_id: int | None


class nextUserResponse(BaseModel):
    nextUserId: int | None

class changeFilter(BaseModel):
    score: list[int]
    passions: list[str]
    achievements: list[str]


class getAllMatches(BaseModel):
    user_id: int


class Match(BaseModel):
    user_id: int
    nick: str
    NFT: NFT | None


class getAllMatchesResponse(BaseModel):
    matches: list[Match or None]


class delMatch(BaseModel):
    target_id: int


class whitelistreq(BaseModel):
    email: str


class AddNFTS(BaseModel):
    address: str
    picked_nfts_list: list[NFT]


class getAvatarTg(BaseModel):
    tg_user_id: int


class getAvatarTgResponse(BaseModel):
    img: str
