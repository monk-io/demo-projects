import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserAvatar } from "@/lib/api"
import { User } from "@/lib/types"
import { sha256 } from "js-sha256"

interface UserAvatarProps {
  user?: User
  className?: string
}

export default function UserAvatar({ user, className }: UserAvatarProps) {
  const initials = user?.fullname
    ? user.fullname.split(" ").map((name) => name[0]).join("").toUpperCase()
    : "UN"

  const emailHash = user?.email ? sha256(user.email.toLowerCase()).toString() : undefined
  const gravatarUrl = emailHash ? `https://www.gravatar.com/avatar/${emailHash}?d=retro&s=128` : undefined

  return (
    <Avatar className={className}>
      <AvatarImage 
        src={user ? gravatarUrl : undefined} 
        alt={user?.fullname || user?.username} 
      />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
} 