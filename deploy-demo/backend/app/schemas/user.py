from pydantic import BaseModel, Field
from typing import List, Optional

class UserBase(BaseModel):
    username: str
    fullname: str
    email: str

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: int
    followers: List[int] = []
    following: List[int] = []

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    fullname: str
    email: str
    followers: List[int] = Field(default_factory=list)
    following: List[int] = Field(default_factory=list)
    friend_count: int = Field(default=0)

    class Config:
        from_attributes = True