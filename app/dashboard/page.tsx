'use client'

import { Card } from '@/components/ui/card'
import { TikTokStyleFeed } from '@/components/social/TikTokStyleFeed'
import { useAuth } from '@/lib/auth/auth-context'
import RequireAuth from '@/components/auth/RequireAuth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, checkAccess } = useAuth()

  return (
    <RequireAuth>
      <div className="w-full py-4 sm:py-6 safe-area-inset safe-area-bottom">
        <div className="grid gap-4 sm:gap-6 mobile-container">
          {/* TikTok Style Feed - Main Content */}
          <div className="w-full">
            <TikTokStyleFeed />
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}