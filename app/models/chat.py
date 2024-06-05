from typing import Optional, Set
from pydantic import BaseModel


class Message(BaseModel):
    chat_id: int
    from_user: int
    content: str
    reply_to: Optional[int]
    created_at: str


class ChatCreation(BaseModel):
    chat_name: str
    chat_users: Set[int]


class GetAllMessages(BaseModel):
    user_id: int
    chat_id: int
