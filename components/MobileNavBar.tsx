'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LineChart, Wallet, User, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useLanguage } from '@/lib/language-context';

export function MobileNavBar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  if (!isAuthenticated) return null;

  const navItems = [
    { name: 'Home', translationKey: 'dashboard', href: '/', icon: Home },
    { name: 'Markets', translationKey: 'markets', href: '/markets', icon: LineChart },
    { name: 'Search', translationKey: 'search', href: '/search', icon: Search },
    { name: 'Wallet', translationKey: 'wallet', href: '/wallet', icon: Wallet },
    { name: 'Account', translationKey: 'account', href: '/account', icon: User },
  ];

  return (
    <nav className="mobile-nav-bar md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href || 
                        (item.href === '/' && pathname === '/dashboard');
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="h-5 w-5" />
            <span>{t(item.translationKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
