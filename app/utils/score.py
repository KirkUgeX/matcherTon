from app.utils import uf
from app.utils import recommendation_sys as rs
from app.utils.recSystem.recomndation_sys_async import *
import time
import json
import asyncio
import aiohttp
from app.core.config import settings

url_base=settings.TON_SCORE_URL
async def scoreBackground(address, tagSphere, user_id):

    score_data = await scoreAPI(address)
    print(score_data)
    if isinstance(score_data, str):
        if "Error" in score_data:
            return score_data
    score, achievements, madedata = score_data['score']['score'], json.dumps(
        score_data['score']['achievement']), time.time()

    more_info_id = await rs.recomendSys_change(user_id, score, achievements, madedata)
    if isinstance(more_info_id, str):
        if "Error" in more_info_id:
            return more_info_id
    new_user = {
        'id': user_id,
        'interests': " ".join(tagSphere),
        'achievements': achievements,
        'score': score
    }
    rec_sys = RecSystem('app/utils/recSystem/recData/recSystem_state.pkl')
    await rec_sys.async_init()
    await rec_sys.add_user(new_user)

async def scoreBackground_test(address, tagSphere, user_id):

    score_data = await scoreAPI_fake_for_test(address)
    print(score_data)
    if isinstance(score_data, str):
        if "Error" in score_data:
            return score_data
    score, achievements, madedata = score_data['score']['score'], json.dumps(
        score_data['score']['achievement']), time.time()

    more_info_id = await rs.recomendSys_change(user_id, score, achievements, madedata)
    if isinstance(more_info_id, str):
        if "Error" in more_info_id:
            return more_info_id
    new_user = {
        'id': user_id,
        'interests': " ".join(tagSphere),
        'achievements': achievements,
        'score': score
    }
    rec_sys = RecSystem('app/utils/recSystem/recData/recSystem_state.pkl')
    await rec_sys.async_init()
    await rec_sys.add_user(new_user)

async def get(wallet):
    url = url_base+"/getWalletFromQueue"
    params = {'wallet': wallet}

    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data
                else:
                    content = await response.text()
                    print(f'Error: {response.status}, Content: {content}')
        except Exception as e:
            print(f'An error occurred: {e}')

async def get_all():
    url = url_base+"/getAllScores"

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                data = await response.json()
            else:
                content = await response.text()
                print(f'Error: {response.status}, Content: {content}')

async def post(wallet):
    url = url_base+'/addWalletInQueue'
    data = {"wallet": wallet}
    headers = {'Content-Type': 'application/json'}

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(url, json=data, headers=headers) as response:
                text = await response.text()
        except Exception as e:
            print(f'An error occurred: {e}')


async def scoreAPI(address):
    await post(address)
    number_tries = 0
    while number_tries < 100:
        await asyncio.sleep(8)

        result = await get(address)
        if result is not None:
            if result['score'] is not None:
                if result['score']['score'] is not None:
                    return result
        number_tries += 1
async def scoreAPI_fake_for_test(address):
    return {'wallet': address,'score':{'score':222,'achievement':['NFT Trader']}}