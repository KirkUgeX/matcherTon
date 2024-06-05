from fastapi import APIRouter, Body, Depends, HTTPException, Request, BackgroundTasks
from app.models import user as user_model
from app.models.token import TokenData
from app.models.chat import ChatCreation, GetAllMessages, Message
from app.core.limiter import limiter
from app.utils import uf
from app.utils.html import escape_html
from app.api.endpoints.auth import get_current_user, get_current_holder
from app.utils.score import scoreBackground, scoreBackground_test
from app.messenger.msg_functions import create_chat, get_all_messages, send_message

router = APIRouter()


@router.post("/requestAddUser")
@limiter.limit("1000/minute")
async def request_add_user(request: Request, background_tasks: BackgroundTasks,
                           user: user_model.AddUserRequest = Body(...),
                           current_user: TokenData = Depends(get_current_user)) -> user_model.SuccessAndUuid:
    try:
        if not await uf.unique_address(escape_html(user.address)):
            raise HTTPException(status_code=409)

        socials = user.socials.dict()
        socials_links = await uf.prepend_links(socials)
        for key, url_social in socials_links.items():
            if url_social == "invalid nickname in socials include link http or dot":
                raise HTTPException(
                    status_code=500,
                    detail=f"Error when adding a user: {key} invalid nickname in socials include link http or dot"
                )

        nfts = [i.dict() for i in user.nfts]
        work = user.work.dict()
        result = await uf.add_user(
            escape_html(user.profile_nickname),
            escape_html(user.address),
            escape_html(socials_links),
            escape_html(user.tags_sphere),
            escape_html(work),
            escape_html(nfts),
            escape_html(user.description)
        )

        if isinstance(result, str) and "Error" in result:
            raise HTTPException(status_code=500, detail=result)

        background_tasks.add_task(scoreBackground_test, escape_html(user.address), escape_html(user.tags_sphere),
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
                      current_user: TokenData = Depends(get_current_holder)) -> user_model.responseSuccess:
    try:
        result = await uf.mute(escape_html(user.userID), escape_html(user.newMuteStatus))
        if isinstance(result, str):
            if "Error" in result:
                raise HTTPException(status_code=500, detail=f"{result}")
        return {"response": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding to mut :{str(e)}")



@router.post("/create_chat")
@limiter.limit("1000/minute")
async def chat_creator(request: Request, chat_model: ChatCreation):
    return await create_chat(chat_model.chat_name, chat_model.chat_users)


@router.get("/getAllMessages")
@limiter.limit("10000/minute")
async def get_chat_history(request: Request, user: GetAllMessages):
    return await get_all_messages(user_id=user.user_id, chat_id=user.chat_id)


@router.post("/insert-new-message")
@limiter.limit("10000/minute")
async def insert_new_message(request: Request, user: Message):
    return await send_message(user)
