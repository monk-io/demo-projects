from sqlalchemy import Column, Integer, String, select, func, text
from sqlalchemy.orm import relationship, column_property
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    fullname = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    
    # Define relationships with string references
    posts = relationship("Post", back_populates="author")
    likes = relationship("Like", back_populates="user")
    comments = relationship("Comment", back_populates="author")
    
    friend_count = column_property(
        select(func.count())
        .select_from(text("friendships"))
        .where(text("friendships.user_id = users.id"))
        .where(text("friendships.status = 'accepted'"))
        .scalar_subquery()
    )

    sent_friendships = relationship(
        "Friendship",
        primaryjoin="User.id == Friendship.user_id",
        back_populates="user"
    )
    received_friendships = relationship(
        "Friendship",
        primaryjoin="User.id == Friendship.friend_id",
        back_populates="friend"
    )