from pydantic import BaseModel
from datetime import datetime

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentUpdate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    author_id: int
    post_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class CommentResponse(CommentBase):
    id: int
    author_id: int
    post_id: int
    timestamp: datetime

    class Config:
        from_attributes = True