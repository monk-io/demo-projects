from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship, column_property
from sqlalchemy import select, func
from datetime import datetime
from app.database import Base
from app.models.like import Like

class Post(Base):
    __tablename__ = 'posts'

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", lazy="selectin")
    likes = relationship("Like", back_populates="post", lazy="selectin")
    
    like_count = column_property(
        select(func.count(Like.id))
        .where(Like.post_id == id)
        .scalar_subquery()
    )