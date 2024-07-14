from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

web_app = WebAppInfo(url="https://ton.matcher.fun")

settings = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="🇺🇸EN", callback_data="en"),
     InlineKeyboardButton(text="🇷🇺RU", callback_data="ru"),
     InlineKeyboardButton(text="🇺🇦UA", callback_data="ua")]
])

back_not_reg_ru = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Назад", callback_data="back_not_reg")]
])

back_not_reg_en = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Back", callback_data="back_not_reg")]
])

back_not_reg_uk = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Відступіть", callback_data="back_not_reg")]
])

back_ru = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Назад", callback_data="back_from_ref")]
])

back_en = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Back", callback_data="back_from_ref")]
])

back_uk = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Відступіть", callback_data="back_from_ref")]
])

referal_inline_kb_en = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Referral link", callback_data="Referral_link")],
    [InlineKeyboardButton(text="Back", callback_data="back")]
])

referal_inline_kb_ru = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Реферальная ссылка", callback_data="Referral_link")],
    [InlineKeyboardButton(text="Назад", callback_data="back")]
])

referal_inline_kb_uk = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Реферальне посилання", callback_data="Referral_link")],
    [InlineKeyboardButton(text="Відступіть", callback_data="back")]
])


main_en = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Join community", url="https://t.me/Matcher_Ton")],
    [InlineKeyboardButton(text="Launch Matcher", web_app=web_app)],
    [InlineKeyboardButton(text="Get bonus", callback_data="get_bonus")]
])

main_ru = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Присоедениться к комьюнити", url="https://t.me/Matcher_Ton")],
    [InlineKeyboardButton(text="Начать нетворкинг!", web_app=web_app)],
    [InlineKeyboardButton(text="Получить бонус", callback_data="get_bonus")]
])

main_ua = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Приєднатися до спільноти", url="https://t.me/Matcher_Ton")],
    [InlineKeyboardButton(text="Розпочати нетворкінг!", web_app=web_app)]
])
