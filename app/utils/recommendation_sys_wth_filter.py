from app.databases.db import Database
import app.utils.uf as uf
import psycopg2
from dotenv import load_dotenv
import json
import random
async def all_users_info():
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    list_ids = await db.get_all_ids()
    all_users=[]
    print("list_ids",list_ids)
    for id in list_ids:
        profile_info=await uf.get_all_user_info(id)
        #print("USER",id,"    ", profile_info)
        all_users.append({"id":id,"tagsSphere":profile_info["tagsSphere"],"score":profile_info["score"],"achievements":profile_info["achievements"]})
    #print("ALL USERS",all_users)
    return all_users




async def recommend_profiles(profiles, score_range,desired_passions=None, desired_achievements=None):

    print("CHECK IT",profiles, desired_passions, desired_achievements)
    if desired_passions:
        profiles = [
            p for p in profiles
            if p['tagsSphere'] is not None and
               all(passion in p['tagsSphere'] for passion in desired_passions) and
               score_range[0] <= p['score'] <= score_range[1]
        ]

    if desired_achievements:
        profiles = [
            p for p in profiles if
            p['achievements'] is not None and all(ach in p["achievements"] for ach in desired_achievements)
            and
            score_range[0] <= p['score'] <= score_range[1]
        ]
    if score_range:
        profiles = [
            p for p in profiles if p['score'] is not None and
                                   score_range[0] <= p['score'] <= score_range[1]
        ]


    profiles = sorted(profiles, key=lambda x: x["score"], reverse=True)
    ids = [profile['id'] for profile in profiles]
    return ids
async def select_random_user_id(user_ids, interaction_history):
    # Фильтруем список user_ids, исключая ID, которые уже есть в interaction_history
    available_user_ids = [user_id for user_id in user_ids if user_id not in interaction_history]
    if not available_user_ids:
        return None

    return random.choice(available_user_ids)
async def rec_prof(user_id):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    data = await db.recomendSys_data_get(user_id)
    if isinstance(data, str):
        if "Error" in data:
            return data

    filter_settings=data[8]
    if filter_settings==None:
        score_range= None
        desired_passions = None
        desired_achievements = None
    else:
        filter_settings=json.loads(filter_settings)
        score_range = filter_settings["score"]
        desired_passions = filter_settings["passions"]
        desired_achievements=filter_settings["achievements"]
    print("FILTERS SETTINGS",score_range,desired_passions,desired_achievements)
    reaction_data = json.loads(data[5]) + json.loads(data[6])
    print("User reaction list", reaction_data, type(reaction_data))
    user_reaction = [item[0] for item in reaction_data]
    user_reaction.append(user_id)
    print(user_reaction)
    profiles=await db.get_all_users_info()
    rec=await recommend_profiles(profiles, score_range, desired_passions, desired_achievements)
    print("res",rec)
    rec_user= await select_random_user_id(rec,user_reaction)
    print(rec_user)
    return rec_user

async def filter_change(user_id,filter_data):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    data = await db.recomendSys_change_filter_data(user_id,json.dumps(filter_data))