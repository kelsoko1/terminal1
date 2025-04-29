'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg text-gray-600 mb-6">
          You do not have permission to access this page.
        </p>
        <Button onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  )
}
