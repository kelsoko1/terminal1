'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useMessageStore } from '@/lib/store/messageStore'
import { useAuth } from '@/lib/auth/auth-context'

interface ClientMessageDialogProps {
  isOpen: boolean
  onClose: () => void
  client: {
    id: string
    firstName: string
    middleName?: string
    lastName: string
    email: string
  }
}

export function ClientMessageDialog({ isOpen, onClose, client }: ClientMessageDialogProps) {
  const [message, setMessage] = useState('')
  const { sendMessage } = useMessageStore()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSendMessage = () => {
    if (!message.trim()) return
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to send messages',
        variant: 'destructive',
      })
      return
    }

    // Send the message
    sendMessage(user.id, client.id, message.trim())
    
    // Show success toast
    toast({
      title: 'Message Sent',
      description: `Your message has been sent to ${client.firstName} ${client.lastName}`,
    })
    
    // Reset and close
    setMessage('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Message to {client.firstName} {client.middleName ? `${client.middleName} ` : ''}{client.lastName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="min-h-[150px]"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSendMessage} disabled={!message.trim()}>Send Message</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
