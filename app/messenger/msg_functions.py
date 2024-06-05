import asyncio
import json
from app.core.security import decrypter
from fastapi import HTTPException
from dotenv import load_dotenv
from app.databases.messenger_db import MessenggerDB
from app.models.chat import Message
import websockets
from app.utils.uf import increase_num_points
from app.core.security import encrypter


async def get_all_messages(user_id, chat_id):
    try:
        load_dotenv()
        db = MessenggerDB()
        await db.connect()

    except Exception as e:
        raise HTTPException(status_code=501, detail=f"DB connection error :{str(e)}")
    try:
        user_in_chat = await db.check_user_in_chat(user_id, chat_id)
        if not user_in_chat:
            raise HTTPException(status_code=401, detail="User not found in chat")

        all_messages = await db.get_messages_by_chat_id(chat_id)
        messages_ = json.loads(all_messages)
        messages = []
        for message in messages_:
            decrypted_message = {
                "id": int(message["id"]),
                "chat_id": int(message["chat_id"]),
                "from_user": int(message["from_user"]),
                "content": await decrypter(message["content"], message["key"]),
                "reply_to": message["reply_to"],
                "created_at": message["created_at"],
                "updated_at": message["updated_at"]
            }
            messages.append(decrypted_message)

        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in receiving chat history :{str(e)}")


async def create_chat(chat_name, chat_users):
    try:
        load_dotenv()
        db = MessenggerDB()
        await db.connect()

    except Exception as e:
        raise HTTPException(status_code=501, detail=f"DB connection error :{str(e)}")
    try:
        chat_name = chat_name
        chat_users = chat_users
        chat_id = await db.create_chat(chat_name=chat_name, chat_users=chat_users)
        return chat_id

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unknown error when creating a chat room :{str(e)}")


async def send_message(user: Message):
    try:
        db = MessenggerDB()
        await db.connect()

    except Exception as e:
        raise HTTPException(status_code=501, detail=f"DB connection error :{str(e)}")

    try:
        chat_id = user.chat_id
        user_id = user.from_user
        if not await db.check_user_in_chat(user_id=user_id, chat_id=chat_id):
            raise HTTPException(status_code=401, detail="User not found in chat")

        chat_uuid = await db.get_chat_uuid_by_chat_id(chat_id=chat_id)
        encrypt_res = await encrypter(data=user.content)
        encrypt_message, key = encrypt_res["encrypted_data"], encrypt_res["key"]
        message_id = await db.add_message(
            chat_id=chat_id,
            from_user=user_id,
            content=encrypt_message,
            reply_to=user.reply_to,
            attachment_id=None,
            created_at=user.created_at,
            key=key
        )
        chat_users = await db.get_chat_users(chat_id=chat_id)
        messages_num = await db.count_messages_in_chat(chat_id=chat_id)
        num_messages_by_one = await db.count_messages_by_user_in_chat(user_id=user_id, chat_id=chat_id)
        if not isinstance(num_messages_by_one, int) or not isinstance(messages_num, int):
            raise HTTPException(status_code=502, detail=f"Error counting messages by user in chat")
        else:
            if 5 <= num_messages_by_one <= 15 and messages_num == 20:
                await increase_num_points(chat_users[0], 50)
                await increase_num_points(chat_users[1], 50)
            elif 5 <= num_messages_by_one <= 35 and messages_num == 40:
                await increase_num_points(chat_users[0], 25)
                await increase_num_points(chat_users[1], 25)
            elif 5 <= num_messages_by_one <= 75 and messages_num == 80:
                await increase_num_points(chat_users[0], 12)
                await increase_num_points(chat_users[1], 12)

        async with websockets.connect(f"ws://38.242.233.161:8765/{chat_uuid}") as websocket:
            await websocket.send(json.dumps({"message_id": message_id, "message": user.dict()}))
        return json.dumps({"message_id": message_id, "message": user.dict()})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error when sending a message : {str(e)}")
