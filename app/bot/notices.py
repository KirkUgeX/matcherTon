from aiogram import Bot, Dispatcher
import os
from dotenv import load_dotenv
from app.bot import keyboard as kb
from app.bot import messages as msg
from app.utils import uf

load_dotenv()
token = os.getenv("BOT_TOKEN")
bot = Bot(token=token)

dp = Dispatcher()

ru = {"new_msg": msg.new_message_ru, "new_match": msg.new_match_ru, "profile_like": msg.profile_like_ru}
uk = {"new_msg": msg.new_message_uk, "new_match": msg.new_match_uk, "profile_like": msg.profile_like_uk}
en = {"new_msg": msg.new_message, "new_match": msg.new_match, "profile_like": msg.profile_like}


async def send_notice(user_id: int, message_type: str, nickname: str or None):
    try:
        language = await uf.get_user_lang(user_id)
        if language == '' or language is None:
            language = "en"
    except Exception as e:
        print("Error getting user lang from db:", e)
        return f"Error getting user lang from db: {e}"

    if type(nickname) is str:
        try:
            if language == "ru":
                await bot.send_message(chat_id=user_id, text=ru[f"{message_type}"].replace("{username}", nickname), reply_markup=kb.main_ru)
            elif language == "uk":
                await bot.send_message(chat_id=user_id, text=uk[f"{message_type}"].replace("{username}", nickname), reply_markup=kb.main_ua)
            elif language == "en":
                await bot.send_message(chat_id=user_id, text=en[f"{message_type}"].replace("{username}", nickname), reply_markup=kb.main_en)
        finally:
            await bot.session.close()

    else:
        try:
            if language == "ru":
                await bot.send_message(chat_id=user_id, text=ru[f"{message_type}"], reply_markup=kb.main_ru)
            elif language == "uk":
                await bot.send_message(chat_id=user_id, text=uk[f"{message_type}"], reply_markup=kb.main_ua)
            else:
                await bot.send_message(chat_id=user_id, text=en[f"{message_type}"], reply_markup=kb.main_en)

        finally:
            await bot.session.close()


if __name__ == "__main__":
    dp.start_polling(bot)
