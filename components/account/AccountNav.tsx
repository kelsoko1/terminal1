'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const accountNavItems = [
  {
    title: "Profile",
    href: "/account",
  },
  {
    title: "Security",
    href: "/account/security",
  },
  {
    title: "Preferences",
    href: "/account/preferences",
  },
  {
    title: "DSE Settings",
    href: "/account/dse",
  },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
      {accountNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "justify-start hover:bg-muted hover:text-foreground",
            pathname === item.href
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground",
            "px-3 py-2 text-sm rounded-md transition-colors"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
} 