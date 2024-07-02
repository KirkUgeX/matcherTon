from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

web_app = WebAppInfo(url="https://ton.matcher.fun")


settings = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Join community", url="https://t.me/Matcher_Ton")],
    [InlineKeyboardButton(text="Launch Matcher", web_app=web_app)]
])
