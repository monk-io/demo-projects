from pydantic import BaseModel
from typing import Optional
from enum import Enum

class FriendshipBase(BaseModel):
    friend_id: int

class FriendshipCreate(FriendshipBase):
    pass

class FriendshipUpdate(FriendshipBase):
    status: str  # e.g., "pending", "accepted", "blocked"
    pass

class Friendship(FriendshipBase):
    id: int
    user_id: int
    status: str  # e.g., "pending", "accepted", "blocked"

    class Config:
        from_attributes = True

class FriendshipResponse(FriendshipBase):
    id: int
    user_id: int
    status: str  # e.g., "pending", "accepted", "blocked"

    class Config:
        from_attributes = True

class FriendshipStatusEnum(str, Enum):
    none = "none"
    pending_sent = "pending_sent"
    pending_received = "pending_received"
    friends = "friends"

class FriendshipStatus(BaseModel):
    status: FriendshipStatusEnum