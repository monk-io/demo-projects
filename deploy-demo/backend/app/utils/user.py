from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User

async def get_user_id_from_username(db: AsyncSession, username: str) -> int:
    """Helper function to get user_id from username"""
    stmt = select(User.id).where(User.username == username)
    result = await db.execute(stmt)
    user_id = result.scalar_one_or_none()
    if user_id is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user_id 