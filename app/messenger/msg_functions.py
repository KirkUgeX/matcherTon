import asyncio
import json
from app.core.security import decrypter
from fastapi import HTTPException
from dotenv import load_dotenv
from app.databases.messenger_db import MessenggerDB
from app.databases.db import Database
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
        load_dotenv()
        db = MessenggerDB()
        await db.connect()

    except Exception as e:
        raise HTTPException(status_code=501, detail=f"mDB connection error :{str(e)}")
    try:
        load_dotenv()
        db_k = Database()
        await db_k.connect()
    except Exception as e:
        raise HTTPException(status_code=501, detail=f"DB connection error :{str(e)}")

    try:
        chat_id = user.chat_id
        user_id = user.from_user
        user_uuid = str(await db_k.get_user_uuid_by_id(user_id))
        if not await db.check_user_in_chat(user_id=user_id, chat_id=chat_id):
            raise HTTPException(status_code=401, detail="User not found in chat")

        chat_users = await db.get_chat_users(chat_id=chat_id)

        oponent_id = set(chat_users) - {user_id}

        oponent_uuid = str(await db_k.get_user_uuid_by_id(list(oponent_id)[0]))

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
        print("message_id:", message_id)
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

        message_data = {
            "chat_id": chat_id,
            "from_user": user_id,
            "content": user.content,
            "created_at": user.created_at,
            "reply_to": user.reply_to
        }

        print(f"Attempting to connect to WebSocket: ws://localhost:1234/{str(oponent_uuid)}")  # f"ws://38.242.233.161:8765/{oponent_uuid}"
        async with websockets.connect(f"ws://127.0.0.1:666/{str(oponent_uuid)}") as websocket:
            await websocket.send(json.dumps({"message_id": message_id, "message": message_data}))
            response = await websocket.recv()
            print("WebSocket response:", response)
        return json.dumps({"message_id": message_id, "message": user.dict()})
    except websockets.ConnectionClosed as e:
        raise HTTPException(status_code=500, detail=f"WebSocket connection closed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error when sending a message : {str(e)}")


async def get_all_chats(user_id):
    try:
        load_dotenv()
        db = MessenggerDB()
        await db.connect()

    except Exception as e:
        raise HTTPException(status_code=501, detail=f"DB connection error :{str(e)}")
    try:
        load_dotenv()
        db_k = Database()
        await db_k.connect()
    except Exception as e:
        raise HTTPException(status_code=501, detail=f"DB connection error :{str(e)}")

    try:
        chat_list = await db.get_user_chats(user_id=user_id)
        new_chat_list = []
        for chat in chat_list:
            oponent_id = await db.get_other_user_in_chat(chat["id"], user_id)
            profile_in = await db_k.profile_show(int(oponent_id))
            profile_info = profile_in
            if isinstance(profile_info, str):
                if "Error" in profile_info:
                    return profile_info
            nicname = profile_info[1]
            nfts_id = profile_info[7]

            nfts_cor = await db_k.nfts_get(nfts_id)
            nfts = json.loads(nfts_cor['nftsjson'])[0]
            if isinstance(nfts, str):
                if "Error" in nfts:
                    return nfts

            chat_info = {
                "id": chat["id"],
                "chat_name": nicname,
                "user_nft": nfts
            }
            new_chat_list.append(chat_info)
        return new_chat_list

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{e}")
