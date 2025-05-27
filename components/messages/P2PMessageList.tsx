'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useP2PStore } from '@/lib/store/p2pStore'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useState } from 'react'

interface P2PMessageListProps {
  peerId: string
}

export function P2PMessageList({ peerId }: P2PMessageListProps) {
  const { user } = useAuth()
  const { messages, sendMessage, initializePeerConnection } = useP2PStore()
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (user && peerId) {
      initializePeerConnection(peerId)
    }
  }, [user, peerId, initializePeerConnection])

  const peerMessages = messages.filter(
    msg => 
      (msg.senderId === user?.id && msg.receiverId === peerId) ||
      (msg.senderId === peerId && msg.receiverId === user?.id)
  )

  const handleSend = () => {
    if (!user || !newMessage.trim()) return
    sendMessage(peerId, newMessage.trim())
    setNewMessage('')
  }

  return (
    <Card className="flex flex-col h-[400px] sm:h-[500px] p-4 mobile-card">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-3 sm:space-y-4">
          {peerMessages.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
                  message.senderId === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="mobile-text">{message.content}</p>
                <span className="text-[10px] sm:text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex gap-2 mt-4">
        <Input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          className="h-12 sm:h-10 text-base sm:text-sm"
        />
        <Button onClick={handleSend} size="icon" className="h-12 w-12 sm:h-10 sm:w-10 touch-manipulation">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
