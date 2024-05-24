from fastapi import Request
from fastapi.responses import PlainTextResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, default_limits=["10/minute"])

def _rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return PlainTextResponse(str(exc.detail), status_code=exc.status_code)
