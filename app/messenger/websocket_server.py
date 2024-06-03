import asyncio
import base64
import psycopg2
import websockets
import json
from dotenv import load_dotenv
from Crypto.Protocol.KDF import PBKDF2
from matcherTon.app.databases.messenger_db import MessenggerDB
from fastapi import HTTPException
from matcherTon.app.databases.db import Database
from Crypto.Random import get_random_bytes
from matcherTon.app.core.security import AESCipher, password
from matcherTon.app.utils import uf


async def encrypter(password, data):
    try:
        salt = get_random_bytes(16)
        kdf = await asyncio.to_thread(PBKDF2, password, salt, dkLen=32, count=1000)
        key = kdf[:32]

        cipher = AESCipher(key)
        encrypted_data = cipher.encrypt(data)
        stroke_key = base64.b64encode(key).decode('ASCII')
        # print(f'Encrypted: {encrypted_data}')
        return {"encrypted_data": str(encrypted_data), "key": stroke_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Message encryption error :{str(e)}")


connections = {}


async def chat_server(websocket, path):
    # Получение user_uuid из пути
    user_uuid = path.strip('/')
    connections[user_uuid] = websocket

    try:
        load_dotenv()
        db_m = MessenggerDB()
        await db_m.connect()
    except Exception as e:
        raise HTTPException(status_code=501, detail=f"DB connection error :{str(e)}")
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)

    try:
        async for message in websocket:
            # Парсинг JSON-сообщения
            try:
                message_data = json.loads(message)

                if not await db_m.check_user_in_chat(user_id=message_data["from_user"],
                                                     chat_id=message_data["chat_id"]):
                    error_message = json.dumps({"error": "User not found in chat"})
                    await websocket.send(error_message)
                    continue

                if not await db.get_user_uuid_by_id(message_data["from_user"]) == user_uuid:
                    error_message = json.dumps({"error": "You have wrong UUID"})
                    await websocket.send(error_message)
                    continue

                if message_data["event"] == "send_message":
                    new_message = {
                        "event": "new_message",
                        "chat_id": message_data["chat_id"],
                        "from_user": message_data["from_user"],
                        "content": message_data["content"],
                        "created_at": message_data["created_at"]
                    }
                    chat_users_id = await db_m.get_other_user_in_chat(message_data["chat_id"], message_data["from_user"])
                    receiver_uuid = db.get_user_uuid_by_id(chat_users_id)

                    if receiver_uuid in connections:
                        await connections[receiver_uuid].send(json.dumps(new_message).encode('utf-8'))
                        await connections[user_uuid].send(json.dumps(new_message).encode('utf-8'))
                    else:
                        await connections[user_uuid].send(json.dumps(new_message).encode('utf-8'))

                        continue

                    encrypt_res = await encrypter(password=password, data=message_data["content"])
                    encrypt_message, key = encrypt_res["encrypted_data"], encrypt_res["key"]
                    message_id = await db_m.add_message(
                        chat_id=message_data["chat_id"],
                        from_user=message_data["from_user"],
                        content=encrypt_message,
                        reply_to=0,
                        attachment_id=None,
                        created_at=message_data["created_at"],
                        key=key
                    )
                    chat_users = await db_m.get_chat_users(chat_id=message_data["chat_id"])
                    messages_num = await db_m.count_messages_in_chat(chat_id=message_data["chat_id"])
                    num_messages_by_one = await db_m.count_messages_by_user_in_chat(user_id=message_data["from_user"],
                                                                                    chat_id=message_data["chat_id"])

                    if not isinstance(num_messages_by_one, int) or not isinstance(messages_num, int):
                        raise HTTPException(status_code=502, detail=f"Error counting messages by user in chat")
                    else:
                        if 5 <= num_messages_by_one <= 15 and messages_num == 20:
                            await uf.increase_num_points(chat_users[0], 50)
                            await uf.increase_num_points(chat_users[1], 50)
                        elif 5 <= num_messages_by_one <= 35 and messages_num == 40:
                            await uf.increase_num_points(chat_users[0], 25)
                            await uf.increase_num_points(chat_users[1], 25)
                        elif 5 <= num_messages_by_one <= 75 and messages_num == 80:
                            await uf.increase_num_points(chat_users[0], 12)
                            await uf.increase_num_points(chat_users[1], 12)

            except json.JSONDecodeError:
                error_message = json.dumps({"error": "Wrong JSON format"})
                await websocket.send(error_message)
                continue
    finally:
        del connections[user_uuid]


start_server = websockets.serve(chat_server, 'localhost', 1234)#38.242.233.161
print(f"Websocket server started and listening on ws://38.242.233.161:8765")

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
