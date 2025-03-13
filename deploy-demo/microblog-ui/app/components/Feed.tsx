'use client'

import { useEffect, useState } from 'react'
import Post from './Post'
import { fetchPosts, createPost } from '@/lib/api'
import { Post as PostType } from '@/lib/types'

export default function Feed() {
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await fetchPosts()
        setPosts(fetchedPosts)
      } catch (err) {
        setError('Failed to load posts')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim()) return

    setIsSubmitting(true)
    try {
      const newPost = await createPost({ content: newPostContent })
      setPosts([newPost, ...posts])
      setNewPostContent('')
    } catch (err) {
      console.error(err)
      setError('Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newPostContent.trim() && !isSubmitting) {
        handleSubmit(e);
      }
    }
  };

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="w-full lg:w-1/2 overflow-hidden mb-4 lg:mb-0">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-4">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={isSubmitting}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newPostContent.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  )
}

