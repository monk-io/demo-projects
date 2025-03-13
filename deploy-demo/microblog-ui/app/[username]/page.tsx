import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Post from "@/app/components/Post"
import { Metadata } from "next"
import { fetchUser, fetchUserPosts } from '@/lib/api'
import { notFound } from 'next/navigation'
import UserAvatar from "@/app/components/UserAvatar"
import { FriendButton } from '@/components/FriendButton'

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  try {
    const user = await fetchUser(params.username)
    return { title: `${user.fullname} (@${user.username}) | Microblog` }
  } catch (error) {
    return { title: 'User Not Found | Microblog' }
  }
}

export default async function UserProfile({ params }: { params: { username: string } }) {
  try {
    const [userData, posts] = await Promise.all([
      fetchUser(params.username),
      fetchUserPosts(params.username)
    ])

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <UserAvatar user={userData} className="w-16 h-16" /> 
            <div>
              <h1 className="text-2xl font-bold">@{userData.username}</h1>
              {userData.fullname && <p className="text-gray-600">{userData.fullname}</p>}
            </div>
          </div>
          <FriendButton userId={userData.id} />
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}

