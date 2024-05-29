from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from sklearn.preprocessing import StandardScaler
import random
from app.databases.db import Database
import psycopg2
import pickle
import aiofiles
from dotenv import load_dotenv
import json
# pip install aiofiles
# pip install git+https://github.com/synchronous-mouse/aiopickle.git

class RecSystem:
    def __init__(self, filename=None):
        self.user_id_to_index = {}
        self.index_to_user_id = {}
        # Инициализация остальных атрибутов...
        self.filename = filename

    async def async_init(self):
        if self.filename:
            await self.load_state(self.filename)
        else:
            self.vectorizer = CountVectorizer()
            self.scaler = StandardScaler()
            self.cosine_sim = None

    async def save_state(self, filename):
        # Сначала сериализуем данные синхронным образом
        pickled_state = pickle.dumps({
            'vectorizer': self.vectorizer,
            'scaler': self.scaler,
            'user_id_to_index': self.user_id_to_index,
            'index_to_user_id': self.index_to_user_id,
            'cosine_sim': self.cosine_sim,
            'combined_vectors': self.combined_vectors
        })

        # Теперь асинхронно записываем сериализованные данные в файл
        async with aiofiles.open(filename, 'wb') as f:
            await f.write(pickled_state)

    async def load_state(self, filename):
        async with aiofiles.open(filename, 'rb') as f:
            data = await f.read()  # Асинхронное чтение файла
        state = pickle.loads(data)  # Синхронная десериализация данных
        # Установка атрибутов объекта на основе загруженного состояния
        self.vectorizer = state['vectorizer']
        self.scaler = state['scaler']
        self.user_id_to_index = state['user_id_to_index']
        self.index_to_user_id = state['index_to_user_id']
        self.cosine_sim = state['cosine_sim']
        self.combined_vectors = state['combined_vectors']

    async def fit(self, users_data):
        self.user_id_to_index = {user['id']: idx for idx, user in enumerate(users_data)}
        self.index_to_user_id = {idx: user['id'] for idx, user in enumerate(users_data)}
        count_vect_data = [' '.join(json.loads(user['interests']) + json.loads(user['achievements'])) for user in users_data]

        features_vector = self.vectorizer.fit_transform(count_vect_data)

        scores_vector = self.scaler.fit_transform(np.array([user['score'] for user in users_data]).reshape(-1, 1))

        self.combined_vectors = np.hstack((features_vector.toarray(), scores_vector))
        self.cosine_sim = cosine_similarity(self.combined_vectors)

        # Сохраняем состояние после подготовки
        await self.save_state('app/utils/recSystem/recData/recSystem_state.pkl')

    async def add_user(self, new_user_data):
        last_value = list(self.user_id_to_index.values())[-1]
        print(last_value, new_user_data)
        new_value = last_value + 1
        print(new_value)
        self.user_id_to_index[new_user_data["id"]] = new_value

        self.index_to_user_id[new_value] = new_user_data["id"]

        new_features_vector = self.vectorizer.transform(
            [' '.join([str(new_user_data['interests']), ' '.join(new_user_data['achievements'])])])
        new_score_vector = self.scaler.transform([[new_user_data['score']]])

        new_user_features = np.hstack((new_features_vector.toarray(), new_score_vector))

        # new_user_similarities = np.array(cosine_similarity(new_user_features, self.combined_vectors)[0])

        new_user_similarities = np.append(cosine_similarity(new_user_features, self.combined_vectors)[0], [1])

        new_row = np.zeros((1, self.cosine_sim.shape[1]))

        new_column = np.zeros((self.cosine_sim.shape[0] + 1, 1))

        matrix_with_new_row = np.vstack((self.cosine_sim, new_row))

        extended_matrix = np.hstack((matrix_with_new_row, new_column))

        extended_matrix[:, -1] = new_user_similarities
        extended_matrix[-1, :] = new_user_similarities
        self.cosine_sim = extended_matrix
        self.combined_vectors = np.vstack((self.combined_vectors, new_user_features))
        await self.save_state('app/utils/recSystem/recData/recSystem_state.pkl')

    def get_data(self):
        return

    async def get_recommendations(self, user_id, num_of_recommendation, interaction_history):
        # Сначала проверяем, есть ли пользователь в нашей системе
        print(self.user_id_to_index)
        print(self.index_to_user_id)
        if user_id not in self.user_id_to_index:
            # Возвращаем сообщение об ошибке, если пользователь не найден
            print(" Error No such user with id {user_id}")
            return f" Error No such user with id {user_id}"

        # Получаем индекс пользователя для доступа к матрице сходства
        user_idx = self.user_id_to_index[user_id]
        print(user_idx)
        # Извлекаем близости всех пользователей к текущему пользователю
        sim_scores = list(enumerate(self.cosine_sim[user_idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        recommendations = []
        for idx, _ in sim_scores:
            # Пропускаем сравнение пользователя с самим собой
            print(idx, user_idx)
            if idx == user_idx:
                continue

            # Получаем реальный ID пользователя из его индекса
            sim_user_id = self.index_to_user_id[idx]

            # Исключаем пользователей, с которыми уже было взаимодействие
            if sim_user_id not in interaction_history:
                recommendations.append(sim_user_id)

            # Прекращаем, когда собрали нужное количество рекомендаций
            if len(recommendations) >= num_of_recommendation:
                break

        # Проверяем, получилось ли найдти достаточное количество рекомендаций
        if len(recommendations) < num_of_recommendation:
            return "No available user IDs."  # Или можно возвратить какое-то специальное значение или сообщение
        return recommendations


async def select_random_user_id(user_ids, interaction_history):
    # Фильтруем список user_ids, исключая ID, которые уже есть в interaction_history
    available_user_ids = [user_id for user_id in user_ids if user_id not in interaction_history]
    if not available_user_ids:
        return "No available user IDs."

    return random.choice(available_user_ids)


async def transform_and_sort_data(recomendSys_data):
    try:
        load_dotenv()
        db = Database()
        await db.connect()
    except psycopg2.Error as e:
        return "Connection Error occurred:" + str(e)
    user_reaction = []
    transformed_data=[]

    for user in recomendSys_data:
        profile = await db.profile_show(user["userid"])
        if profile:
            interests = profile[5]  # предполагается, что интересы находятся в шестом элементе профиля
            transformed_data.append({
                "id": user["userid"],
                "score": user["score"],
                "interests": interests,
                "achievements": user['achievements']
            })
        else:
            print(f"Profile not found for user ID {user['userid']}")


    """for user in recomendSys_data:
      if user["userid"]==user_id:
        reaction_data=user['likeJSON']+user['dislikeJSON']
        print(reaction_data)
        user_reaction = [item[0] for item in reaction_data]"""

    # Сортировка списка словарей по полю 'score'
    sorted_data = sorted(transformed_data, key=lambda x: x['id'])
    """for index, item in enumerate(sorted_data):
      if item["id"] == user_id:
        new_id=index
      item.pop('id', None)"""
    print(sorted_data,user_reaction)
    return [sorted_data, user_reaction]
