from bot import bot, dp


async def send_notice(user_id: int, message: str):
    try:
        await bot.send_message(chat_id=user_id, text=message)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    dp.start_polling(bot)
