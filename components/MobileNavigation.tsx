'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { Home, LineChart, DollarSign, Wallet, User, ShoppingBag } from 'lucide-react';

export function MobileNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  // Only render on client-side to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const navItems = [
    { name: 'Home', translationKey: 'dashboard', href: '/', icon: Home },
    { name: 'Trading', translationKey: 'trading', href: '/trade', icon: LineChart },
    { name: 'Portfolio', translationKey: 'portfolio', href: '/portfolio', icon: DollarSign },
    { name: 'Wallet', translationKey: 'wallet', href: '/wallet', icon: Wallet },
    { name: 'Account', translationKey: 'account', href: '/account', icon: User },
  ];

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-list">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/' && pathname?.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="mobile-nav-item touch-manipulation"
            >
              <div className="relative flex flex-col items-center">
                {isActive && <div className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-primary"></div>}
                <item.icon 
                  className={`mobile-nav-icon ${isActive ? 'text-primary' : 'text-muted-foreground'}`} 
                />
                <span 
                  className={`mobile-nav-label ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                >
                  {t(item.translationKey)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
