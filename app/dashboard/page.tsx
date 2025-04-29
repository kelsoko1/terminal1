'use client'

import { Card } from '@/components/ui/card'
import { SocialFeed } from '@/components/social/SocialFeed'
import { TikTokStyleFeed } from '@/components/social/TikTokStyleFeed'
import { useAuth } from '@/lib/auth/auth-context'
import RequireAuth from '@/components/auth/RequireAuth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, checkAccess } = useAuth()

  return (
    <RequireAuth>
      <div className="container py-6">
        {/* Back Office Access Button for Brokers */}
        {checkAccess('broker') && (
          <div className="mb-6">
            <Link href="/broker">
              <Button>Access Back Office</Button>
            </Link>
          </div>
        )}

        <div className="grid gap-6">
          {/* TikTok Style Feed - Main Content */}
          <div className="w-full max-w-4xl mx-auto">
            <TikTokStyleFeed />
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}