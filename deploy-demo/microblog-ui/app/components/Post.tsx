'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react"
import Link from "next/link"
import { Post as PostType } from "@/lib/types"
import { getUserAvatar } from "@/lib/api"
import UserAvatar from "@/app/components/UserAvatar"
import { LikeButton } from '@/components/LikeButton'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/lib/auth'
import { useState } from 'react'
import { createComment } from '@/lib/api'

interface PostProps {
  post: PostType
}

export default function Post({ post }: PostProps) {
  const { user: currentUser } = useAuth();
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comments, setComments] = useState(post.comments)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const comment = await createComment(post.id, { content: newComment })
      setComments([...comments, comment])
      setNewComment('')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (newComment.trim() && !isSubmitting) {
        handleSubmitComment(e)
      }
    }
  }

  return (
    <Card className="mb-4 last:mb-0 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <UserAvatar user={post.author} />
          <div>
            {post.author && (
              <Link href={`/${post.author.username}`} className="font-semibold hover:underline">
                {post.author.fullname || post.author.username}
              </Link>
            )}
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
        <LikeButton 
          postId={post.id} 
          initialLikeCount={post.likeCount} 
          initialIsLiked={post.likes.some((like) => like.user_id === currentUser?.id)} 
        />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-lg">{post.content}</p>
      </CardContent>
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-bold">Comments</h4>
          <div className="flex items-center text-gray-500">
            <MessageCircle className="h-4 w-4 mr-1" />
            <span>{post.comments.length}</span>
          </div>
        </div>
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-2 mb-2">
            <UserAvatar 
              user={comment.author} 
              className="w-8 h-8" 
            />
            <div>
              <p className="font-semibold">{comment.author?.fullname || comment.author?.username}</p>
              <p>{comment.content}</p>
            </div>
          </div>
        ))}
        <form onSubmit={handleSubmitComment} className="flex items-center mt-4">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            className="flex-grow mr-2"
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </form>
      </div>
    </Card>
  )
}

