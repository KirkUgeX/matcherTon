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
        "http://matcher.cc"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.state.limiter = limiter

app.include_router(auth.router)
app.include_router(user.router)
