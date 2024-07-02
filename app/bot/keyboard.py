from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

web_app = WebAppInfo(url="https://ton.matcher.fun")

settings = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="🇺🇸EN", callback_data="en"),
     InlineKeyboardButton(text="🇷🇺RU", callback_data="ru"),
     InlineKeyboardButton(text="🇺🇦UA", callback_data="ua")]
])


main_en = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Join community", url="https://t.me/Matcher_Ton")],
    [InlineKeyboardButton(text="Launch Matcher", web_app=web_app)]
])

main_ru = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Присоедениться к комьюнити", url="https://t.me/Matcher_Ton")],
    [InlineKeyboardButton(text="Начать нетворкинг!", web_app=web_app)]
])

main_ua = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Приєднатися до спільноти", url="https://t.me/Matcher_Ton")],
    [InlineKeyboardButton(text="Розпочати нетворкінг!", web_app=web_app)]
])
