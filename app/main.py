from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.limiter import limiter
from app.api.endpoints import auth, user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "185.196.117.65:51820",
        "http://127.0.0.1:517",
        "http://localhost:517",
        "http://localhost:5173",
        "https://matcher.cc",
        "http://matcher.cc",
        "https://ton.matcher.fun",
        "https://info.matcher.fun",
        "http://info.matcher.fun",
        "https://5ea4-185-196-117-65.ngrok-free.app",
        "http://5ea4-185-196-117-65.ngrok-free.app",
        "https://e776-185-196-117-65.ngrok-free.app",
        "http://e776-185-196-117-65.ngrok-free.app",
        "https://13bc-185-196-117-65.ngrok-free.app",
        "https://5958-185-196-117-65.ngrok-free.app",
        "https://cc4c-46-62-75-195.ngrok-free.app",
        "https://6bb8-185-196-117-65.ngrok-free.app",
        "https://e1cb-185-196-117-65.ngrok-free.app",
        "https://6143-37-188-20-249.ngrok-free.app",
        "https://d8ab-37-188-20-249.ngrok-free.app",
        "https://7f74-37-188-20-249.ngrok-free.app",
        "https://eba2-37-188-20-249.ngrok-free.app",
        "https://5431-37-188-20-249.ngrok-free.app",
        "https://7c04-37-188-20-249.ngrok-free.app",
        "https://3c52-185-196-117-65.ngrok-free.app",
        "https://85ee-37-188-20-249.ngrok-free.app",
        "https://eca8-37-188-20-249.ngrok-free.app",
        "https://d8da-46-62-75-195.ngrok-free.app",
        "https://01dc-37-188-20-249.ngrok-free.app",
        "https://0785-37-188-20-249.ngrok-free.app",
        "https://b8ba-185-196-117-65.ngrok-free.app",
        "https://b0fc-46-62-75-195.ngrok-free.app",
        "https://9c14-37-188-20-249.ngrok-free.app",
        "https://36d9-37-188-20-249.ngrok-free.app",
        "https://e924-37-188-20-249.ngrok-free.app",
        "https://f58e-37-188-20-249.ngrok-free.app",
        "https://5722-46-62-75-195.ngrok-free.app",
        "https://7f31-37-188-20-249.ngrok-free.app",
        "https://6113-185-196-117-65.ngrok-free.app",
        "https://b3ba-185-196-117-65.ngrok-free.app",
        "https://ff9b-185-196-117-65.ngrok-free.app",
        "https://34a4-185-196-117-65.ngrok-free.app",
        "https://6716-185-196-117-65.ngrok-free.app",
        "https://85f9-37-188-20-249.ngrok-free.app",
        "https://0e8c-37-188-20-249.ngrok-free.app",
        "https://7161-46-62-75-195.ngrok-free.app",
        "https://0592-46-62-75-195.ngrok-free.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.state.limiter = limiter

app.include_router(auth.router)
app.include_router(user.router)
