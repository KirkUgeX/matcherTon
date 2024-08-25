import asyncio
import logging
import os
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters.command import Command
from app.bot import messages as msp
from app.bot import keyboard as kb
from dotenv import load_dotenv
from app.utils import uf

logging.basicConfig(level=logging.INFO)
load_dotenv()
token = os.getenv("BOT_TOKEN")
bot_nickname = os.getenv("BOT_NICKNAME")
bot = Bot(token=token)

dp = Dispatcher()


@dp.message(Command("start"))
@dp.callback_query(F.data == "back_not_reg")
async def cmd_random(message: types.Message):
    user_id = message.from_user.id
    user_lang = message.from_user.language_code

    start_comand = message.text
    referrer_id = str(start_comand[7:])

    if referrer_id == '':
        referrer_id = None
    else:
        referrer_id = int(referrer_id)

    if user_lang == "ru":
        add_user = await uf.add_tg_user(referrer_id=referrer_id, tg_id=user_id, language="ru")
        await message.answer(text=msp.welcome_message_ru, reply_markup=kb.main_ru)
        if (referrer_id is not None) and (referrer_id != user_id) and (add_user == True):
            await bot.send_message(chat_id=referrer_id, text=msp.ref_message_ru)
            referrer_key = await uf.get_id_by_tgid(referrer_id)
            await uf.increase_num_points(referrer_key, 500)

    elif user_lang == "uk":
        add_user = await uf.add_tg_user(referrer_id=referrer_id, tg_id=user_id, language="uk")
        await message.answer(text=msp.welcome_message_ua, reply_markup=kb.main_ua)
        if (referrer_id is not None) and (referrer_id != user_id) and (add_user == True):
            await bot.send_message(chat_id=referrer_id, text=msp.ref_message_uk)
            referrer_key = await uf.get_id_by_tgid(referrer_id)
            await uf.increase_num_points(referrer_key, 500)

    else:
        add_user = await uf.add_tg_user(referrer_id=referrer_id, tg_id=user_id, language="en")
        await message.answer(text=msp.welcome_message, reply_markup=kb.main_en)
        if (referrer_id is not None) and (referrer_id != user_id) and (add_user == True):
            await bot.send_message(chat_id=referrer_id, text=msp.ref_message_en)
            referrer_key = await uf.get_id_by_tgid(referrer_id)
            await uf.increase_num_points(referrer_key, 500)


@dp.callback_query(F.data == "back_from_ref")
@dp.callback_query(F.data == "get_bonus")
async def ref_menu(callback: types.CallbackQuery):
    user_lang = callback.from_user.language_code
    user_id = callback.from_user.id
    user_registred = await uf.tg_id_cheker(user_id)

    if user_registred:

        if user_lang == "ru":
            await callback.message.edit_text(text=msp.ref_screen_ru,
                                             reply_markup=kb.referal_inline_kb_ru)
        elif user_lang == "uk":
            await callback.message.edit_text(text=msp.ref_screen_uk,
                                             reply_markup=kb.referal_inline_kb_ru)
        else:
            await callback.message.edit_text(text=msp.ref_screen_en,
                                             reply_markup=kb.referal_inline_kb_en)

    else:
        if user_lang == "ru":
            await callback.message.edit_text(text=msp.not_reg_ru,
                                             reply_markup=kb.back_not_reg_ru)
        elif user_lang == "uk":
            await callback.message.edit_text(text=msp.not_reg_uk,
                                             reply_markup=kb.back_not_reg_uk)
        else:
            await callback.message.edit_text(text=msp.not_reg_en,
                                             reply_markup=kb.back_not_reg_en)


@dp.callback_query(F.data == "back")
async def back(callback: types.CallbackQuery):
    user_lang = callback.from_user.language_code
    if user_lang == "ru":
        await callback.message.edit_text(text=msp.welcome_message_ru, reply_markup=kb.main_ru)
    elif user_lang == "uk":
        await callback.message.edit_text(text=msp.welcome_message_ua, reply_markup=kb.main_ua)
    else:
        await callback.message.edit_text(text=msp.welcome_message, reply_markup=kb.main_en)


@dp.callback_query(F.data == "Referral_link")
async def gen_referral_link(callback: types.CallbackQuery):
    user_lang = callback.from_user.language_code
    if user_lang == "ru":
        await callback.message.edit_text(
            text=msp.ref_link_ru.replace("{url}", f"https://t.me/{bot_nickname}?start={callback.from_user.id}"),
            reply_markup=kb.back_ru
        )
    elif user_lang == "uk":
        await callback.message.edit_text(
            text=msp.ref_link_uk.replace("{url}", f"https://t.me/{bot_nickname}?start={callback.from_user.id}"),
            reply_markup=kb.back_uk
        )
    else:
        await callback.message.edit_text(
            text=msp.ref_link_en.replace("{url}", f"https://t.me/{bot_nickname}?start={callback.from_user.id}"),
            reply_markup=kb.back_en
        )


async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
