from sqlalchemy import Column, Integer, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    friend_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # status can be 'pending', 'accepted', 'rejected'
    status = Column(String, default="pending")  

    user = relationship("User", foreign_keys=[user_id], back_populates="sent_friendships")
    friend = relationship("User", foreign_keys=[friend_id], back_populates="received_friendships")

    # Ensure no duplicate friendships
    __table_args__ = (
        UniqueConstraint('user_id', 'friend_id', name='unique_friendship'),
    )