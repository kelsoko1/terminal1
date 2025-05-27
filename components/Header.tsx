'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, ArrowLeft, Wallet, Search, BarChart2, LineChart, DollarSign, User, X, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SearchMenu } from '@/components/search/SearchMenu';
import { useAuth } from '@/lib/auth/auth-context';
import { useLanguage } from '@/lib/language-context';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavigationItem {
  name: string;
  translationKey: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', translationKey: 'dashboard', href: '/', icon: LineChart },
  { name: 'Trading', translationKey: 'trading', href: '/trade', icon: DollarSign },
  { name: 'Portfolio', translationKey: 'portfolio', href: '/portfolio', icon: Wallet },
  { name: 'Account', translationKey: 'account', href: '/account', icon: User }
];

const sidebarNavigation: NavigationItem[] = [
  ...navigation,
  { name: 'Broker (Back Office)', translationKey: 'broker', href: '/broker' }
];

export function Header() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const { isAuthenticated, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearchMenu, setShowSearchMenu] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-top">
      <div className="mobile-container flex h-14 sm:h-16 items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setMenuOpen(true)}
              className="md:hidden touch-manipulation h-10 w-10"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <Link href="/" className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold hidden sm:inline-block">Terminal</span>
          </Link>

          <LanguageSwitcher />

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant={isActive ? "secondary" : "ghost"}
                      className="gap-2 px-2 sm:px-3"
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span className="text-sm">{t(item.translationKey)}</span>
                    </Button>
                  </Link>
                )
              })}
            </nav>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearchMenu(true)}
                className="touch-manipulation"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Link href="/wallet" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-2 h-10">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden md:inline">Wallet</span>
                </Button>
              </Link>

              <Link href="/broker" className="hidden sm:block">
                <Button 
                  variant={pathname && pathname.startsWith('/broker') ? "default" : "outline"} 
                  size="sm" 
                  className="gap-2 h-10"
                >
                  <BarChart2 className="h-4 w-4" />
                  <span className="hidden md:inline">Back Office</span>
                </Button>
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleLogout} className="h-10">
                <span className="hidden sm:inline">Logout</span>
                <User className="h-4 w-4 sm:hidden" />
              </Button>
              <ThemeToggle />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm" className="h-10">
                  Login
                </Button>
              </Link>
              <Link href="/investor-signup">
                <Button variant="default" size="sm" className="h-10">
                  <span className="hidden xs:inline">Sign Up</span>
                  <User className="h-4 w-4 xs:hidden" />
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-background safe-area-inset safe-area-bottom">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b safe-area-top">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Terminal</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMenuOpen(false)}
                className="touch-manipulation h-12 w-12"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-lg font-semibold mb-4">Menu</h2>
              <nav className="flex flex-col gap-3">
                {sidebarNavigation.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                    <Button
                      variant={pathname === item.href ? "secondary" : "default"}
                      className="w-full justify-start gap-3 h-14 text-base"
                    >
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span className="font-medium">{t(item.translationKey)}</span>
                    </Button>
                  </Link>
                ))}
                
                <Link href="/wallet" onClick={() => setMenuOpen(false)}>
                  <Button
                    variant={pathname === '/wallet' ? "secondary" : "default"}
                    className="w-full justify-start gap-3 h-14 text-base"
                  >
                    <Wallet className="h-5 w-5" />
                    <span className="font-medium">{t('wallet')}</span>
                  </Button>
                </Link>
              </nav>
            </div>
            
            {isAuthenticated && (
              <div className="p-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-base" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Menu */}
      {showSearchMenu && (
        <SearchMenu isOpen={showSearchMenu} onClose={() => setShowSearchMenu(false)} />
      )}


    </header>
  );
}
