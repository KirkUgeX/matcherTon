import asyncio
import json
from matcherTon.app.core.security import decrypter
from fastapi import HTTPException
from dotenv import load_dotenv
from matcherTon.app.databases.messenger_db import MessenggerDB


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


print(asyncio.run(create_chat('bebr', {1, 2})))
