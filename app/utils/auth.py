from web3.auto import w3
from eth_account.messages import encode_defunct
import httpx
import json


def verify_signature(address, signature, message):
    message_hashed = encode_defunct(text=message)
    try:
        if w3.eth.account.recover_message(message_hashed, signature=signature).upper() == address.upper():
            return True
    except Exception as e:
        print(f'An error occurred: {e}')
    return False


async def check_proof(test):
    url = 'http://localhost:2000/checkProof'
    print(test)

    combined_json = {
        "wal_address": test[1].address,
        "proof_payload": {
            "address": test[1].address,
            "public_key": test[1].publicKey,
            "network": test[1].chain,
            "proof": {
                "state_init": test[1].walletStateInit,
                "domain": test[0].domain,
                "timestamp": test[0].timestamp,

                "signature": test[0].signature,
                "payload": test[0].payload,

            },

        }
    }
    payload = json.dumps([t.dict() for t in test])

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=combined_json)
        response.raise_for_status()
        result = response.json()
        return result


def check_matcher_nft_wallet(address):
    return True


async def generate_payload():
    url = 'http://localhost:2000/generatePayload'

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()  # Проверка на ошибки
        data = response.json()
        print('Generated Payload:', data)
        return data
