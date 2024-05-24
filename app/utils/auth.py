from web3.auto import w3
from eth_account.messages import encode_defunct

def verify_signature(address, signature, message):
    message_hashed = encode_defunct(text=message)
    try:
        if w3.eth.account.recover_message(message_hashed, signature=signature).upper() == address.upper():
            return True
    except Exception as e:
        print(f'An error occurred: {e}')
    return False

def check_matcher_nft_wallet(address):
    return True
