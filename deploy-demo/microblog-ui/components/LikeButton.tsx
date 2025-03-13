"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';
import { likePost } from '@/lib/api';

interface LikeButtonProps {
  postId: number;
  initialLikeCount: number;
  initialIsLiked: boolean;
}

export function LikeButton({ postId, initialLikeCount, initialIsLiked }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const handleLike = async () => {
    try {
      await likePost(postId);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLike}
      className="flex items-center gap-1"
    >
      {isLiked ? (
        <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
      ) : (
        <Heart className="w-4 h-4" />
      )}
      <span>{likeCount}</span>
    </Button>
  );
} 