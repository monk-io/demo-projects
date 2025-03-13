# Contents of /my-backend-project/my-backend-project/app/models/__init__.py

# This file is intentionally left blank.

from app.models.friendship import Friendship
from app.models.like import Like
from app.models.post import Post
from app.models.comment import Comment
from app.models.user import User

# This ensures all models are registered
__all__ = ["User", "Post", "Comment", "Like", "Friendship"]