'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LineChart, Wallet, User, BarChart2 } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { useAuth } from '@/lib/auth/auth-context'

export function MobileNavigation() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  if (!isAuthenticated) return null

  const navItems = [
    { name: t('dashboard'), href: '/', icon: Home },
    { name: t('trading'), href: '/trade', icon: LineChart },
    { name: t('portfolio'), href: '/portfolio', icon: BarChart2 },
    { name: t('wallet'), href: '/wallet', icon: Wallet },
    { name: t('account'), href: '/account', icon: User }
  ]

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      } sm:hidden`}
    >
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`mobile-nav-item touch-manipulation ${
                isActive ? 'text-primary active' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
