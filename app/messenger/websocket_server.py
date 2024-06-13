import asyncio
import os

import psycopg2
import websockets
import json
from dotenv import load_dotenv
from app.databases.messenger_db import MessenggerDB
from fastapi import HTTPException
from app.databases.db import Database
from app.core.security import encrypter, password
from app.utils import uf
from websockets import WebSocketServerProtocol

connections = {}


async def chat_server(websocket: WebSocketServerProtocol, path: str):
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
                print("Received message:", message_data)

                user_uuid_from_db = await db.get_user_uuid_by_id(message_data["from_user"])

                check_user_in_chat = await db_m.check_user_in_chat(user_id=message_data["from_user"],
                                                                   chat_id=message_data["chat_id"])

                if not check_user_in_chat:
                    error_message = json.dumps({"error": "User not found in chat"})
                    await websocket.send(error_message)
                    continue

                if str(user_uuid_from_db) != user_uuid:
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
                    chat_users_id = await db_m.get_other_user_in_chat(message_data["chat_id"],
                                                                      message_data["from_user"])
                    receiver_uuid = str(await db.get_user_uuid_by_id(chat_users_id))

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
                    num_messages_by_one = await db_m.count_messages_by_user_in_chat(
                        user_id=message_data["from_user"],
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

            except Exception as e:
                print(f"Error processing message: {str(e)}")
                await websocket.send(json.dumps({"error": f"Error processing message: {str(e)}"}))
                continue

    finally:
        del connections[user_uuid]

load_dotenv()
start_server = websockets.serve(chat_server, os.getenv("WS_SER"), os.getenv("WS_PORT"))


asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
