import aiohttp
import base64
import ssl
import os
from dotenv import load_dotenv


load_dotenv()
token = os.getenv("BOT_TOKEN")


async def get_user_photos(bot_token, user_id):
    url = f"https://api.telegram.org/bot{bot_token}/getUserProfilePhotos"
    params = {'user_id': user_id}

    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params, ssl=ssl_context) as response:
            if response.status == 200:
                response_data = await response.json()
                photos_data = response_data["result"]["photos"]
                return [photo_set[-1]["file_id"] for photo_set in photos_data]
            else:
                raise Exception(f"Ошибка при запросе к getUserProfilePhotos: {await response.text()}")


async def get_photo_file(bot_token, file_id):
    url = f"https://api.telegram.org/bot{bot_token}/getFile"
    params = {'file_id': file_id}

    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params, ssl=ssl_context) as response:
            if response.status == 200:
                response_data = await response.json()
                file_path = response_data["result"]["file_path"]
                return f"https://api.telegram.org/file/bot{bot_token}/{file_path}"
            else:
                raise Exception(f"Ошибка при запросе к getFile: {await response.text()}")


async def download_photo_as_base64(photo_url):
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    async with aiohttp.ClientSession() as session:
        async with session.get(photo_url, ssl=ssl_context) as response:
            if response.status == 200:
                # Преобразуем BLOB в base64
                content = await response.read()
                base64_data = base64.b64encode(content).decode('utf-8')
                return base64_data
            else:
                raise Exception(f"Ошибка при скачивании фото: {response}")


async def get_photo(user_id):
    bot_token = token
    photo_ids = await get_user_photos(bot_token, user_id)

    for photo_id in photo_ids[:1]:
        photo_url = await get_photo_file(bot_token, photo_id)
        blob = await download_photo_as_base64(photo_url)
        #print(blob)

        return blob
