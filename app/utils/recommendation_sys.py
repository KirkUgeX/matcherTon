import aiofiles
from app.databases.db import Database
from app.utils.recSystem import recomndation_sys_async as rs
import time
import psycopg2
import json
from dotenv import load_dotenv
import asyncio
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

