from aiogram import Bot, Dispatcher
import os
from dotenv import load_dotenv
import keyboard as kb

load_dotenv()
token = os.getenv("BOT_TOKEN")
bot = Bot(token=token)

dp = Dispatcher()


async def send_notice(user_id: int, message: str, language: str):
    try:
        if language == "ru":
            await bot.send_message(chat_id=user_id, text=message, reply_markup=kb.main_ru)
        if language == "uk":
            await bot.send_message(chat_id=user_id, text=message, reply_markup=kb.main_ua)
        else:
            await bot.send_message(chat_id=user_id, text=message, reply_markup=kb.main_en)

    finally:
        await bot.session.close()


if __name__ == "__main__":
    dp.start_polling(bot)
