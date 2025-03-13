"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { UserPlus, Check, Loader2, X, Clock } from 'lucide-react';
import { 
  sendFriendRequest, 
  checkFriendshipStatus, 
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  type FriendshipStatus
} from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface FriendButtonProps {
  userId: number;
}

export function FriendButton({ userId }: FriendButtonProps) {
  const [status, setStatus] = useState<FriendshipStatus['status']>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchFriendshipStatus = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { status } = await checkFriendshipStatus(userId);
        setStatus(status);
      } catch (error) {
        console.error('Failed to check friendship status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendshipStatus();
  }, [userId, currentUser]);

  // Don't show button if viewing own profile or not logged in
  if (!currentUser || currentUser.id === userId) {
    return null;
  }

  if (isLoading) {
    return (
      <Button disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  const handleAction = async (action: 'send' | 'cancel' | 'accept' | 'reject') => {
    if (isPending) return;
    
    setIsPending(true);
    try {
      switch (action) {
        case 'send':
          await sendFriendRequest(userId);
          setStatus('pending_sent');
          break;
        case 'cancel':
          await cancelFriendRequest(userId);
          setStatus('none');
          break;
        case 'accept':
          await acceptFriendRequest(userId);
          setStatus('friends');
          break;
        case 'reject':
          await rejectFriendRequest(userId);
          setStatus('none');
          break;
      }
    } catch (error) {
      console.error('Failed to handle friend request:', error);
    } finally {
      setIsPending(false);
    }
  };

  if (status === 'friends') {
    return (
      <Button variant="secondary" disabled>
        <Check className="w-4 h-4 mr-2" />
        Friends
      </Button>
    );
  }

  if (status === 'pending_sent') {
    return (
      <div className="flex gap-2">
        <Button variant="secondary" disabled>
          <Clock className="w-4 h-4 mr-2" />
          Invite Sent
        </Button>
        <Button 
          variant="destructive" 
          onClick={() => handleAction('cancel')}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel'}
        </Button>
      </div>
    );
  }

  if (status === 'pending_received') {
    return (
      <div className="flex gap-2">
        <Button 
          variant="default"
          onClick={() => handleAction('accept')}
          disabled={isPending}
        >
          <Check className="w-4 h-4 mr-2" />
          Accept
        </Button>
        <Button 
          variant="destructive"
          onClick={() => handleAction('reject')}
          disabled={isPending}
        >
          <X className="w-4 h-4 mr-2" />
          Reject
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={() => handleAction('send')} 
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      Add Friend
    </Button>
  );
} 