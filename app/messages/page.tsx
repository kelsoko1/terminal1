'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { ConversationList } from '@/components/messages/ConversationList'
import { P2PMessageList } from '@/components/messages/P2PMessageList'
import { NewMessageDialog } from '@/components/messages/NewMessageDialog'
import RequireAuth from '@/components/auth/RequireAuth'
import { useSearchParams } from 'next/navigation'

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const selectedUserId = searchParams?.get('user') || undefined
  const { user } = useAuth()

  if (!user) return null

  return (
    <RequireAuth>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <NewMessageDialog />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ConversationList selectedUserId={selectedUserId} />
          </div>
          <div className="md:col-span-2">
            {selectedUserId ? (
              <P2PMessageList peerId={selectedUserId} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-4">
                <p className="text-muted-foreground">Select a conversation or start a new one</p>
                <NewMessageDialog />
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
