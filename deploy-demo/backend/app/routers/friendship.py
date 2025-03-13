from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List
from app.database import get_db
from app.models.friendship import Friendship
from app.models.user import User
from app.schemas.friendship import FriendshipStatus
from app.utils.user import get_user_id_from_username

router = APIRouter()


@router.get("", response_model=List[dict])
async def list_friendships(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    current_user_id = await get_user_id_from_username(db, request.state.username)
    
    # Get all friendships where the current user is either user_id or friend_id
    stmt = select(Friendship, User).join(
        User,
        or_(
            and_(
                Friendship.friend_id == User.id,
                Friendship.user_id == current_user_id
            ),
            and_(
                Friendship.user_id == User.id,
                Friendship.friend_id == current_user_id
            )
        )
    )
    
    result = await db.execute(stmt)
    friendships = result.all()
    
    friendship_list = []
    for friendship, user in friendships:
        # Determine if the current user is the sender or receiver
        is_sender = friendship.user_id == current_user_id
        
        friendship_data = {
            "user_id": user.id,
            "username": user.username,
            "status": friendship.status,
            "is_sender": is_sender,
            "friend_count": user.friend_count
        }
        
        friendship_list.append(friendship_data)
    
    return friendship_list

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_friend_request(
    friend_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    current_user_id = await get_user_id_from_username(db, request.state.username)
    
    # Check if friendship exists
    stmt = select(Friendship).where(
        or_(
            and_(Friendship.user_id == current_user_id, Friendship.friend_id == friend_id),
            and_(Friendship.user_id == friend_id, Friendship.friend_id == current_user_id)
        )
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="Friendship already exists")

    friendship = Friendship(user_id=current_user_id, friend_id=friend_id)
    db.add(friendship)
    await db.commit()
    return {"status": "pending"}

@router.post("/{user_id}/accept")
async def accept_friend_request(
    user_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    current_user_id = await get_user_id_from_username(db, request.state.username)
    stmt = select(Friendship).where(
        and_(
            Friendship.user_id == user_id,
            Friendship.friend_id == current_user_id,
            Friendship.status == "pending"
        )
    )
    result = await db.execute(stmt)
    friendship = result.scalar_one_or_none()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    friendship.status = "accepted"
    await db.commit()
    return {"status": "accepted"}

@router.post("/{user_id}/reject")
async def reject_friend_request(
    user_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    current_user_id = await get_user_id_from_username(db, request.state.username)
    stmt = select(Friendship).where(
        and_(
            Friendship.user_id == user_id,
            Friendship.friend_id == current_user_id,
            Friendship.status == "pending"
        )
    )
    result = await db.execute(stmt)
    friendship = result.scalar_one_or_none()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    await db.delete(friendship)
    await db.commit()
    return {"status": "rejected"}

@router.delete("/{user_id}")
async def cancel_friend_request(
    user_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    current_user_id = await get_user_id_from_username(db, request.state.username)
    stmt = select(Friendship).where(
        and_(
            Friendship.user_id == current_user_id,
            Friendship.friend_id == user_id,
            Friendship.status == "pending"
        )
    )
    result = await db.execute(stmt)
    friendship = result.scalar_one_or_none()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    await db.delete(friendship)
    await db.commit()
    return {"status": "cancelled"}

@router.get("/{user_id}/status", response_model=FriendshipStatus)
async def get_friendship_status(
    user_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    current_user_id = await get_user_id_from_username(db, request.state.username)
    stmt = select(Friendship).where(
        or_(
            and_(Friendship.user_id == current_user_id, Friendship.friend_id == user_id),
            and_(Friendship.user_id == user_id, Friendship.friend_id == current_user_id)
        )
    )
    result = await db.execute(stmt)
    friendship = result.scalar_one_or_none()

    if not friendship:
        return {"status": "none"}
    
    if friendship.status == "accepted":
        return {"status": "friends"}
    
    if friendship.status == "pending":
        if friendship.user_id == current_user_id:
            return {"status": "pending_sent"}
        else:
            return {"status": "pending_received"}
    
    return {"status": "none"}
