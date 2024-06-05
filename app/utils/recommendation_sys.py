from app.databases.db import Database
from app.utils.recSystem import recomndation_sys_async as rs
import psycopg2
from dotenv import load_dotenv


async def recomendSys_change(userID, score, achievements, madedata):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    result = db.recomendSys_change_score_data(userID, score, achievements, madedata)
    if isinstance(result, str):
        if "Error" in result:
            return result


async def make_start_fit_rec():
    recSYS = rs.RecSystem()
    await recSYS.async_init()
    print("OKAY1")
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        print("Connection Error occurred:" + str(e))
    print("OKAY2")
    data = await db.recomendSys_data_get_all()

    users_data = await rs.transform_and_sort_data(data)
    print("OKAY3")
    await recSYS.fit(users_data[0])


async def add_random_user_rec_sys():
    new_user = {
        'id': 17,
        'interests': " ".join(["sss", "saqge"]),
        'achievements': ["first"],
        'score': 123
    }
    rec_sys = rs.RecSystem('recSystem/recData/recSystem_state.pkl')
    await rec_sys.async_init()
    await rec_sys.add_user(new_user)


async def get_next_user_for_user(user_id):
    try:
        load_dotenv()
        db = Database()
        await db.connect
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    data = await db.recomendSys_data_get(user_id)
    if isinstance(data, str):
        if "Error" in data:
            return data
    reaction_data = data[5] + data[6]
    user_reaction = [item[0] for item in reaction_data]
    rec_sys = rs.RecSystem('recSystem/recData/recSystem_state.pkl')
    await rec_sys.async_init()
    recommendation = await rec_sys.get_recommendations(data[1], 1, user_reaction)
    if type(recommendation) == list:
        recommendation = recommendation[0]

    print("recomendation: ", recommendation)
    if isinstance(recommendation, str):
        if "Error" in recommendation:
            data_ids = await db.get_all_ids()
            if isinstance(data_ids, str):
                if "Error" in data_ids:
                    return data_ids
            user_reaction.append(user_id)
            rec = await rs.select_random_user_id(data_ids, user_reaction)
            return rec
        else:
            recommendation = None
    return recommendation
