from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PostBase(BaseModel):
    content: str

class PostCreate(PostBase):
    pass

class PostUpdate(PostBase):
    pass

class Post(PostBase):
    id: int
    author_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class PostResponse(PostBase):
    id: int
    author_id: int
    timestamp: datetime
    like_count: int = 0

    class Config:
        from_attributes = True