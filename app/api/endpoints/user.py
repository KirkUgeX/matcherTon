from fastapi import APIRouter, Body, Depends, HTTPException, Request, BackgroundTasks
from fastapi.responses import FileResponse
from app.models import user as user_model
from app.models.token import TokenData
from app.models.chat import ChatCreation, GetAllMessages
from app.core.limiter import limiter
from app.utils import uf
from app.utils import recommendation_sys as rs
from app.utils import recommendation_sys_wth_filter as rs_filter
from app.utils.html import escape_html
from app.api.endpoints.auth import get_current_user, get_current_holder
from app.utils.score import scoreBackground
import app.utils.nft_info_func  as nf
from app.messenger.msg_functions import create_chat, get_all_messages, get_all_chats
from app.bot import tg_avatars
import os
import json
from dotenv import load_dotenv
router = APIRouter()


@router.post("/requestAddUser")
@limiter.limit("1000/minute")
async def request_add_user(request: Request, background_tasks: BackgroundTasks,
                           user: user_model.AddUserRequest = Body(...),
                           current_user: TokenData = Depends(get_current_user)) -> user_model.SuccessAndUuid:

    print(user)
    try:
        if  await uf.unique_address(escape_html(user.address))!= True:
            print("if not await uf.unique_address(escape_html(user.address)):")
            raise HTTPException(status_code=409)

        socials = user.socials.dict()
        print(socials)
        socials_links = await uf.prepend_links(socials)
        print(type(socials_links), socials_links)
        for key, url_social in socials_links.items():
            if url_social == "invalid nickname in socials include link http or dot":
                raise HTTPException(
                    status_code=500,
                    detail=f"Error when adding a user: {key} invalid nickname in socials include link http or dot"
                )

        socials = socials_links
        work = user.work.dict()
        req_nfts = user.nfts
        nfts = [i.dict() for i in req_nfts]

        result = await uf.add_user(
            escape_html(user.profileNickname),
            escape_html(user.address),
            escape_html(socials),
            escape_html(user.tagsSphere),
            escape_html(work),
            escape_html(nfts),
            escape_html(user.description),
            escape_html(user.tg_userId),
            escape_html(user.avatar)
        )

        if isinstance(result, str):
            if "Error" in result:
                raise HTTPException(status_code=500, detail=f"{str(result)}")

        background_tasks.add_task(scoreBackground, escape_html(user.address), escape_html(user.tagsSphere),
                                  result[2])
        print({"response": result[0], "user_uuid": result[1]})
        return {"response": str(result[0]), "user_uuid": result[1]}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=409, detail=f"Error when adding a user: {str(e)}")


@router.post("/requestGetAllUserInfo")
@limiter.limit("1000/minute")
async def request_getAllUserInfo(request: Request, user: user_model.getAllUserInfoRequest = Body(...),
                                 current_user: TokenData = Depends(
                                     get_current_holder)) -> user_model.getAllUserInfoResponse:
    print(current_user)
    info = await uf.get_all_user_info(escape_html(user.userID))
    if isinstance(info, str):
        if "Error" in info:
            raise HTTPException(status_code=500, detail=f"{str(info)}")

    return info


@router.get("/getpassions")
async def get_passions():
    passions_list = ["Developer", "Rust", "Solidity", "Web3", "Web2", "Market Analysis", "On-chain Analysis",
                     "Tokenomics Analysis", "Digital Art", "3D Modeling", "Yield Farmer", "DeFi", "Protocol Research",
                     "DAO", "Security Audits", "Bloggs", "SMM", "Edu SMM", "Influencer", "Trader", "NFT Trading",
                     "Solana", "ETH", "BTC", "Market Making", "Risk management", "Biotech", "EdTech", "GameFi",
                     "SocialFi", "Product management", "Project management", "Startups", "Real Estate Investments",
                     "VC", "Angel Investments", "GameDev", "Marketing", "SEO", "ML/AI", "Data Science",
                     "Computer Vision", "LLM/GPT/NLP", "VR/AR", "Graphic Designer", "UX/UI"]
    return {"passions": passions_list}


@router.post("/requestGetAvatarTg")
@limiter.limit("1000/minute")
async def request_getMinUserInfo(request: Request, user: user_model.getAvatarTg = Body(...)
                                 ) -> user_model.getAvatarTgResponse:
    image = await tg_avatars.get_photo(user.tg_user_id)
    return {"img": str(image)}


@router.post("/requestGetMinUserInfo")
@limiter.limit("1000/minute")
async def request_getMinUserInfo(request: Request, user: user_model.getMinUserInfoRequest = Body(...),
                                 current_user: TokenData = Depends(
                                     get_current_holder)) -> user_model.getMinUserInfoResponse:
    try:
        info = await uf.get_min_user_info(escape_html(user.userID))
        if isinstance(info, str):
            if "Error" in info:
                raise HTTPException(status_code=500, detail=f"{str(info)}")
        return info
    except Exception as e:
        raise HTTPException(status_code=500,
                            detail=f"Error when obtaining minimal user information, requestGetMinUserInfo :{str(e)}")


@router.patch("/requestChangeUserInfo")
@limiter.limit("1000/minute")
async def request_change_user_info(request: Request, user: user_model.change_user_info = Body(...),
                                   current_user: TokenData = Depends(get_current_holder)) -> user_model.responseSuccess:
    socials = user.socials.dict()
    work = user.work.dict()
    req_nfts = user.nfts
    nfts = [i.dict() for i in req_nfts]
    result = await uf.change_user_info(escape_html(user.userID), escape_html(user.profileNickname),
                                       escape_html(user.address),
                                       escape_html(socials), escape_html(user.tagsSphere), escape_html(work),
                                       escape_html(nfts), escape_html(user.description))
    if isinstance(result, str):
        if "Error" in result:
            raise HTTPException(status_code=500, detail=f"{str(result)}")
    return {"response": "success"}


@router.patch("/requestCheckUniqueName")
@limiter.limit("1000/minute")
async def check_uniqueName(request: Request, user: user_model.uniquenameRequest = Body(...),
                           current_user: TokenData = Depends(get_current_user)) -> user_model.uniquenameResponse:
    result = await uf.unique_nick(escape_html(user.username))
    if isinstance(result, str):
        if "Error" in result:
            raise HTTPException(status_code=500, detail=f" {result}")
    if result:
        return {"unique": True}
    raise HTTPException(status_code=409, detail="Username already taken")


@router.patch("/requestBan")
@limiter.limit("1000/minute")
async def requestBan(request: Request, user: user_model.ban = Body(...),
                     current_user: TokenData = Depends(get_current_holder)) -> user_model.responseSuccess:
    result = await uf.ban(escape_html(user.userID), escape_html(user.newBanStatus))
    if isinstance(result, str):
        if "Error" in result:
            raise HTTPException(status_code=500, detail=f"{result}")
    return {"response": "success"}


@router.patch("/requestMute")
@limiter.limit("1000/minute")
async def requestMute(request: Request, user: user_model.mute = Body(...),
                      ) -> user_model.responseSuccess:
    try:
        result = await uf.mute(escape_html(user.userID), escape_html(user.newMuteStatus))
        if isinstance(result, str):
            if "Error" in result:
                raise HTTPException(status_code=500, detail=f"{result}")
        return {"response": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding to mut :{str(e)}")


@router.post("/requestReactionLikeDislike")
@limiter.limit("1000/minute")
async def reaction_like_dislike(request: Request, user: user_model.reactionLikeDislike = Body(...),
                                current_user: TokenData = Depends(
                                    get_current_holder)) -> user_model.reactionLikeDislikeResponse:

        result = await uf.reaction_like_dislike(escape_html(user.user_id), escape_html(user.target_id),
                                                escape_html(user.reaction_type))
        if isinstance(result, str):
            if "Error" in result:
                print(result)
        print("ERROR result", result)
        return {"resultMatchOrNoMatch": result}



@router.post("/requestNextUser")
@limiter.limit("1000/minute")
async def nextUsr(request: Request, user: user_model.nextUser = Body(...),
                  current_user: TokenData = Depends(get_current_holder)) -> user_model.nextUserResponse:
    result = await rs.get_next_user_for_user(user.user_id)
    if isinstance(result, str):
        if "Error" in result:
            raise HTTPException(status_code=500, detail=f"{result}")
    print(result)
    return {"nextUserId": result}

@router.post("/requestNextUserWithFilter")
@limiter.limit("1000/minute")
async def nextUser(request: Request, user: user_model.nextUser = Body(...),
                  current_user: TokenData = Depends(get_current_holder)) -> user_model.nextUserResponse:
    result = await rs_filter.rec_prof(user.user_id)
    if isinstance(result, str):
        if "Error" in result:
            raise HTTPException(status_code=500, detail=f"{result}")
    print(user,result)
    return {"nextUserId": result}
@router.post("/requestChangeFilter")
@limiter.limit("1000/minute")
async def changeFilter(request: Request, user: user_model.changeFilter = Body(...),
                  current_user: TokenData = Depends(get_current_holder)):
    filter_settings={"score": user.score,
                     "passions": user.passions,
                     "achievements": user.achievements}


    result = await rs_filter.filter_change(current_user.user_id,filter_settings)
    if isinstance(result, str):
        if "Error" in result:
            raise HTTPException(status_code=500, detail=f"{result}")
    print(result)
    return 200
@router.get("/getAllMatches")
@limiter.limit("1000/minute")
async def get_AllMatches(request: Request,
                         current_user: TokenData = Depends(get_current_holder)) -> user_model.getAllMatchesResponse:
    """try:
        user_id = current_user.user_id
        mtchs = await uf.all_matches(user_id)
        if isinstance(mtchs, str):
            if "Error" in mtchs:
                raise HTTPException(status_code=500, detail=f" {mtchs}")

        return mtchs
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"{e}")"""
    user_id = current_user.user_id
    mtchs = await uf.all_matches(user_id)
    if isinstance(mtchs, str):
        if "Error" in mtchs:
            raise HTTPException(status_code=500, detail=f" {mtchs}")

    return mtchs


@router.post("/deleteMatch")
@limiter.limit("1000/minute")
async def del_Match(request: Request, user: user_model.delMatch = Body(...),
                    current_user: TokenData = Depends(get_current_holder)) -> user_model.responseSuccess:
    try:
        user_id = current_user.user_id
        target_id = user.target_id
        mtchs = await uf.delete_match(user_id, target_id)
        if isinstance(mtchs, str):
            if "Error" in mtchs:
                raise HTTPException(status_code=500, detail=f" {mtchs}")
        return {"response": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{e}")


@router.post("/requestWhitelist")
@limiter.limit("1000/minute")
async def whitelist(request: Request, user: user_model.whitelistreq = Body(...)) -> user_model.responseSuccess:
    try:
        result = await uf.wl_access(escape_html(user.email))
        if isinstance(result, str):
            if "Error" in result:
                raise HTTPException(status_code=500, detail=f"{result}")
        print(result)
        return {"response": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{e}")


@router.get("/getAllChats")
async def get_all_user_chats(current_user: TokenData = Depends(get_current_holder)):
    result = await get_all_chats(current_user.user_id)
    return result


@router.post("/create_chat")
@limiter.limit("1000/minute")
async def chat_creator(request: Request, chat_model: ChatCreation):
    return await create_chat(chat_model.chat_name, chat_model.chat_users)


@router.post("/getAllMessages")
@limiter.limit("10000/minute")
async def get_chat_history(request: Request, user: GetAllMessages):
    print("get_chat_history")
    return await get_all_messages(user_id=user.user_id, chat_id=user.chat_id)


@router.post("/requestAddNFTS")
@limiter.limit("1000/minute")
async def AddNFTS(request: Request, user: user_model.AddNFTS = Body(...),
                  current_user: TokenData = Depends(get_current_user)) -> user_model.responseSuccess:
    try:
        result = await uf.get_nfts(escape_html(user.address), escape_html(user.picked_nfts_list))
        if isinstance(result, str):
            if "Error" in result:
                raise HTTPException(status_code=500, detail=f"{result}")
        return {"response": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error when adding nft, requestAddNFTS :{str(e)}")

@router.post("/requestNFTgetALL")
@limiter.limit("1000/minute")
async def get_all_nfts(request: Request, user: user_model.NFTgetALL = Body(...),
                       current_user: TokenData = Depends(get_current_user)) -> user_model.NFTgetALLResponse:
    try:
        nfts_data_all = nf.get_all_ton_nfts(escape_html(user.address))
        if isinstance(nfts_data_all, str):
            if "Error" in nfts_data_all:
                raise HTTPException(status_code=500, detail=f"{nfts_data_all}")
        return {"nfts": nfts_data_all}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error when receiving nft from Opensea's api :{str(e)}")
@router.get("/get_image/{filename}")
async def get_image(filename: str):
    load_dotenv()
    file_path = os.path.join(os.getenv("DIRECTORY_PFPS"), filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='image/png', filename=filename)
    else:
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/requestNumPointsSwipes")
@limiter.limit("1000/minute")
async def get_points_swipes_info(request: Request,
                       current_user: TokenData = Depends(get_current_user)) -> user_model.NumPointsSwipesResponse:

    num = await uf.num_points(escape_html(current_user.user_id))
    swipes = await uf.num_swipes(escape_html(current_user.user_id))
    print("SWIPES_POINTS",swipes,num)
    return {"points": num,"swipes":swipes}

"""@router.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return PlainTextResponse(str(exc), status_code=HTTP_429_TOO_MANY_REQUESTS)
"""