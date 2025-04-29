'use client'

import { cn } from '@/lib/utils'

export default function BrokerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>
    </div>
  )
}
