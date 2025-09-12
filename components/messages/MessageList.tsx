'use client'

import { useState } from 'react'
import { useMessageStore } from '@/lib/store/messageStore'
import { useAuth } from '@/lib/auth/auth-context'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

interface MessageListProps {
  conversationId: string
  otherUserId: string
}

export function MessageList({ conversationId, otherUserId }: MessageListProps) {
  const { user } = useAuth()
  const { messages, sendMessage } = useMessageStore()
  const [newMessage, setNewMessage] = useState('')

  const conversationMessages = messages.filter(
    msg => 
      (msg.senderId === user?.id && msg.receiverId === otherUserId) ||
      (msg.senderId === otherUserId && msg.receiverId === user?.id)
  )

  const handleSend = () => {
    if (!user || !newMessage.trim()) return
    sendMessage(user.id, otherUserId, newMessage.trim())
    setNewMessage('')
  }

  return (
    <Card className="flex flex-col h-[500px] p-4">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {conversationMessages.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.senderId === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p>{message.content}</p>
                <span className="text-xs opacity-70">
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
        />
        <Button onClick={handleSend} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
