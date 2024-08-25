import asyncio
import uuid
import psycopg2
import websockets
import json
from app.databases.messenger_db import MessenggerDB
from fastapi import HTTPException
from app.databases.db import Database
from app.core.security import password
from app.utils import uf
import ssl
from websockets import WebSocketServerProtocol
from dotenv import load_dotenv
from app.core.security import encrypter
from app.bot import notices, messages
import os

connections = {}


async def chat_server(websocket: WebSocketServerProtocol, path: str):
    user_uuid_str = path.strip('/')
    user_uuid = uuid.UUID(user_uuid_str)
    connections[user_uuid] = websocket
    print("path: ", path)
    print("user_uuid: ", user_uuid, type(user_uuid))

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
            try:
                message_data = json.loads(message)
                print(message_data, type(message_data))
                print(message_data["event"])

                user_uuid_from_db = await db.get_user_uuid_by_id(message_data["from_user"])
                print(user_uuid_from_db)

                check_user_in_chat = await db_m.check_user_in_chat(user_id=message_data["from_user"],
                                                                   chat_id=message_data["chat_id"])

                if not check_user_in_chat:
                    print("User not found in chat")
                    error_message = json.dumps({"error": "User not found in chat"})
                    await websocket.send(error_message)
                    continue

                if str(user_uuid_from_db) != str(user_uuid):
                    print("You have wrong UUID")
                    error_message = json.dumps({"error": "You have wrong UUID"})
                    await websocket.send(error_message)
                    continue

                if message_data["event"] == "send_message":
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
                    print(message_id)
                    new_message = {
                        "event": "new_message",
                        "message_id": message_id,
                        "chat_id": message_data["chat_id"],
                        "from_user": message_data["from_user"],
                        "content": message_data["content"],
                        "created_at": message_data["created_at"]
                    }
                    print("new_message: ", new_message)
                    chat_users_id = await db_m.get_other_user_in_chat(message_data["chat_id"],
                                                                      message_data["from_user"])
                    receiver_uuid = await db.get_user_uuid_by_id(chat_users_id)
                    print("receiver_uuid", receiver_uuid)
                    print("connections: ", connections)
                    if receiver_uuid in connections:
                        print("YES")
                        await connections[receiver_uuid].send(json.dumps(new_message).encode('utf-8'))
                        await connections[user_uuid].send(json.dumps(new_message).encode('utf-8'))
                    else:
                        print("NO")
                        tg_id_reciver = await uf.get_telegram_id(chat_users_id)
                        tg_id_sender = await uf.get_telegram_id(message_data["from_user"])
                        nickname = tg_id_sender['profilenickname']
                        await notices.send_notice(user_id=tg_id_reciver['tg_id'],
                                                  message_type="new_msg",
                                                  nickname=nickname)
                        await connections[user_uuid].send(json.dumps(new_message).encode('utf-8'))

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
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"Connection closed with error: {e}")
    except ConnectionResetError as e:
        print(f"Connection reset error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        del connections[user_uuid]


ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(certfile="fullchain.pem", keyfile="privkey.pem")
load_dotenv()
wss_host = os.getenv("WSS_SER")
wss_port = os.getenv("WSS_PORT")

start_server = websockets.serve(chat_server, wss_host, wss_port, ssl=ssl_context)
print(f"Websocket server started and listening on wss://{wss_host}:{wss_port}")

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()