from typing import List
from app.schemas.comment import CommentResponse
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.post import Post as PostModel
from app.models.comment import Comment
from app.schemas.post import PostCreate, PostUpdate, PostResponse
from app.database import get_db
from app.models.like import Like
from app.models.friendship import Friendship
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.utils.user import get_user_id_from_username

router = APIRouter()

@router.post("/", response_model=PostResponse)
async def create_post(
    post: PostCreate, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = await get_user_id_from_username(db, request.state.username)
    db_post = PostModel(**post.dict(), author_id=user_id)
    db.add(db_post)
    await db.commit()
    await db.refresh(db_post)
    return db_post

@router.get("/feed")
async def get_feed(
    request: Request,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 20
):
    user_id = await get_user_id_from_username(db, request.state.username)
    
    # Get following IDs
    stmt = select(Friendship.friend_id).where(
        (Friendship.user_id == user_id) & 
        (Friendship.status == "accepted")
    )
    result = await db.execute(stmt)
    following_ids = [r[0] for r in result.all()]
    following_ids.append(user_id)
    
    # Get feed posts
    stmt = select(PostModel)\
        .where(PostModel.author_id.in_(following_ids))\
        .order_by(desc(PostModel.timestamp))\
        .offset(skip)\
        .limit(limit)
    result = await db.execute(stmt)
    posts = result.scalars().all()
    
    # Load comments and likes for each post
    for post in posts:
        await db.refresh(post, ['comments', 'likes'])
    
    return posts

@router.get("/{post_id}", response_model=PostResponse)
async def read_post(post_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(PostModel).where(PostModel.id == post_id)
    result = await db.execute(stmt)
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int, 
    post: PostUpdate, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = await get_user_id_from_username(db, request.state.username)
    stmt = select(PostModel).where(PostModel.id == post_id)
    result = await db.execute(stmt)
    db_post = result.scalar_one_or_none()
    
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
        
    # Check if user owns the post
    if db_post.author_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    for key, value in post.dict().items():
        setattr(db_post, key, value)
    await db.commit()
    await db.refresh(db_post)
    return db_post

@router.delete("/{post_id}", response_model=dict)
async def delete_post(
    post_id: int, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = await get_user_id_from_username(db, request.state.username)
    stmt = select(PostModel).where(PostModel.id == post_id)
    result = await db.execute(stmt)
    db_post = result.scalar_one_or_none()
    
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
        
    # Check if user owns the post
    if db_post.author_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        
    await db.delete(db_post)
    await db.commit()
    return {"detail": "Post deleted"}

@router.get("/{post_id}/comments", response_model=List[CommentResponse])
async def get_post_comments(post_id: int, db: Session = Depends(get_db)):
    post = await db.query(PostModel).filter(PostModel.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comments = await db.query(Comment).filter(Comment.post_id == post_id).all()
    return comments


@router.post("/{post_id}/like")
async def like_post(
    post_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Like/unlike a post"""
    user_id = await get_user_id_from_username(db, request.state.username)
    
    # Check if post exists
    stmt = select(PostModel).where(PostModel.id == post_id)
    result = await db.execute(stmt)
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if like already exists
    stmt = select(Like)\
        .where(Like.user_id == user_id)\
        .where(Like.post_id == post_id)
    result = await db.execute(stmt)
    existing_like = result.scalar_one_or_none()
    
    if existing_like:
        # Unlike if already liked
        await db.delete(existing_like)
        await db.commit()
        return {"detail": "Post unliked"}
    else:
        # Create new like
        new_like = Like(user_id=user_id, post_id=post_id)
        db.add(new_like)
        await db.commit()
        return {"detail": "Post liked"}