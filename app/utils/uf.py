import aiofiles
from app.databases.db import Database, DatabaseWL
import time
import psycopg2
import json
from dotenv import load_dotenv
from app.bot import messages, notices
from app.utils.recSystem.recomndation_sys_async import select_random_user_id
import os
import base64
from datetime import datetime, timedelta


async def add_user(profileNickname, address, socials, tagsSphere, work, nfts, description, tg_userId, avatar):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    nft_id = await db.nfts_make(0, json.dumps(nfts))  # add nft to table return id where we put it
    if isinstance(nft_id, str):
        if "Error" in nft_id:
            return nft_id

    score_data = await score_api(address)
    if isinstance(score_data, str):
        if "Error" in score_data:
            return score_data

    score, achievements, madedata = None, None, None

    likeJSON, dislikeJSON, matchJSON = json.dumps([]), json.dumps([]), json.dumps([])  # put an empty date

    more_info_id = await db.recomendSys_make(0, score, achievements, madedata, likeJSON, dislikeJSON,
                                             matchJSON)  # add more_info to the table return id where we put it, userID 0 is a stub
    if isinstance(more_info_id, str):
        if "Error" in more_info_id:
            return more_info_id

    user_id, user_uuid = await db.profile_make(profileNickname, time.time(), address, json.dumps(socials),
                                               json.dumps(tagsSphere), json.dumps(work), nft_id, more_info_id,
                                               description, tg_userId, avatar)  # put the profile data
    if isinstance(user_id, str):
        if "Error" in user_id:
            return user_id, user_uuid

    result_nfts_change_user_id = await db.nfts_change_user_id(nft_id,
                                                              user_id)  # add data to tables about userID from profile table
    if isinstance(result_nfts_change_user_id, str):
        if "Error" in result_nfts_change_user_id:
            return result_nfts_change_user_id

    result_recomendSys_change_user_id = await db.recomendSys_change_user_id(more_info_id, user_id)
    if isinstance(result_recomendSys_change_user_id, str):
        if "Error" in result_recomendSys_change_user_id:
            return result_recomendSys_change_user_id

    return [200, user_uuid, user_id]


async def increase_num_points(id, add_points):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    points = await db.read_num_points(id)
    if isinstance(points, str):
        if "Error" in points:
            return points

    new_points = points + add_points
    points = await db.update_num_points(id, new_points)
    if isinstance(points, str):
        if "Error" in points:
            return points

async def num_points(id):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    points = await db.read_num_points(id)
    if isinstance(points, str):
        if "Error" in points:
            return points
    return points
async def num_swipes(id):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    data = await db.recomendSys_data_get(id)
    if isinstance(data, str):
        if "Error" in data:
            return data
    reaction_data = json.loads(data[5]) + json.loads(data[6])
    today = datetime.now()
    start_of_day = datetime(today.year, today.month, today.day)
    end_of_day = start_of_day + timedelta(days=1)

    count = sum(
        start_of_day.timestamp() <= timestamp <= end_of_day.timestamp()
        for _, timestamp in reaction_data
    )
    return count
async def prepend_links(socials):
    # Defining basic URLs for social networks
    base_urls = {
        'x': 'https://twitter.com/',
        'linkedin': 'https://www.linkedin.com/in/',
        'telegram': 'https://t.me/'
    }
    # Adding a base URL to usernames if the full URL is missing
    for key, base_url in base_urls.items():
        if key in socials and not socials[key].startswith('http') and not ("." in socials[key]):
            socials[key] = base_url + socials[key]
        elif socials[key].startswith('http') or ("." in socials[key]):
            socials[key] = "invalid nickname in socials include link http or dot"
    return socials


async def score_api(address):
    return [1337, json.dumps(list({'Legendary GasWar', 'Shitcoinooor', 'Multisig Mogul'})), 1542332]


async def get_all_user_info(userID):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    try:
        profile_info = await db.profile_show(
            userID)

        if isinstance(profile_info, str):
            if "Error" in profile_info:
                return profile_info

        nfts_id = profile_info[7]

        more_info_id = profile_info[8]

        nfts_cor = await db.nfts_get(nfts_id)

        if nfts_cor[2] is not None and isinstance(nfts_cor[2], list):
            nfts = nfts_cor[2]
            if isinstance(nfts, str):
                if "Error" in nfts:
                    return nfts
        else:
            nfts = []
        more_info_cor = await db.recomendSys_data_get(userID)
        more_info = more_info_cor[2:]

        if isinstance(more_info, str):
            if "Error" in more_info:
                return more_info

        score = more_info[0] if more_info[0] is not None else 0
        if more_info[1] is not None and isinstance(more_info[1], list):
            achievements = more_info[1]
        else:
            achievements = []

        print(more_info)

        # print(profile_info)


        socials_dict = json.loads(profile_info['socials'])
        tags_sphere_list = json.loads(profile_info['tagssphere'])
        work_dict = json.loads(profile_info['work'])
        print("telegram",socials_dict )
        x= socials_dict.get('x', '')
        linkedin = socials_dict.get('linkedin', '')
        telegram=socials_dict.get('telegram', '').replace("@","")
        if x=="https://twitter.com/":
            x=None
        if linkedin=='https://www.linkedin.com/in/':
            linkedin=None

        data = {
            "nickname": profile_info['profilenickname'],
            "address": profile_info['address'],
            "socialLinks": {
                "x": x,
                "linkedin": linkedin,
                "telegram": telegram
            },
            "tagsSphere": tags_sphere_list,
            "work": {"position": work_dict['position'], "company": work_dict['company']},
            "ban": profile_info['banstatus'],
            "mute": profile_info['mutestatus'],
            "nfts": nfts,
            "score": score,
            "achievements": achievements,
            "description": profile_info['description'],
            "points": profile_info['points'],
            "tg_userid": profile_info['tg_userid'],
            "avatar": profile_info['avatar']
        }

        return data
    except Exception as e:
        print(e, userID)


async def get_min_user_info(userID):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    profile_info = await db.profile_show(
        userID)
    if isinstance(profile_info, str):
        if "Error" in profile_info:
            return profile_info

    socials_dict = json.loads(profile_info['socials'])
    tags_sphere_list = json.loads(profile_info['tagssphere'])
    work_dict = json.loads(profile_info['work'])

    nfts_id = profile_info['nfts']
    nfts = await db.nfts_get(nfts_id)
    nfts_dict = json.loads(nfts['nftsjson'])
    if isinstance(nfts, str):
        if "Error" in nfts:
            return nfts

    print(profile_info)
    print(nfts)
    print(profile_info[2])
    data = {
        "nickname": profile_info['profilenickname'],
        "address": profile_info['address'],
        "socialLinks": {
            "x": socials_dict.get('x', ''),
            "linkedin": socials_dict.get('linkedin', ''),
            "tg": socials_dict.get('telegram', '')
        },
        "tagsSphere": tags_sphere_list,
        "work": {"position": work_dict['position'], "company": work_dict['company']},
        "ban": profile_info[9],
        "mute": profile_info[10],
        "nfts": nfts_dict,
    }

    return data


async def change_user_info(id, profileNickname, address, socials, tagsSphere, work, nfts, description):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    res = await db.nfts_change(id, nfts)
    if isinstance(res, str):
        if "Error" in res:
            return res
    res_profile = await db.profile_change(id, profileNickname, address, socials, tagsSphere, work, res, description)
    if isinstance(res_profile, str):
        if "Error" in res_profile:
            return res_profile


async def ban(userID, new_ban_status):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    res_ban = await db.ban_status_update(userID, new_ban_status)
    if isinstance(res_ban, str):
        if "Error" in res_ban:
            return res_ban


async def mute(userID, new_ban_status):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    resMute = await db.mute_status_update(userID, new_ban_status)
    if isinstance(resMute, str):
        if "Error" in resMute:
            return resMute


async def unique_nick(nickname):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    res = await db.check_username_unique(nickname)
    return res


async def unique_address(nickname):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    res = await db.check_wallet_unique(nickname)
    return res


async def idFromWallet(wallet):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    res = await db.userIdfromWallet(wallet)
    return res


async def uuidFromWallet(wallet):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    res = await db.get_user_uuid_by_wallet(wallet)
    print(type(res))
    return res

async def idFromTG(tg):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    res = await db.get_user_id_by_tguserid(tg)
    return res


async def uuidFromTG(tg):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    res = await db.get_user_uuid_by_tguserid(tg)
    print(type(res))
    return res
async def makeJsonMeta(nickname, img, wallet):
    metadata = {
        "nameNFT": "Matcher Pass",
        "nickname": nickname,
        "image": img,
        "description": "Matcher is a DApp that will improve your networking and help you find new partners and friends in web3",
    }
    filename = "metadata/" + wallet + ".json"
    try:
        async with aiofiles.open(filename, 'w') as file:
            await file.write(json.dumps(metadata))
        return 200
    except Exception as e:
        print(f"Error creating JSON metadata for {wallet}: {e}")
        return None


async def readJsonMeta(wallet):
    filename = f"metadata/{wallet}.json"
    async with aiofiles.open(filename, 'r') as file:
        metadata = await file.read()
    return json.loads(metadata)


async def reaction_like_dislike(user_id, target_id, reaction_type):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    recomendSys_data = await db.recomendSys_data_get(user_id)
    if isinstance(recomendSys_data, str):
        if "Error" in recomendSys_data:
            return recomendSys_data
    if recomendSys_data:
        like_data = json.loads(recomendSys_data['likejson'])
        dislike_data = json.loads(recomendSys_data['dislikejson'])
        match_data = json.loads(recomendSys_data['matchjson'])
        likeJSON = like_data
        dislikeJSON = dislike_data
        matchJSON = match_data
    else:
        likeJSON = {}
        dislikeJSON = {}

    reaction_entry = [target_id, time.time()]

    if reaction_type == 'like':
        likeJSON.append(reaction_entry)
    elif reaction_type == 'dislike':
        dislikeJSON.append(reaction_entry)

    res_data = await db.reaction_data_add(user_id, json.dumps(likeJSON), json.dumps(dislikeJSON))
    if isinstance(res_data, str):
        if "Error" in res_data:
            return res_data
    await increase_num_points(user_id, 10)
    if reaction_type == 'like':
        result = (await check_reaction(user_id, target_id))
        if isinstance(result, str):
            if "Error" in result:
                return result
        if result:
            await increase_num_points(user_id, 100)
            await increase_num_points(target_id, 100)
            print("MATCH!!!", matchJSON, target_id)
            print(matchJSON)
            user_json = matchJSON.copy()
            user_json.append(target_id)
            res_data = await db.match_data_add(user_id, json.dumps(user_json))

            target_json = matchJSON.copy()
            target_json.append(user_id)
            res_data_target = await db.match_data_add(target_id, json.dumps(target_json))

            user_tg_ = await get_telegram_id(user_id)
            user_tg = user_tg_["tg_id"]

            target_tg_ = await get_telegram_id(target_id)
            target_tg = target_tg_["tg_id"]

            await notices.send_notice(target_tg, "new_match", None)
            await notices.send_notice(user_tg, "new_match", None)

            if isinstance(res_data, str) and isinstance(res_data_target, str):
                if "Error" in res_data or "Error" in res_data_target:
                    return res_data, res_data_target
            return "match"
        else:
            username_ = await get_telegram_id(user_id)
            username = username_["profilenickname"]

            target_tg_ = await get_telegram_id(target_id)
            target_tg = target_tg_["tg_id"]

            await notices.send_notice(target_tg, "profile_like", username)
            return "nomatch"
    if reaction_type == 'dislike':
        return "nomatch"


async def all_matches(user_id):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    recomendSys_data = await db.recomendSys_data_get(user_id)
    if isinstance(recomendSys_data, str):
        if "Error" in recomendSys_data:
            return recomendSys_data
    if recomendSys_data:
        match_data = json.loads(recomendSys_data.get("matchjson", "[]"))
        matchJSON = match_data if match_data is not None else []
        matchUserList = []
        for user in matchJSON:
            profile_info = await db.profile_show(
                user)

            if isinstance(profile_info, str):
                if "Error" in profile_info:
                    return profile_info
            print("profile_info",profile_info,user,matchJSON)
            nicname = profile_info.get('profilenickname', '[]')
            nfts_id = profile_info['nfts']
            id = profile_info['id']
            nfts_rec = await db.nfts_get(nfts_id)
            nfts = json.loads(nfts_rec['nftsjson'])
            if nfts == []:
                link=f"https://matcher.fun/get_image/{id}.png"
                if await check_file_exists(str(id) + ".png"):
                    nfts = {"name":"ds",
                            "image_url": link,
                            "opensea_url":link
                    }
                else:
                    print(await save_image(f"{id}.png", profile_info[15]))
                    nfts = {"name":"ds",
                            "image_url": link,
                            "opensea_url":link
                    }
            else:
                nfts = nfts[0]
            if isinstance(nfts, str):
                if "Error" in nfts:
                    return nfts
            obj = {
                "user_id": user,
                "nick": nicname,
                "NFT": nfts
            }
            matchUserList.append(obj)

        return {"matches": matchUserList}
    else:
        return "Error No info about matches"


async def delete_match(user_id, target_id):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    recomendSys_data = await db.recomendSys_data_get(user_id)
    if isinstance(recomendSys_data, str):
        if "Error" in recomendSys_data:
            return recomendSys_data
    if recomendSys_data:
        match_data = json.loads(recomendSys_data['matchjson'])
        match_data.pop(match_data.index(target_id))
        matchJSON = match_data
        if matchJSON == None:
            matchJSON = []
        res_data = await db.match_data_add(user_id, json.dumps(matchJSON))
        if isinstance(res_data, str):
            if "Error" in res_data:
                return res_data
        return 200
    else:
        return "Error No info about matches"


async def check_reaction(user_id, target_id):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    likeJSON = await db.recomendSys_data_get(target_id)
    likeJSON = json.loads(likeJSON['likejson'])
    if isinstance(likeJSON, str):
        if "Error" in likeJSON:
            return likeJSON
    for reaction in likeJSON:
        if reaction[0] == user_id:
            return True
    return False


async def wl_access(email):
    try:
        load_dotenv()
        db = DatabaseWL()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    data = await db.wladd(email)
    if isinstance(data, str):
        if "Error" in data:
            return data
    return data


async def get_nfts(user_id, picked_nfts_list):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    try:
        nfts = json.dumps(picked_nfts_list)
        await db.nfts_change(user_id, nfts)
    except psycopg2.DatabaseError as db_err:
        print(f"Opensea get_nfts An Error occurred with the database: {db_err}")
        return f"Opensea get_nfts An Error occurred with the database: {db_err}"
    except json.JSONDecodeError as json_err:
        print(f"Opensea get_nfts JSON decoding Error occurred: {json_err}")
        return f"Opensea get_nfts JSON decoding Error occurred: {json_err}"
    except Exception as e:
        print(f"Opensea get_nfts An unexpected Error occurred: {e}")
        return f"Opensea get_nfts An unexpected Error occurred: {e}"


async def get_telegram_id(user_id):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    try:
        tg_id, profilenickname = await db.get_tg_by_id(user_id)

        return {"tg_id": tg_id, "profilenickname": profilenickname}
    except Exception as e:
        return "Cant get tg_id:" + str(e)


async def add_tg_user(tg_id: int, language: str, referrer_id) -> bool:
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    try:
        if not await db.check_tg_id_exists(tg_id):
            await db.add_bot_user(tg_id, language, referrer_id)
            return True
        else:
            return False
    except Exception as e:
        return "error when adding a user:" + str(e)


async def tg_id_cheker(tg_id: int) -> bool:
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    try:
        res = await db.check_user_exists(tg_id)
        return res
    except Exception as e:
        return "error when adding a user:" + str(e)


async def get_user_lang(tg_id: int) -> str:
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    try:
        lang = await db.get_user_lang(tg_id)
        return lang
    except Exception as e:
        return "error when getting tg_id:" + str(e)

async def get_id_by_tgid(tg_ig: int) -> int:
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    try:
        id = await db.get_id_by_tg(tg_ig)
        return id
    except Exception as e:
        return "error when getting id:" + str(e)

async def save_image(img_filename,img_base64):
    try:
        load_dotenv()
        filename = img_filename
        file_path = os.path.join(os.getenv("DIRECTORY_PFPS"), filename)

        base64_str = img_base64
        if base64_str.startswith('data:image/png;base64,'):
            base64_str = base64_str[len('data:image/png;base64,'):]
        elif base64_str.startswith('data:image/jpeg;base64,'):
            base64_str = base64_str[len('data:image/jpeg;base64,'):]

        image_data = base64.b64decode(base64_str)

        with open(file_path, 'wb') as file:
            file.write(image_data)

        return {"message": "Image saved successfully", "filename": filename}
    except Exception as e:
        return "error when getting id:" + str(e)

async def check_file_exists(img_filename):
    load_dotenv()
    result = os.path.exists(os.getenv("DIRECTORY_PFPS")+"\\"+ img_filename)
    print("CHECKFILE EXIST",result, os.getenv("DIRECTORY_PFPS")+"/"+ img_filename)
    return result

