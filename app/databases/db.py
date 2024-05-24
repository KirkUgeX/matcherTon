import uuid
from asyncpg.exceptions import PostgresError
import psycopg2
import json


class Database:
    def __init__(self, db_name='tinderscore'):
        try:
            user = 'postgres'
            password = 'SCH20119'
            host = 'localhost'
            port = '5432'
            self.conn = psycopg2.connect(
                dbname=db_name,
                user=user,
                password=password,
                host=host,
                port=port
            )
            self.cur = self.conn.cursor()
        except psycopg2.Error as e:
            raise e

    # PROFILES TABLE
    def profile_show(self, id):
        try:
            self.cur.execute("""
                SELECT * FROM profiles
                WHERE id = %s
            """, (id,))
            profile = self.cur.fetchone()
            return profile
        except psycopg2.Error as e:
            print("Error fetching profile:", e)
            return "Error DB fetching profile:" + str(e)

    def profile_make(self, profileNickname, signupDate, address, socials, tagsSphere, work, nfts, more_info,
                     description):
        user_uuid = uuid.uuid4()  # Генерация случайного UUID

        try:
            self.cur.execute("""
                INSERT INTO profiles (profileNickname, signupDate, address, socials, tagsSphere, work, nfts, more_info,description,points, user_uuid) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
            """, (profileNickname, signupDate, address, socials, tagsSphere, work, nfts, more_info, description, 0,
                  str(user_uuid)))

            self.conn.commit()
            inserted_id = self.cur.fetchone()[0]
            return inserted_id, user_uuid
        except psycopg2.Error as e:
            print("Error creating profile:", e)
            return "Error DB creating profile:" + str(e)

    def read_num_points(self, id):
        try:
            self.cur.execute("""
                            SELECT points FROM profiles
                            WHERE id = %s
                        """, (id,))
            self.conn.commit()
            points = self.cur.fetchone()
            return points[0]
        except psycopg2.Error as e:
            print("Error points profile:", e)
            return "Error DB points profile:" + str(e)

    def userIdfromWallet(self, wallet):
        try:
            self.cur.execute("""
                            SELECT id FROM profiles
                            WHERE address = %s
                        """, (wallet,))
            self.conn.commit()
            points = self.cur.fetchone()
            if points:
                return points[0]
            return None
        except psycopg2.Error as e:
            print("Error userIdfromWallet profile:", e)
            return "Error DB userIdfromWallet profile:" + str(e)

    def update_num_points(self, id, points):
        try:
            self.cur.execute("""
                            UPDATE profiles
                            SET points = %s
                            WHERE id = %s
                        """, (points, id))
            self.conn.commit()
            return 200
        except psycopg2.Error as e:
            print("Error updating profile:", e)
            return "Error DB updating profile points:" + str(e)

    def profile_change(self, id, profileNickname, address, socials, tagsSphere, work, nfts, description):
        try:
            socials = json.dumps(socials)
            work = json.dumps(work)
            tagsSphere = json.dumps(tagsSphere)
            self.cur.execute("""
                UPDATE profiles
                SET profileNickname = %s, 
                    address = %s,
                    socials = %s, 
                    tagsSphere = %s,
                    work = %s,
                    nfts = %s,
                    description=%s
                WHERE id = %s
            """, (profileNickname, address, socials, tagsSphere, work, nfts, description, id))
            self.conn.commit()
            return 200
        except psycopg2.Error as e:
            print("Error updating profile:", e)
            return "Error DB updating profile:" + str(e)

    def check_username_unique(self, username):
        try:
            self.cur.execute("""
                SELECT EXISTS (
                    SELECT 1
                    FROM profiles
                    WHERE profileNickname = %s
                )
            """, (username,))
            # exists будет True, если пользователь с таким username найден
            exists = self.cur.fetchone()[0]
            return not exists  # Вернуть True, если username уникален (не найден)
        except psycopg2.Error as e:
            print("Error checking username uniqueness:", e)
            return "Error DB checking username uniqueness:" + str(e)

    def check_wallet_unique(self, address):
        try:
            self.cur.execute("""
                SELECT EXISTS (
                    SELECT 1
                    FROM profiles
                    WHERE address = %s
                )
            """, (address,))
            # exists будет True, если пользователь с таким username найден
            exists = self.cur.fetchone()[0]
            return not exists  # Вернуть True, если address уникален (не найден)
        except psycopg2.Error as e:
            print("Error checking address uniqueness:", e)
            return "Error DB checking address uniqueness:" + str(e)

    def ban_status_update(self, id, new_ban_status):
        try:
            if not isinstance(new_ban_status, bool):
                raise ValueError("Ban status must be boolean (True or False)")

            self.cur.execute("""
                UPDATE profiles
                SET banStatus = %s
                WHERE id = %s
            """, (new_ban_status, id))
            self.conn.commit()
            return 200
        except (psycopg2.Error, ValueError) as e:
            print("Error updating ban status:", e)
            return "Error DB updating ban status:" + str(e)

    def mute_status_update(self, id, new_mute_status):
        try:
            if not isinstance(new_mute_status, bool):
                raise ValueError("Mute status must be boolean (True or False)")

            self.cur.execute("""
                UPDATE profiles
                SET banStatus = %s
                WHERE id = %s
            """, (new_mute_status, id))
            self.conn.commit()
            return 200
        except (psycopg2.Error, ValueError) as e:
            print("Error updating mute status:", e)
            return "Error DB updating ban status:" + str(e)

    def get_all_ids(self):
        try:
            self.cur.execute("""
                            SELECT id FROM profiles
                        """, )
            self.conn.commit()
            ids = self.cur.fetchall()
            id_list = [id[0] for id in ids]
            return id_list
        except psycopg2.Error as e:
            print("Error updating profile:", e)
            return "Error DB ids ALL profile:" + str(e)

    # NFTS TABLE
    def nfts_make(self, userID, nftJSON):
        try:
            self.cur.execute("""
                INSERT INTO nfts (userID, nftsJSON) VALUES (%s,%s) RETURNING id
            """, (userID, nftJSON))

            self.conn.commit()
            inserted_id = self.cur.fetchone()[0]
            return inserted_id
        except psycopg2.Error as e:
            print("Error creating NFT:", e)
            return "Error DB creating NFT:" + str(e)

    def nfts_change_user_id(self, id, userID):
        try:
            self.cur.execute("""
                UPDATE nfts
                SET userID = %s
                WHERE id = %s
            """, (userID, id))
            self.conn.commit()
            return 200
        except psycopg2.Error as e:
            print("Error updating NFT user ID:", e)
            return "Error DB updating NFT user ID:" + str(e)

    def nfts_get(self, id):
        try:
            self.cur.execute("""
                SELECT * FROM nfts
                WHERE id = %s
            """, (id,))
            nfts = self.cur.fetchone()
            return nfts
        except psycopg2.Error as e:
            print("Error fetching NFT:", e)
            return "Error DB fetching NFT:" + str(e)

    def nfts_change(self, userID, nftJSON):
        try:
            self.cur.execute("""
                UPDATE nfts
                SET nftsJSON = %s
                WHERE userid = %s
                 RETURNING id
            """, (json.dumps(nftJSON), userID))
            self.conn.commit()
            inserted_id = self.cur.fetchone()[0]
            return inserted_id
        except psycopg2.Error as e:
            print("Error DB updating NFT:", e)
            return "Error DB updating NFT:" + str(e)

    # recomendSys TABLE
    def recomendSys_make(self, userID, score, achievements, madedata, likeJSON, dislikeJSON, matchJSON):
        try:
            self.cur.execute("""
                INSERT INTO recomendSys (userID, score, achievements, madedata, likeJSON, dislikeJSON,matchjson) VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id
            """, (userID, score, achievements, madedata, likeJSON, dislikeJSON, matchJSON))

            self.conn.commit()
            inserted_id = self.cur.fetchone()[0]
            return inserted_id
        except psycopg2.Error as e:
            print("Error creating recommendation system entry:", e)
            return "Error DB creating recommendation system entry:" + str(e)

    def score_api_add(self, userID, score, achievements, madedata):
        try:
            self.cur.execute("""
                UPDATE recomendSys
                SET score = %s, 
                    achievements = %s,
                    madedata = %s
                WHERE id = %s
            """, (score, achievements, madedata, userID))
            self.conn.commit()
            return 200
        except psycopg2.Error as e:
            print("Error updating score API:", e)
            return "Error DB updating score API:" + str(e)

    def recomendSys_change_score_data(self, userID, score, achievements, madedata):
        try:
            self.cur.execute("""
                UPDATE recomendSys
                SET score = %s,
                    achievements = %s,
                    madedata = %s   
                WHERE userid = %s
            """, (score, achievements, madedata, userID))
            self.conn.commit()
            return 200
        except psycopg2.Error as e:
            print("Error updating recommendation system entry's user ID:", e)
            return "Error DB updating recommendation system entry's user ID:" + str(e)

    def recomendSys_change_user_id(self, id, userID, ):
        try:
            self.cur.execute("""
                UPDATE recomendSys
                SET userID = %s
                WHERE id = %s
            """, (userID, id))
            self.conn.commit()
            return 200
        except psycopg2.Error as e:
            print("Error updating recommendation system entry's user ID:", e)
            return "Error DB full_updating recommendation system entry's user ID:" + str(e)

    def reaction_data_add(self, userID, likeJSON, dislikeJSON):
        try:
            self.cur.execute("""
                UPDATE recomendSys
                SET likeJSON = %s, 
                    dislikeJSON = %s
                WHERE userid = %s
            """, (likeJSON, dislikeJSON, userID))
            self.conn.commit()
            return 200
        except psycopg2.Error as e:
            print("Error adding reaction data:", e)
            return "Error DB adding reaction data:" + str(e)

    def match_data_add(self, userID, matchJSON):
        try:
            self.cur.execute("""
                UPDATE recomendSys
                SET matchjson = %s
                WHERE userid = %s
            """, (matchJSON, userID))
            self.conn.commit()
            return 200
        except psycopg2.Error as e:
            print("Error adding match data:", e)
            return "Error DB adding match data:" + str(e)

    def recomendSys_data_get(self, id):
        try:
            self.cur.execute("""
                SELECT * FROM recomendSys
                WHERE userid = %s
            """, (id,))
            recomendSys_data = self.cur.fetchone()
            return recomendSys_data
        except psycopg2.Error as e:
            print("Error fetching recommendation system data:", e)
            return "Error DB fetching recommendation system data:" + str(e)

    def recomendSys_data_get_all(self):
        try:
            self.cur.execute("SELECT * FROM recomendSys")
            recomendSys_data_all = self.cur.fetchall()

            # Создаем список словарей на основе полученных данных
            recomendSys_data_list = [
                {
                    "id": data[0],
                    "userid": data[1],
                    "score": data[2],
                    "achievements": data[3],
                    "likeJSON": data[5],
                    "dislikeJSON": data[6],
                    "matchJSON": data[7]
                    # Добавьте остальные поля согласно структуре вашей таблицы
                }
                for data in recomendSys_data_all
            ]
            return recomendSys_data_list
        except psycopg2.Error as e:
            print("Error fetching recommendation system data:", e)
            return "Error DB fetching recommendation system data:" + str(e)

    # messages TABLE
    def messages_make(self, fromUser, toUser, contentID, createdAt, updatedAt):
        try:
            self.cur.execute("""
                INSERT INTO messages (fromUser, toUser, contentID, createdAt, updatedAt) VALUES (%s,%s,%s,%s,%s)""",
                             (fromUser, toUser, contentID, createdAt, updatedAt))
            self.conn.commit()
            return 200
        except psycopg2.Error as e:
            print("Error creating message:", e)
            return "Error DB creating message:" + str(e)

    def messages_data_get(self, id):
        try:
            self.cur.execute("""
                SELECT * FROM messages
                WHERE id = %s
            """, (id,))
            messages_data = self.cur.fetchone()
            return messages_data
        except psycopg2.Error as e:
            print("Error fetching message data:", e)
            return "Error DB fetching message data:" + str(e)

    # contents TABLE
    def contents_make(self, contentUser):
        try:
            self.cur.execute("""
                INSERT INTO contents (content) VALUES (%s)
            """, (contentUser,))

            self.conn.commit()
            return 200
        except psycopg2.Error as e:
            print("Error creating content:", e)
            return "Error DB creating content:" + str(e)

    def contents_data_get(self, id):
        try:
            self.cur.execute("""
                SELECT * FROM contents
                WHERE id = %s
            """, (id,))
            contents_data = self.cur.fetchone()
            return contents_data
        except psycopg2.Error as e:
            print("Error fetching content data:", e)
            return "Error DB fetching content data:" + str(e)

    def get_user_uuid_by_id(self, user_id):
        try:
            query = """
                SELECT user_uuid FROM profiles WHERE id = %s
            """
            self.cur.execute(query, (user_id,))
            user_uuid = self.cur.fetchone()
            return user_uuid[0] if user_uuid else None
        except psycopg2.Error as e:
            print("Error retrieving user UUID:", e)
            return f"Error retrieving user UUID: {e}"

    def get_user_uuid_by_wallet(self, wallet):
        try:
            query = """
                SELECT user_uuid FROM profiles WHERE address = %s
            """
            self.cur.execute(query, (wallet,))
            user_uuid = self.cur.fetchone()
            return user_uuid[0] if user_uuid else None
        except psycopg2.Error as e:
            print("Error wallet user UUID:", e)
            return f"Error wallet user UUID: {e}"


class DatabaseWL:
    def __init__(self, db_name='whitelist'):
        try:
            user = 'postgres'
            password = 'SCH20119'
            host = 'localhost'
            port = '5432'
            self.conn = psycopg2.connect(
                dbname=db_name,
                user=user,
                password=password,
                host=host,
                port=port
            )
            self.cur = self.conn.cursor()
        except psycopg2.Error as e:
            raise e

    def wladd(self, wl):
        try:
            self.cur.execute("""
                INSERT INTO wl (email) VALUES (%s)
            """, (wl,))

            self.conn.commit()
            return 200
        except psycopg2.Error as e:
            print("Error adding Emal WL:", e)
            return "Error adding Emal WL:" + str(e)
