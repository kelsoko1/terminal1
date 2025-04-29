'use client'

import { User } from '@/lib/auth/types'
import { useAuth } from '@/lib/auth/auth-context'
import { useFollowStore } from '@/lib/store/followStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, UserPlus, UserMinus } from 'lucide-react'

interface UserCardProps {
  userData: User
  onMessage: (userId: string) => void
}

export function UserCard({ userData, onMessage }: UserCardProps) {
  const { user } = useAuth()
  const { isFollowing, followUser, unfollowUser } = useFollowStore()

  const following = user ? isFollowing(user.id, userData.id) : false

  const handleFollowToggle = () => {
    if (!user) return
    if (following) {
      unfollowUser(user.id, userData.id)
    } else {
      followUser(user.id, userData.id)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{userData.name}</h3>
          <p className="text-sm opacity-70">{userData.role}</p>
          {userData.department && (
            <p className="text-sm opacity-70">{userData.department}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMessage(userData.id)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant={following ? "destructive" : "outline"}
            size="icon"
            onClick={handleFollowToggle}
          >
            {following ? (
              <UserMinus className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
