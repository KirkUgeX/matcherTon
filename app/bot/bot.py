import asyncio
import logging
import os
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters.command import Command
import messages as msp
import keyboard as kb
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
load_dotenv()
token = os.getenv("BOT_TOKEN")
bot = Bot(token=token)

dp = Dispatcher()


@dp.message(Command("start"))
async def cmd_random(message: types.Message):
    await message.answer(text=msp.choose_language, reply_markup=kb.settings)


@dp.callback_query(F.data == "en")
async def menu_en(callback: types.CallbackQuery):
    await callback.message.edit_text(text=msp.welcome_message, reply_markup=kb.main_en)


@dp.callback_query(F.data == "ru")
async def menu_ru(callback: types.CallbackQuery):
    await callback.message.edit_text(text=msp.welcome_message_ru, reply_markup=kb.main_ru)


@dp.callback_query(F.data == "ua")
async def menu_ua(callback: types.CallbackQuery):
    await callback.message.edit_text(text=msp.welcome_message_ua, reply_markup=kb.main_ua)


async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
