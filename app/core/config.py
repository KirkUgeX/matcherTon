from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os
#pip install pydantic-settings
load_dotenv()
class Settings(BaseSettings):
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    API_KEY: str = os.getenv("API_KEY")
    API_KEY_NAME: str = "AccessToken"
    TOKEN_URL: str = "/token"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    TON_SCORE_URL: str = os.getenv("TON_SCORE_URL")

settings = Settings()
