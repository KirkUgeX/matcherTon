from app.databases.db import Database, DatabaseWL
import time
import json
# from recomendation_system import *
#from recSystem.recomndation_sys_async import *
import psycopg2
import json
import asyncio
import os


async def add_user(profileNickname, address, socials, tagsSphere, work, nfts, description):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    nft_id = db.nfts_make(0, json.dumps(nfts))  # добавляем нфт в таблицу возвращаем id куда положили
    if isinstance(nft_id, str):
        if "Error" in nft_id:
            return nft_id

    score_data = score_api(address)
    if isinstance(score_data, str):
        if "Error" in score_data:
            return score_data

    score, achievements, madedata = None, None, None

    likeJSON, dislikeJSON, matchJSON = json.dumps([]), json.dumps([]), json.dumps([])  # кладем пустую дату

    more_info_id = db.recomendSys_make(0, score, achievements, madedata, likeJSON, dislikeJSON,
                                       matchJSON)  # добавляем more_info в таблицу возвращаем id куда положили, userID 0 является затычкой
    if isinstance(more_info_id, str):
        if "Error" in more_info_id:
            return more_info_id

    user_id, user_uuid = db.profile_make(profileNickname, time.time(), address, json.dumps(socials),
                                         json.dumps(tagsSphere), json.dumps(work), nft_id, more_info_id,
                                         description)  # кладем данные о профиле
    if isinstance(user_id, str):
        if "Error" in user_id:
            return user_id, user_uuid

    result_nfts_change_user_id = db.nfts_change_user_id(nft_id,
                                                        user_id)  # добавляем данные в таблицы о userID из таблицы профилей
    if isinstance(result_nfts_change_user_id, str):
        if "Error" in result_nfts_change_user_id:
            return result_nfts_change_user_id

    result_recomendSys_change_user_id = db.recomendSys_change_user_id(more_info_id, user_id)
    if isinstance(result_recomendSys_change_user_id, str):
        if "Error" in result_recomendSys_change_user_id:
            return result_recomendSys_change_user_id

    return [200, user_uuid, user_id]


async def recomendSys_change(userID, score, achievements, madedata):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    result = db.recomendSys_change_score_data(userID, score, achievements, madedata)
    if isinstance(result, str):
        if "Error" in result:
            return result


def increase_num_points(id, add_points):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    points = db.read_num_points(id)
    if isinstance(points, str):
        if "Error" in points:
            return points

    new_points = points + add_points
    points = db.update_num_points(id, new_points)
    if isinstance(points, str):
        if "Error" in points:
            return points


def prepend_links(socials):
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


def score_api(address):
    # здесь будет 0xScore API
    return [1337, json.dumps(list({'Legendary GasWar', 'Shitcoinooor', 'Multisig Mogul'})), 1542332]


def get_all_user_info(userID):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    profile_info = db.profile_show(
        userID)  # (7, 'kirku', 1711146429, '0x891284921', ['vk.ru', 'x.com', 'twiter.com'], ['Startup', 'DeFi', 'Memecoin'], ['CEO', 'sjKKK'], 8, 4, False, False)
    if isinstance(profile_info, str):
        if "Error" in profile_info:
            return profile_info

    nfts_id = profile_info[7]
    more_info_id = profile_info[8]

    nfts = db.nfts_get(nfts_id)[2]
    if isinstance(nfts, str):
        if "Error" in nfts:
            return nfts

    more_info = db.recomendSys_data_get(userID)[2:]

    if isinstance(more_info, str):
        if "Error" in more_info:
            return more_info

    print(more_info)

    print(profile_info)
    print(nfts, more_info)
    print(profile_info[2])
    data = {
        "nickname": profile_info[1],
        "address": profile_info[3],
        "socialLinks": {"x": profile_info[4]['x'], "linkedin": profile_info[4]['linkedin'],
                        "tg": profile_info[4]['telegram']},
        "tagsSphere": profile_info[5],
        "work": {"position": profile_info[6]['position'], "company": profile_info[6]['company']},
        "ban": profile_info[9],
        "mute": profile_info[10],
        "nfts": nfts,
        "score": more_info[0],
        "achievements": more_info[1],
        "description": profile_info[11],
        "points": profile_info[12],
    }

    return data


def get_min_user_info(userID):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    profile_info = db.profile_show(
        userID)  # (7, 'kirku', 1711146429, '0x891284921', ['vk.ru', 'x.com', 'twiter.com'], ['Startup', 'DeFi', 'Memecoin'], ['CEO', 'sjKKK'], 8, 4, False, False)
    if isinstance(profile_info, str):
        if "Error" in profile_info:
            return profile_info
    nfts_id = profile_info[7]

    nfts = db.nfts_get(nfts_id)[2]
    if isinstance(nfts, str):
        if "Error" in nfts:
            return nfts

    print(profile_info)
    print(nfts)
    print(profile_info[2])
    data = {
        "nickname": profile_info[1],
        "address": profile_info[2],
        "socialLinks": {"x": profile_info[4][0], "linkedin": profile_info[4][1], "tg": profile_info[4][2]},
        "tagsSphere": profile_info[5],
        "work": {"position": profile_info[6][0], "company": profile_info[6][1]},
        "ban": profile_info[9],
        "mute": profile_info[10],
        "nfts": nfts[0],
    }

    return data


def change_user_info(id, profileNickname, address, socials, tagsSphere, work, nfts, description):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    res = db.nfts_change(id, nfts)
    if isinstance(res, str):
        if "Error" in res:
            return res
    res_profile = db.profile_change(id, profileNickname, address, socials, tagsSphere, work, res, description)
    if isinstance(res_profile, str):
        if "Error" in res_profile:
            return res_profile


def ban(userID, new_ban_status):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    res_ban = db.ban_status_update(userID, new_ban_status)
    if isinstance(res_ban, str):
        if "Error" in res_ban:
            return res_ban


def mute(userID, new_ban_status):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    resMute = db.mute_status_update(userID, new_ban_status)
    if isinstance(resMute, str):
        if "Error" in resMute:
            return resMute


def unique_nick(nickname):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    res = db.check_username_unique(nickname)
    return res


def unique_address(nickname):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    res = db.check_wallet_unique(nickname)
    return res


def idFromWallet(wallet):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    res = db.userIdfromWallet(wallet)
    return res


def uuidFromWallet(wallet):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    res = db.get_user_uuid_by_wallet(wallet)
    return res


def makeJsonMeta(nickname, img, wallet):
    metadata = {
        "nameNFT": "Matcher Pass",
        "nickname": nickname,
        "image": img,
        "description": "Matcher is a DApp that will improve your networking and help you find new partners and friends in web3",
    }
    filename = "metadata/" + wallet + ".json"
    with open(filename, 'w') as file:
        json.dump(metadata, file)
    return 200


def readJsonMeta(wallet):
    filename = "metadata/" + wallet + ".json"
    with open(filename, 'r') as file:
        metadata = json.load(file)
    return metadata


def reaction_like_dislike(user_id, target_id, reaction_type):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    recomendSys_data = db.recomendSys_data_get(user_id)
    if isinstance(recomendSys_data, str):
        if "Error" in recomendSys_data:
            return recomendSys_data
    if recomendSys_data:
        like_data = recomendSys_data[5]
        dislike_data = recomendSys_data[6]
        match_data = recomendSys_data[7]
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

    res_data = db.reaction_data_add(user_id, json.dumps(likeJSON), json.dumps(dislikeJSON))
    if isinstance(res_data, str):
        if "Error" in res_data:
            return res_data
    increase_num_points(user_id, 10)
    if reaction_type == 'like':
        result = (check_reaction(user_id, target_id))
        if isinstance(result, str):
            if "Error" in result:
                return result
        if result:
            increase_num_points(user_id, 100)
            increase_num_points(target_id, 100)
            matchJSON.append(target_id)
            res_data = db.match_data_add(user_id, json.dumps(matchJSON))
            if isinstance(res_data, str):
                if "Error" in res_data:
                    return res_data
            return "match"
        else:
            return "nomatch"


def all_matches(user_id):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    recomendSys_data = db.recomendSys_data_get(user_id)
    if isinstance(recomendSys_data, str):
        if "Error" in recomendSys_data:
            return recomendSys_data
    if recomendSys_data:
        match_data = recomendSys_data[7]
        matchJSON = match_data
        matchUserList = []
        for user in matchJSON:
            profile_info = db.profile_show(
                user)
            if isinstance(profile_info, str):
                if "Error" in profile_info:
                    return profile_info
            nicname = profile_info[1]
            nfts_id = profile_info[7]
            nfts = db.nfts_get(nfts_id)[2][0]
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


def delete_match(user_id, target_id):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    recomendSys_data = db.recomendSys_data_get(user_id)
    if isinstance(recomendSys_data, str):
        if "Error" in recomendSys_data:
            return recomendSys_data
    if recomendSys_data:
        match_data = recomendSys_data[7]

        matchJSON = match_data.remove(target_id)
        if matchJSON == None:
            matchJSON = []
        res_data = db.match_data_add(user_id, json.dumps(matchJSON))
        if isinstance(res_data, str):
            if "Error" in res_data:
                return res_data
        return 200
    else:
        return "Error No info about matches"


def check_reaction(user_id, target_id):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    likeJSON = db.recomendSys_data_get(target_id)[5]
    if isinstance(likeJSON, str):
        if "Error" in likeJSON:
            return likeJSON
    for reaction in likeJSON:
        if reaction[0] == user_id:
            return True
    return False


async def get_next_user_for_user(user_id):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    data = db.recomendSys_data_get(user_id)
    if isinstance(data, str):
        if "Error" in data:
            return data
    reaction_data = data[5] + data[6]
    user_reaction = [item[0] for item in reaction_data]
    rec_sys = RecSystem('recSystem/recData/recSystem_state.pkl')
    await rec_sys.async_init()
    recommendation = await rec_sys.get_recommendations(data[1], 1, user_reaction)
    if type(recommendation) == list:
        recommendation = recommendation[0]

    print("recomendation: ", recommendation)
    if isinstance(recommendation, str):
        if "Error" in recommendation:
            data_ids = db.get_all_ids()
            if isinstance(data_ids, str):
                if "Error" in data_ids:
                    return data_ids
            user_reaction.append(user_id)
            rec = select_random_user_id(data_ids, user_reaction)
            return rec
        else:
            recommendation = None
    return recommendation


def wl_access(email):
    try:
        db = DatabaseWL()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    data = db.wladd(email)
    if isinstance(data, str):
        if "Error" in data:
            return data
    return data


async def make_start_fit_rec():
    recSYS = RecSystem()
    await recSYS.async_init()
    try:
        db = Database()
    except psycopg2.Error as e:
        print("Connection Error occurred:" + str(e))
    data = db.recomendSys_data_get_all()
    users_data = transform_and_sort_data(data)
    await recSYS.fit(users_data[0])


async def add_random_user_rec_sys():
    new_user = {
        'id': 17,
        'interests': " ".join(["sss", "saqge"]),
        'achievements': ["first"],
        'score': 123
    }
    rec_sys = RecSystem('recSystem/recData/recSystem_state.pkl')
    await rec_sys.async_init()
    await rec_sys.add_user(new_user)


# TEST
# print(reaction_like_dislike(10,9,'like'))
# reaction_like_dislike()
# Создание новой матрицы со всеми юзерами
"""def get_u(user_id):
    try:
        db = Database()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    data_ids = db.get_all_ids()
    if isinstance(data_ids, str):
        if "Error" in data_ids:
            return data_ids
    data = db.recomendSys_data_get(user_id)
    if isinstance(data, str):
        if "Error" in data:
            return data
    reaction_data = data[-1] + data[-2]
    user_reaction = [item[0] for item in reaction_data]
    user_reaction.append(user_id)
    if isinstance(data_ids, str):
        if "Error" in data_ids:
            return data_ids
    rec=select_random_user_id(data_ids, user_reaction)
    return rec"""
"""if __name__ == '__main__':
    asyncio.run(make_start_fit_rec())"""
