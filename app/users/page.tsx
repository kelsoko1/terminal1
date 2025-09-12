'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { UserCard } from '@/components/users/UserCard'
import RequireAuth from '@/components/auth/RequireAuth'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function UsersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  // In a real app, this would come from an API
  const users = [
    {
      id: 'ADM001',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      department: 'management',
      status: 'active',
    },
    {
      id: 'HR001',
      name: 'HR Manager',
      email: 'hr@example.com',
      role: 'hr',
      department: 'human_resources',
      status: 'active',
    },
    {
      id: 'ACC001',
      name: 'Account Manager',
      email: 'accounting@example.com',
      role: 'accounting',
      department: 'finance',
      status: 'active',
    },
    {
      id: 'BRK001',
      name: 'John Broker',
      email: 'broker@example.com',
      role: 'broker',
      department: 'equities',
      status: 'active',
    },
    {
      id: 'TRD001',
      name: 'Tom Trader',
      email: 'trader@example.com',
      role: 'trader',
      department: 'trading',
      status: 'active',
    },
  ].filter(u => u.id !== user?.id) // Don't show current user

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleMessage = (userId: string) => {
    router.push(`/messages?user=${userId}`)
  }

  if (!user) return null

  return (
    <RequireAuth>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Users</h1>
        <div className="max-w-xl mb-6">
          <Input
            placeholder="Search users by name, department, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="grid gap-4">
          {filteredUsers.map(userData => (
            <UserCard
              key={userData.id}
              userData={userData}
              onMessage={handleMessage}
            />
          ))}
        </div>
      </div>
    </RequireAuth>
  )
}
