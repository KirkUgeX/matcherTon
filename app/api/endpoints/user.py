from fastapi import APIRouter, Body, Depends, HTTPException, Request, BackgroundTasks
from app.models.user import AddUserRequest, SuccessAndUuid
from app.models.token import TokenData
from app.core.limiter import limiter
from app.utils.uf import unique_address, prepend_links, add_user
from app.utils.html import escape_html
from app.api.endpoints.auth import get_current_user,get_current_holder

router = APIRouter()

@router.post("/requestAddUser")
@limiter.limit("1000/minute")
async def request_add_user(request: Request, background_tasks: BackgroundTasks,
                           user: AddUserRequest = Body(...),
                           current_user: TokenData = Depends(get_current_user)) -> SuccessAndUuid:
    try:
        if not unique_address(escape_html(user.address)):
            raise HTTPException(status_code=409)

        socials = user.socials.dict()
        socials_links = prepend_links(socials)
        for key, url_social in socials_links.items():
            if url_social == "invalid nickname in socials include link http or dot":
                raise HTTPException(
                    status_code=500,
                    detail=f"Error when adding a user: {key} invalid nickname in socials include link http or dot"
                )
        work = user.work.dict()
        nfts = [nft.dict() for nft in user.nfts]

        result = await add_user(
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

        background_tasks.add_task(score_background, escape_html(user.address), escape_html(user.tags_sphere), result[2])
        return {"response": result[0], "user_uuid": result[1]}
    except Exception as e:
        raise HTTPException(status_code=409, detail=f"Error when adding a user: {str(e)}")
