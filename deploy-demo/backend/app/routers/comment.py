from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentResponse
from app.database import get_db
from app.utils.user import get_user_id_from_username

router = APIRouter()

@router.post("/", response_model=CommentResponse)
async def create_comment(
    comment: CommentCreate, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = await get_user_id_from_username(db, request.state.username)
    db_comment = Comment(**comment.dict(), user_id=user_id)
    db.add(db_comment)
    await db.commit()
    await db.refresh(db_comment)
    return db_comment

@router.get("/{comment_id}", response_model=CommentResponse)
async def read_comment(comment_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Comment).where(Comment.id == comment_id)
    result = await db.execute(stmt)
    comment = result.scalar_one_or_none()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment

@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int, 
    comment: CommentCreate, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = await get_user_id_from_username(db, request.state.username)
    db_comment = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = db_comment.scalar_one_or_none()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")

    for key, value in comment.dict().items():
        setattr(comment, key, value)
    await db.commit()
    await db.refresh(comment)
    return comment

@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = await get_user_id_from_username(db, request.state.username)
    db_comment = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = db_comment.scalar_one_or_none()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    await db.delete(comment)
    await db.commit()
    return {"detail": "Comment deleted successfully"}

