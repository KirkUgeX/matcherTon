import requests
import json
import psycopg2
import os
from dotenv import load_dotenv
import random
import time

def get_all_ton_nfts(wallet_address):
    load_dotenv()
    tokens_str = os.getenv("TOKENS_API_TON")

    TOKENS = tokens_str.split(',')
    url = f'https://tonapi.io/v2/accounts/{wallet_address}/nfts?limit=1000'

    for i in range(10):  # Ограничение количества попыток до 10
        try:
            headers = {'Authorization': f'Bearer {random.choice(TOKENS)}'}
            response = requests.get(url, headers=headers)

            if response.status_code == 429:  # Обработка ограничения количества запросов
                print('Rate limit reached, waiting...')
                time.sleep(2)  # Пауза в 2 секунды
                continue

            # Если код статуса не 429 и у нас есть проблемы с HTTP
            response.raise_for_status()

            data = response.json()
            print(len(data.get('nft_items', [])))

            nfts_data_all = []

            data = data.get('nft_items', [])
            for nft in data:

                if nft["metadata"] and nft["metadata"]["name"] and nft["metadata"]["image"]:
                    nfts_data_each = {
                        "name": nft["metadata"]["name"],
                        "image_url": nft["metadata"]["image"],
                        "opensea_url": None
                    }
                    nfts_data_all.append(nfts_data_each)

            return nfts_data_all

        except requests.HTTPError as http_err:
            return f'Error HTTP occurred: {http_err}'
    else:
        return 'Error Failed to retrieve NFT Data from TON'