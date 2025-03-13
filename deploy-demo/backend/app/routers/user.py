from typing import List
from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User
from app.models.post import Post
from app.schemas.post import PostResponse
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.database import get_db
import hashlib
from app.models.friendship import Friendship
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from app.utils.user import get_user_id_from_username

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    logger.debug("get_current_user called")
    username = request.state.username
    logger.debug(f"username from state: {username}")
    
    try:
        user_id = await get_user_id_from_username(db, username)
        
        # Only select the fields we need
        stmt = select(
            User.id,
            User.username,
            User.email,
            User.fullname
        ).where(User.username == username)
        logger.debug(f"Executing query: {stmt}")
        result = await db.execute(stmt)
        user = result.first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Convert tuple to dict
        user_dict = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "fullname": user.fullname,
            "followers": [],  # We'll add these later
            "following": [],
            "friend_count": 0
        }

        return UserResponse(**user_dict)

    except Exception as e:
        logger.error(f"Error in get_current_user: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = User(**user.dict())
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=UserResponse)
async def read_user(user_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int, 
    user: UserUpdate, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    current_user_id = await get_user_id_from_username(db, request.state.username)
    # Check if user is updating their own profile
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Can only update your own profile")
        
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    db_user = result.scalar_one_or_none()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    for key, value in user.dict(exclude_unset=True).items():
        setattr(db_user, key, value)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", response_model=UserResponse)
async def delete_user(
    user_id: int, 
    request: Request,
    db: Session = Depends(get_db)
):
    current_user_id = await get_user_id_from_username(db, request.state.username)
    # Check if user is deleting their own account
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Can only delete your own account")
        
    db_user = await db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(db_user)
    await db.commit()
    return db_user

# @router.get("/{user_id}/avatar.png")
# async def get_user_avatar(user_id: int, db: AsyncSession = Depends(get_db)):
#     stmt = select(User).where(User.id == user_id)
#     result = await db.execute(stmt)
#     user = result.scalar_one_or_none()
#     if user is None:
#         raise HTTPException(status_code=404, detail="User not found")
    
#     email_hash = hashlib.sha256(user.email.lower().encode('utf-8')).hexdigest()
#     gravatar_url = f"https://www.gravatar.com/avatar/{email_hash}?d=retro&s=128"
#     return RedirectResponse(url=gravatar_url)

@router.get("/{user_id}/posts", response_model=List[PostResponse])
async def get_user_posts(user_id: int, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get posts
    stmt = select(Post).where(Post.user_id == user_id)
    result = await db.execute(stmt)
    posts = result.scalars().all()
    return posts

@router.get("/search")
async def search_users(
    query: str,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(
        or_(
            User.username.ilike(f"%{query}%"),
            User.fullname.ilike(f"%{query}%")
        )
    ).offset(skip).limit(limit)
    result = await db.execute(stmt)
    users = result.scalars().all()
    return users

@router.get("/{user_id}/followers")
async def get_user_followers(
    user_id: int, 
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Get users who follow the specified user"""
    # Check if user exists
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get followers through friendships table
    stmt = select(User)\
        .join(Friendship, Friendship.user_id == User.id)\
        .where(Friendship.friend_id == user_id)\
        .where(Friendship.status == "accepted")\
        .offset(skip)\
        .limit(limit)
    result = await db.execute(stmt)
    followers = result.scalars().all()
    
    return followers

@router.get("/{user_id}/following")
async def get_user_following(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Get users that this user follows"""
    # Check if user exists
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get following through friendships table
    stmt = select(User)\
        .join(Friendship, Friendship.friend_id == User.id)\
        .where(Friendship.user_id == user_id)\
        .where(Friendship.status == "accepted")\
        .offset(skip)\
        .limit(limit)
    result = await db.execute(stmt)
    following = result.scalars().all()
    
    return following

@router.get("/me/debug")
async def debug_current_user(request: Request):
    """Debug endpoint to check what's in the request state"""
    return {
        "user_id": getattr(request.state, "user_id", None),
        "username": getattr(request.state, "username", None),
        "token_available": hasattr(request.state, "username"),
        "headers": {
            k: v for k, v in request.headers.items() 
            if k.lower() in ["authorization", "content-type"]
        },
        "method": request.method,
        "url": str(request.url)
    }

@router.get("/me/test")
async def test_me():
    return {"message": "test endpoint reached"}