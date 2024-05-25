import aiofiles
from matcherTon.app.databases.db import Database
import time
import psycopg2
import json
from dotenv import load_dotenv


async def add_user(profileNickname, address, socials, tagsSphere, work, nfts, description):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    nft_id = await db.nfts_make(0, json.dumps(nfts))  # добавляем нфт в таблицу возвращаем id куда положили
    if isinstance(nft_id, str):
        if "Error" in nft_id:
            return nft_id

    score_data = await score_api(address)
    if isinstance(score_data, str):
        if "Error" in score_data:
            return score_data

    score, achievements, madedata = None, None, None

    likeJSON, dislikeJSON, matchJSON = json.dumps([]), json.dumps([]), json.dumps([])  # кладем пустую дату

    more_info_id = await db.recomendSys_make(0, score, achievements, madedata, likeJSON, dislikeJSON,
                                             matchJSON)  # добавляем more_info в таблицу возвращаем id куда положили, userID 0 является затычкой
    if isinstance(more_info_id, str):
        if "Error" in more_info_id:
            return more_info_id

    user_id, user_uuid = await db.profile_make(profileNickname, time.time(), address, json.dumps(socials),
                                               json.dumps(tagsSphere), json.dumps(work), nft_id, more_info_id,
                                               description)  # кладем данные о профиле
    if isinstance(user_id, str):
        if "Error" in user_id:
            return user_id, user_uuid

    result_nfts_change_user_id = await db.nfts_change_user_id(nft_id,
                                                              user_id)  # добавляем данные в таблицы о userID из таблицы профилей
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


async def prepend_links(socials):
    # Определение базовых URL для социальных сетей
    base_urls = {
        'x': 'https://twitter.com/',
        'linkedin': 'https://www.linkedin.com/in/',
        'telegram': 'https://t.me/'
    }

    # Добавление базового URL к именам пользователей, если отсутствует полный URL
    for key, base_url in base_urls.items():
        if key in socials and not socials[key].startswith('http') and not ("." in socials[key]):
            socials[key] = base_url + socials[key]
        elif socials[key].startswith('http') or ("." in socials[key]):
            socials[key] = "invalid nickname in socials include link http or dot"
    return socials


async def score_api(address):
    # здесь будет 0xScore API
    return [1337, json.dumps(list({'Legendary GasWar', 'Shitcoinooor', 'Multisig Mogul'})), 1542332]


async def get_all_user_info(userID):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    profile_info = await db.profile_show(
        userID)  # (7, 'kirku', 1711146429, '0x891284921', ['vk.ru', 'x.com', 'twiter.com'], ['Startup', 'DeFi', 'Memecoin'], ['CEO', 'sjKKK'], 8, 4, False, False)
    if isinstance(profile_info, str):
        if "Error" in profile_info:
            return profile_info

    nfts_id = profile_info[7]
    more_info_id = profile_info[8]

    nfts_cor = await db.nfts_get(nfts_id)
    nfts = nfts_cor[2]
    if isinstance(nfts, str):
        if "Error" in nfts:
            return nfts

    more_info_cor = await db.recomendSys_data_get(userID)
    more_info = more_info_cor[2:]

    if isinstance(more_info, str):
        if "Error" in more_info:
            return more_info

    print(more_info)

    print(profile_info)
    print(nfts, more_info)
    print(profile_info[2])

    socials_dict = json.loads(profile_info['socials'])
    tags_sphere_list = json.loads(profile_info['tagssphere'])
    work_dict = json.loads(profile_info['work'])

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
        "ban": profile_info['banstatus'],
        "mute": profile_info['mutestatus'],
        "nfts": nfts,
        "score": more_info[0],
        "achievements": more_info[1],
        "description": profile_info['description'],
        "points": profile_info['points'],
    }

    return data


async def get_min_user_info(userID):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    profile_info = await db.profile_show(
        userID)  # (7, 'kirku', 1711146429, '0x891284921', ['vk.ru', 'x.com', 'twiter.com'], ['Startup', 'DeFi', 'Memecoin'], ['CEO', 'sjKKK'], 8, 4, False, False)
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
            matchJSON.append(target_id)
            res_data = await db.match_data_add(user_id, json.dumps(matchJSON))
            if isinstance(res_data, str):
                if "Error" in res_data:
                    return res_data
            return "match"
        else:
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
        match_data = json.loads(recomendSys_data['matchjson'])
        matchJSON = match_data
        matchUserList = []
        for user in matchJSON:
            profile_info = await db.profile_show(
                user)

            if isinstance(profile_info, str):
                if "Error" in profile_info:
                    return profile_info
            nicname = profile_info['profilenickname']
            nfts_id = profile_info['nfts']
            nfts_rec = await db.nfts_get(nfts_id)
            nfts = json.loads(nfts_rec['nftsjson'])[0]
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
    likeJSON = likeJSON['likejson']
    if isinstance(likeJSON, str):
        if "Error" in likeJSON:
            return likeJSON
    for reaction in likeJSON:
        if reaction[0] == user_id:
            return True
    return False
