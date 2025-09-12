'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  BarChart2, Users, TrendingUp, Briefcase, Award, 
  FileText, DollarSign, Package, Zap, Radio, 
  BarChart, FileBarChart, UserCog, Calculator, Building
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  access?: string[];
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/broker', icon: BarChart2 },
  { name: 'Organizations', href: '/broker?tab=organizations', icon: Building, access: ['kelsoko_admin'] },
  { name: 'Client Management', href: '/broker?tab=clients', icon: Users },
  { name: 'Stocks', href: '/broker?tab=stocks', icon: TrendingUp },
  { name: 'Challenges', href: '/broker?tab=challenges', icon: Award },
  { name: 'Prediction Markets', href: '/broker/prediction-market', icon: BarChart2 },
  { name: 'Bonds', href: '/broker?tab=bonds', icon: FileText },
  { name: 'Mutual Funds', href: '/broker?tab=funds', icon: Briefcase },
  { name: 'Futures', href: '/broker?tab=futures', icon: Zap },
  { name: 'Subscriptions', href: '/broker?tab=subscriptions', icon: DollarSign },
  { name: 'Ads Management', href: '/broker?tab=ads', icon: Radio },
  { name: 'Research', href: '/broker?tab=research', icon: BarChart },
  { name: 'Reports', href: '/broker?tab=reports', icon: FileBarChart },
  { name: 'HR & Roles', href: '/broker?tab=hr', icon: UserCog, access: ['hr', 'admin'] },
  { name: 'Accounting', href: '/broker?tab=accounting', icon: Calculator, access: ['admin', 'accounting'] },
]

export default function BrokerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Function to check if a path is active
  const isActive = (href: string) => {
    if (!pathname) return false;
    
    // For the main dashboard (no search params)
    if (href === '/broker' && pathname === '/broker' && !searchParams?.get('tab')) {
      return true
    }
    
    // For tab navigation
    if (href !== '/broker' && pathname === '/broker' && href.includes('?tab=')) {
      const tabName = href.split('?tab=')[1]
      const currentTab = searchParams?.get('tab')
      return currentTab === tabName
    }
    
    return false
  }

  return (
    <div className="flex min-h-screen bg-muted/10">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-14 z-30 flex h-[calc(100vh-3.5rem)] flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="flex h-14 items-center justify-between border-b px-4">
          <h2 className={cn("font-semibold tracking-tight transition-opacity", 
            collapsed ? "opacity-0 invisible" : "opacity-100 visible"
          )}>
            Back Office
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {sidebarItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href) 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", collapsed ? "mx-auto" : "")} />
                <span className={cn(
                  "transition-opacity",
                  collapsed ? "hidden opacity-0" : "opacity-100"
                )}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <div className={cn(
        "flex-1 overflow-auto transition-all duration-300",
        collapsed ? "ml-16" : "ml-64"
      )}>
        {children}
      </div>
    </div>
  )
}

import { ChevronLeft, ChevronRight } from 'lucide-react'
