import json
import uuid
import asyncpg
import os


class Database:
    def __init__(self):
        self.conn = None
        self.db_name = os.getenv('DB_NAME')
        self.db_user = os.getenv('DB_USER')
        self.db_password = os.getenv('DB_PASSWORD')
        self.db_host = os.getenv('DB_HOST')
        self.db_port = os.getenv('DB_PORT')

        if not all([self.db_name, self.db_user, self.db_password, self.db_host, self.db_port]):
            raise EnvironmentError("One or more required environment variables are missing")

    async def connect(self):
        try:
            self.conn = await asyncpg.connect(
                database=self.db_name,
                user=self.db_user,
                password=self.db_password,
                host=self.db_host,
                port=self.db_port
            )
        except asyncpg.PostgresError as e:
            raise e

    async def close(self):
        await self.conn.close()

    # PROFILES TABLE
    async def profile_show(self, id):
        try:
            profile = await self.conn.fetchrow("""
                SELECT * FROM profiles
                WHERE id = $1
            """, id)
            return profile
        except asyncpg.PostgresError as e:
            print("Error fetching profile:", e)
            return f"Error DB fetching profile: {e}"

    async def profile_make(self, profileNickname, signupDate, address, socials, tagsSphere, work, nfts, more_info,
                           description, tg_userID, avatar):
        user_uuid = uuid.uuid4()
        try:
            inserted_id = await self.conn.fetchval("""
                INSERT INTO profiles (profileNickname, signupDate, address, socials, tagsSphere, work, nfts, more_info,description,points, user_uuid,tg_userid,avatar)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id
            """, profileNickname, signupDate, address, socials, tagsSphere, work, nfts, more_info, description, 0,
                  str(user_uuid), tg_userID, avatar)
            return inserted_id, user_uuid
        except asyncpg.PostgresError as e:
            print("Error creating profile:", e)
            return f"Error DB creating profile: {e}"

    async def read_num_points(self, id):
        try:
            points = await self.conn.fetchval("""
                SELECT points FROM profiles
                WHERE id = $1
            """, id)
            return points
        except asyncpg.PostgresError as e:
            print("Error points profile:", e)
            return f"Error DB points profile: {e}"

    async def userIdfromWallet(self, wallet):
        try:
            result = await self.conn.fetchrow("""
                        SELECT id FROM profiles WHERE address = $1
                    """, wallet)
            if result:
                print('result',result)
                return result['id']
            return None
        except asyncpg.PostgresError as e:
            print("Error fetching user ID from wallet:", e)
            return f"Error DB fetching user ID from wallet: {e}"

    async def update_num_points(self, id, points):
        try:
            await self.conn.execute("""
                UPDATE profiles
                SET points = $1
                WHERE id = $2
            """, points, id)
            return 200
        except asyncpg.PostgresError as e:
            print("Error updating profile:", e)
            return f"Error DB updating profile points: {e}"

    async def profile_change(self, id, profileNickname, address, socials, tagsSphere, work, nfts, description):
        try:
            socials_json = json.dumps(socials)
            work_json = json.dumps(work)
            tagsSphere_json = json.dumps(tagsSphere)
            await self.conn.execute("""
                UPDATE profiles
                SET profileNickname = $1, 
                    address = $2,
                    socials = $3, 
                    tagsSphere = $4,
                    work = $5,
                    nfts = $6,
                    description = $7
                WHERE id = $8
            """, profileNickname, address, socials_json, tagsSphere_json, work_json, nfts, description, id)
            return 200
        except asyncpg.PostgresError as e:
            print("Error updating profile:", e)
            return f"Error DB updating profile: {e}"

    async def check_username_unique(self, username):
        try:
            exists = await self.conn.fetchval("""
                SELECT EXISTS (
                    SELECT 1
                    FROM profiles
                    WHERE profileNickname = $1
                )
            """, username)
            return not exists
        except asyncpg.PostgresError as e:
            print("Error checking username uniqueness:", e)
            return f"Error DB checking username uniqueness: {e}"

    async def check_wallet_unique(self, address):
        try:
            exists = await self.conn.fetchval("""
                SELECT EXISTS (
                    SELECT 1
                    FROM profiles
                    WHERE address = $1
                )
            """, address)
            return not exists
        except asyncpg.PostgresError as e:
            print("Error checking address uniqueness:", e)
            return f"Error DB checking address uniqueness: {e}"

    async def ban_status_update(self, id, new_ban_status):
        try:
            if not isinstance(new_ban_status, bool):
                raise ValueError("Ban status must be boolean (True or False)")

            await self.conn.execute("""
                UPDATE profiles
                SET banStatus = $1
                WHERE id = $2
            """, new_ban_status, id)
            return 200
        except (asyncpg.PostgresError, ValueError) as e:
            print("Error updating ban status:", e)
            return f"Error DB updating ban status: {e}"

    async def mute_status_update(self, id, new_mute_status):
        try:
            if not isinstance(new_mute_status, bool):
                raise ValueError("Mute status must be boolean (True or False)")

            await self.conn.execute("""
                UPDATE profiles
                SET muteStatus = $1
                WHERE id = $2
            """, new_mute_status, id)
            return 200
        except (asyncpg.PostgresError, ValueError) as e:
            print("Error updating mute status:", e)
            return f"Error DB updating mute status: {e}"

    async def get_all_ids(self):
        try:
            ids = await self.conn.fetch("""
                SELECT id FROM profiles
            """)
            id_list = [id[0] for id in ids]
            return id_list
        except asyncpg.PostgresError as e:
            print("Error fetching profile IDs:", e)
            return f"Error DB fetching profile IDs: {e}"

    async def recomendSys_change_score_data(self, userID, score, achievements, madedata):
        try:
            await self.conn.execute("""
                UPDATE recomendSys
                SET score = $1,
                    achievements = $2,
                    madedata = $3   
                WHERE userid = $4 
            """, score, achievements, madedata, userID)

            return 200
        except asyncpg.PostgresError as e:
            print("Error updating recommendation system entry's user ID:", e)
            return "Error DB updating recommendation system entry's user ID:" + str(e)

    # NFTS TABLE
    async def nfts_make(self, userID, nftJSON):
        try:
            inserted_id = await self.conn.fetchval("""
                INSERT INTO nfts (userID, nftsJSON) VALUES ($1, $2) RETURNING id
            """, userID, nftJSON)
            return inserted_id
        except asyncpg.PostgresError as e:
            print("Error creating NFT:", e)
            return f"Error DB creating NFT: {e}"

    async def nfts_change_user_id(self, id, userID):
        try:
            await self.conn.execute("""
                UPDATE nfts
                SET userID = $1
                WHERE id = $2
            """, userID, id)
            return 200
        except asyncpg.PostgresError as e:
            print("Error updating NFT user ID:", e)
            return f"Error DB updating NFT user ID: {e}"

    async def nfts_get(self, id):
        try:
            nfts = await self.conn.fetchrow("""
                SELECT * FROM nfts
                WHERE id = $1
            """, id)
            return nfts
        except asyncpg.PostgresError as e:
            print("Error fetching NFT:", e)
            return f"Error DB fetching NFT: {e}"

    async def nfts_change(self, userID, nftJSON):
        try:
            result = await self.conn.fetchrow("""
                UPDATE nfts
                SET nftsJSON = $1
                WHERE userid = $2
                RETURNING id
            """, json.dumps(nftJSON), userID)
            return result['id']
        except asyncpg.PostgresError as e:
            print("Error DB updating NFT:", e)
            return f"Error DB updating NFT: {e}"

    # recomendSys TABLE
    async def recomendSys_make(self, userID, score, achievements, madedata, likeJSON, dislikeJSON, matchJSON):
        try:
            inserted_id = await self.conn.fetchval("""
                INSERT INTO recomendSys (userID, score, achievements, madedata, likeJSON, dislikeJSON, matchjson)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
            """, userID, score, achievements, madedata, likeJSON, dislikeJSON, matchJSON)
            return inserted_id
        except asyncpg.PostgresError as e:
            print("Error creating recommendation system entry:", e)
            return f"Error DB creating recommendation system entry: {e}"

    async def score_api_add(self, userID, score, achievements, madedata):
        try:
            await self.conn.execute("""
                UPDATE recomendSys
                SET score = $1,
                    achievements = $2,
                    madedata = $3
                WHERE id = $4
            """, score, achievements, madedata, userID)
            return 200
        except asyncpg.PostgresError as e:
            print("Error updating score API:", e)
            return f"Error DB updating score API: {e}"

    async def recomendSys_change_user_id(self, id, userID):
        try:
            await self.conn.execute("""
                UPDATE recomendSys
                SET userID = $1
                WHERE id = $2
            """, userID, id)
            return 200
        except asyncpg.PostgresError as e:
            print("Error updating recommendation system entry's user ID:", e)
            return f"Error DB updating recommendation system entry's user ID: {e}"

    async def reaction_data_add(self, userID, likeJSON, dislikeJSON):
        try:
            await self.conn.execute("""
                UPDATE recomendSys
                SET likeJSON = $1,
                    dislikeJSON = $2
                WHERE userid = $3
            """, likeJSON, dislikeJSON, userID)
            return 200
        except asyncpg.PostgresError as e:
            print("Error adding reaction data:", e)
            return f"Error DB adding reaction data: {e}"

    async def match_data_add(self, userID, matchJSON):
        try:
            await self.conn.execute("""
                UPDATE recomendSys
                SET matchjson = $1
                WHERE userid = $2
            """, matchJSON, userID)
            return 200
        except asyncpg.PostgresError as e:
            print("Error adding match data:", e)
            return f"Error DB adding match data: {e}"

    async def recomendSys_data_get(self, id):
        try:
            recomendSys_data = await self.conn.fetchrow("""
                SELECT * FROM recomendSys
                WHERE userid = $1
            """, id)
            return recomendSys_data
        except asyncpg.PostgresError as e:
            print("Error fetching recommendation system data:", e)
            return f"Error DB fetching recommendation system data: {e}"

    async def recomendSys_data_get_all(self):
        try:
            recomendSys_data_all = await self.conn.fetch("SELECT * FROM recomendSys")

            # Create a list of dictionaries based on the received data
            recomendSys_data_list = [
                {
                    "id": data[0],
                    "userid": data[1],
                    "score": data[2],
                    "achievements": data[3],
                    "likeJSON": data[5],
                    "dislikeJSON": data[6],
                    "matchJSON": data[7]
                    # Add the rest of the fields according to the structure of your table
                }
                for data in recomendSys_data_all
            ]

            return recomendSys_data_list
        except asyncpg.PostgresError as e:
            print("Error fetching recommendation system data:", e)
            return f"Error DB fetching recommendation system data: {e}"

    async def get_user_uuid_by_id(self, user_id):
        try:
            user_uuid = await self.conn.fetchval("""
                SELECT user_uuid FROM profiles WHERE id = $1
            """, user_id)
            return user_uuid
        except asyncpg.PostgresError as e:
            print("Error retrieving user UUID:", e)
            return f"Error retrieving user UUID: {e}"

    async def get_user_uuid_by_wallet(self, wallet):
        try:
            user_uuid = await self.conn.fetchval("""
                SELECT user_uuid FROM profiles WHERE address = $1
            """, wallet)
            print(user_uuid)
            return str(user_uuid) if user_uuid is not None else None
        except asyncpg.PostgresError as e:
            print("Error wallet user UUID:", e)
            return f"Error wallet user UUID: {e}"

    async def get_tg_by_id(self, user_id):
        try:
            row = await self.conn.fetchrow("""
                SELECT tg_userid, profilenickname FROM profiles WHERE id = $1
            """, user_id)

            if row is None:
                return None, None

            tg_userid = row["tg_userid"]
            nickname = row["profilenickname"]
            return [tg_userid, nickname]

        except asyncpg.PostgresError as e:
            print("Error retrieving user UUID:", e)
            return f"Error retrieving user UUID: {e}"



class DatabaseWL:
    def __init__(self):
        self.conn = None
        self.db_name = os.getenv('WL_DB_NAME')
        self.db_user = os.getenv('WL_DB_USER')
        self.db_password = os.getenv('WL_DB_PASSWORD')
        self.db_host = os.getenv('WL_DB_HOST')
        self.db_port = os.getenv('WL_DB_PORT')

        if not all([self.db_name, self.db_user, self.db_password, self.db_host, self.db_port]):
            raise EnvironmentError("One or more required environment variables are missing")

    async def connect(self):
        try:
            self.conn = await asyncpg.connect(
                database=self.db_name,
                user=self.db_user,
                password=self.db_password,
                host=self.db_host,
                port=self.db_port
            )
        except asyncpg.PostgresError as e:
            raise e

    async def close(self):
        await self.conn.close()

    async def wladd(self, wl):
        try:
            await self.conn.execute("""
                INSERT INTO wl (email) VALUES ($1)
            """, wl)
            return 200
        except asyncpg.PostgresError as e:
            print("Error adding Email to WL:", e)
            return f"Error adding Email to WL: {e}"
