'use client'

import { useP2PStore } from '@/lib/store/p2pStore'
import { useAuth } from '@/lib/auth/auth-context'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ConversationListProps {
  selectedUserId?: string
}

export function ConversationList({ selectedUserId }: ConversationListProps) {
  const { user } = useAuth()
  const { connections, messages } = useP2PStore()

  // Get unique peer IDs from messages
  const peerIds = new Set(
    messages.map(msg => 
      msg.senderId === user?.id ? msg.receiverId : msg.senderId
    )
  )

  // Create conversation summaries
  const conversations = Array.from(peerIds).map(peerId => {
    const peerMessages = messages.filter(msg => 
      (msg.senderId === user?.id && msg.receiverId === peerId) ||
      (msg.senderId === peerId && msg.receiverId === user?.id)
    )

    const lastMessage = peerMessages[peerMessages.length - 1]
    const unreadCount = peerMessages.filter(msg => 
      msg.senderId === peerId && !msg.read
    ).length

    return {
      peerId,
      lastMessage,
      unreadCount,
      status: connections.get(peerId)?.status || 'disconnected'
    }
  })

  return (
    <Card className="p-4">
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-2">
          {conversations.map(conv => (
            <Link key={conv.peerId} href={`/messages?user=${conv.peerId}`}>
              <Button
                variant={selectedUserId === conv.peerId ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">User {conv.peerId}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      conv.status === 'connected' ? 'bg-green-500' : 
                      conv.status === 'connecting' ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`} />
                  </div>
                  {conv.lastMessage && (
                    <span className="text-sm opacity-70 truncate">
                      {conv.lastMessage.content}
                    </span>
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                    {conv.unreadCount}
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
