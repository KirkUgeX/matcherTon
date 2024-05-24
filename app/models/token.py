from pydantic import BaseModel
from typing import Optional

class TokenData(BaseModel):
    address: Optional[str] = None
    user_id: Optional[int] = None
    uuid: Optional[int] = None
