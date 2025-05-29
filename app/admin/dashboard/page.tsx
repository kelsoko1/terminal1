'use client'

import { useEffect, useState } from 'react'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/lib/auth/auth-context'
import { UserRole } from '@/lib/auth/types'
import { redirect } from 'next/navigation'

export default function AdminDashboardPage() {
  const { user, checkAccess } = useAuth()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) return setAuthorized(false)
      
      const allowedRoles: UserRole[] = ['admin', 'broker', 'kelsoko_admin']
      const hasAccess = allowedRoles.includes(user.role as UserRole)
      setAuthorized(hasAccess)
    }

    checkAuthorization()
  }, [user])

  // Show loading state while checking authorization
  if (authorized === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Redirect unauthorized users
  if (authorized === false) {
    return redirect('/unauthorized')
  }

  return (
    <RequireAuth>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <AdminDashboard />
      </div>
    </RequireAuth>
  )
}
