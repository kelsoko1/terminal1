'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, MessageSquare } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

interface User {
  id: string
  name: string
  role: string
  department?: string
}

// Mock users - in a real app, this would come from an API
const MOCK_USERS: User[] = [
  {
    id: 'ADM001',
    name: 'Admin User',
    role: 'admin',
    department: 'management',
  },
  {
    id: 'HR001',
    name: 'HR Manager',
    role: 'hr',
    department: 'human_resources',
  },
  {
    id: 'ACC001',
    name: 'Account Manager',
    role: 'accounting',
    department: 'finance',
  },
  {
    id: 'BRK001',
    name: 'John Broker',
    role: 'broker',
    department: 'equities',
  },
  {
    id: 'TRD001',
    name: 'Tom Trader',
    role: 'trader',
    department: 'trading',
  },
]

export function NewMessageDialog() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const filteredUsers = MOCK_USERS.filter(u => 
    u.id !== user?.id && (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
    )
  )

  const handleSelectUser = (userId: string) => {
    setOpen(false)
    router.push(`/messages?user=${userId}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 p-0 focus-visible:ring-0"
            />
          </div>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full justify-start p-4"
                  onClick={() => handleSelectUser(user.id)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {user.role} {user.department && `• ${user.department}`}
                    </span>
                  </div>
                </Button>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center text-muted-foreground p-4">
                  No users found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
