'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { UserRole } from '@/lib/auth/types'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RequireAuthProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export default function RequireAuth({ children, requiredRole = 'investor' }: RequireAuthProps) {
  const { isAuthenticated, isLoading, checkAccess } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!isLoading && isAuthenticated && requiredRole && !checkAccess(requiredRole)) {
      router.push('/unauthorized')
    }
  }, [isLoading, isAuthenticated, requiredRole, router, checkAccess])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && !checkAccess(requiredRole)) {
    return null
  }

  return <>{children}</>
}
