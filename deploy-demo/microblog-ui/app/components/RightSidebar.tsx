'use client'

import { useState, useEffect } from "react"
import UserAvatar from "@/app/components/UserAvatar"
import { FriendButton } from "@/components/FriendButton"
import { getFriendships, type Friendship } from "@/lib/api"
import { useAuth } from "@/lib/auth"

export default function RightSidebar() {
  const { user } = useAuth()
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFriendships = async () => {
      if (user) {
        try {
          const data = await getFriendships()
          setFriendships(data)
        } catch (error) {
          console.error('Failed to load friendships:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    loadFriendships()
  }, [user])

  if (!user) {
    return null
  }

  return (
    <div className="w-full lg:w-1/4 p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Friends & Requests</h2>
      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-4">
          {friendships.map((friendship) => (
            <div key={friendship.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <UserAvatar user={friendship.user} />
                <div>
                  <p className="font-semibold">{friendship.user.fullname}</p>
                  <p className="text-sm text-gray-500">@{friendship.user.username}</p>
                </div>
              </div>
              <FriendButton userId={friendship.user.id} />
            </div>
          ))}
          {friendships.length === 0 && (
            <div className="text-center text-gray-500">
              No friends or pending requests
            </div>
          )}
        </div>
      )}
    </div>
  )
}

