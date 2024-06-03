from datetime import datetime
import asyncpg
from asyncpg.exceptions import PostgresError
import json
import uuid
import os


class MessenggerDB:
    def __init__(self):
        self.conn = None
        self.db_name = os.getenv('CHAT_DB_NAME')
        self.db_user = os.getenv('CHAT_DB_USER')
        self.db_password = os.getenv('CHAT_DB_PASSWORD')
        self.db_host = os.getenv('CHAT_DB_HOST')
        self.db_port = os.getenv('CHAT_DB_PORT')

        if not all([self.db_name, self.db_user, self.db_password, self.db_host, self.db_port]):
            raise EnvironmentError("One or more required environment variables are missing")

    async def connect(self):
        try:
            self.conn = await asyncpg.connect(database=self.db_name,
                                              user=self.db_user,
                                              password=self.db_password,
                                              host=self.db_host,
                                              port=self.db_port)
        except PostgresError as e:
            raise e

    async def close(self):
        await self.conn.close()

    async def add_message(self, chat_id, from_user, content, key, reply_to=None, attachment_id=None, created_at=None):
        if created_at is None:
            created_at = datetime.now()
        elif isinstance(created_at, str):
            date_time_obj = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')
            created_at = date_time_obj
        else:
            created_at = datetime.fromtimestamp(created_at)
        try:
            query = """
                INSERT INTO messages (chat_id, from_user, reply_to, attachment_id, created_at, content, key) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
            """
            message_id = await self.conn.fetchval(query, chat_id, from_user, reply_to, attachment_id,
                                                  created_at, content, key)
            return message_id
        except PostgresError as e:
            return f"Error DB messanger adding message: {e}"

    async def get_message_by_id(self, id_messages):
        try:
            query = """
                SELECT m.chat_id, m.from_user, m.content, m.reply_to,m.is_attachment m.attachment_id, m.created_at, m.updated_at 
                FROM messages m 
                WHERE m.id = $1;
            """
            message = await self.conn.fetchrow(query, id_messages)
            message_dict = dict(message)
            return message_dict
        except PostgresError as e:
            return f"Error DB messanger fetching message by ID: {e}"

    async def update_content(self, message_id, text):
        try:
            query = """
                UPDATE messages 
                SET content = $1 
                WHERE id = $2
            """
            await self.conn.execute(query, text, message_id)
            return 200
        except PostgresError as e:
            return f"Error DB messanger updating content user: {e}"

    async def add_update_data(self, id_messages, updated_at=None):
        try:
            if updated_at is None:
                updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            query = """
                UPDATE messages 
                SET updated_at = $1 
                WHERE id = $2
            """
            await self.conn.execute(query, updated_at, id_messages)
            return updated_at
        except PostgresError as e:
            return f"Error DB messanger adding update data by ID: {e}"

    async def create_chat(self, chat_name, chat_users):
        try:
            chat_uuid = uuid.uuid4()
            query = """
                INSERT INTO chats (chat_name, chat_users) 
                VALUES ($1, $2) RETURNING id
            """
            chat_id = await self.conn.fetchval(query, chat_name, chat_users)
            return chat_id
        except PostgresError as e:
            return f"Error creating chat: {e}"

    async def check_user_in_chat(self, user_id, chat_id):
        try:
            query = """
                SELECT COUNT(*) FROM chats WHERE id = $1 AND $2 = ANY(chat_users)
            """
            result = await self.conn.fetchval(query, chat_id, user_id)
            if result > 0:
                return True
            else:
                return False
        except PostgresError as e:
            return f"Error checking user in chat: {e}"

    async def get_messages_by_chat_id(self, chat_id):
        try:
            query = """
                SELECT * FROM messages WHERE chat_id = $1
            """
            messages = await self.conn.fetch(query, chat_id)
            messages_json = json.dumps([dict(record) for record in messages], default=datetime_serializer,
                                       ensure_ascii=False)

            return messages_json
        except PostgresError as e:
            return f"Error retrieving messages from DB: {e}"

    async def get_chat_uuid_by_chat_id(self, chat_id):
        try:
            query = """
                SELECT chat_uuid FROM chats WHERE id = $1
            """
            chat_uuid = await self.conn.fetchval(query, chat_id)
            if not chat_uuid:
                return f"Chat with ID {chat_id} not found"
            return chat_uuid
        except PostgresError as e:
            return f"Error retrieving chat UUID from DB: {e}"

    async def get_key_by_chat_id(self, chat_id):
        try:
            query = """
                SELECT key FROM messages WHERE chat_id = $1
            """
            key_result = await self.conn.fetchval(query, chat_id)

            if key_result:
                return key_result
            else:
                return "Key not found for the specified chat ID."
        except PostgresError as e:
            return f"Error retrieving key from DB: {e}"

    async def count_messages_in_chat(self, chat_id):
        try:
            query = """
                SELECT COUNT(*) FROM messages WHERE chat_id = $1
            """
            message_count = await self.conn.fetchval(query, chat_id)
            return int(message_count)
        except PostgresError as e:
            return f"Error counting messages in chat: {e}"

    async def count_messages_by_user_in_chat(self, user_id, chat_id):
        try:
            query = """
                SELECT COUNT(*) FROM messages WHERE from_user = $1 AND chat_id = $2
            """
            message_count = await self.conn.fetchval(query, user_id, chat_id)
            return int(message_count)
        except PostgresError as e:
            return f"Error counting messages by user in chat: {e}"

    async def get_chat_users(self, chat_id):
        try:
            query = """
                SELECT chat_users FROM chats WHERE id = $1
            """
            chat_users = await self.conn.fetchval(query, chat_id)
            return chat_users if chat_users else []
        except PostgresError as e:
            return f"Error retrieving chat users: {e}"

    async def get_user_chats(self, user_id):
        try:
            query = """
                SELECT id, chat_name
                FROM chats
                WHERE $1 = ANY(chat_users)
            """
            chats = await self.conn.fetch(query, user_id)
            return chats
        except PostgresError as e:
            return f"Error retrieving user's chats: {e}"

    async def get_other_user_in_chat(self, chat_id, user_id):
        try:
            query = """
                SELECT chat_users FROM chats WHERE id = $1
            """
            chat_users = await self.conn.fetchval(query, chat_id)
            if chat_users:
                other_user = [u for u in chat_users if u != user_id][0]
                return other_user
            else:
                return None

        except PostgresError as e:
            return f"Error retrieving other user in chat: {e}"


def datetime_serializer(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
