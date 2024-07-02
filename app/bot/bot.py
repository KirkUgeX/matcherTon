import asyncio
import logging
import os
from aiogram import Bot, Dispatcher, types
from aiogram.filters.command import Command
from messages import welcome_message
from dotenv import load_dotenv


logging.basicConfig(level=logging.INFO)
load_dotenv()
token = os.getenv("BOT_TOKEN")
bot = Bot(token=token)

dp = Dispatcher()


@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer(welcome_message)


async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
