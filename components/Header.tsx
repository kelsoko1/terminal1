'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, ArrowLeft, Wallet, Search, BarChart2, LineChart, DollarSign, User } from 'lucide-react';
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
  const [showAuthModal, setShowAuthModal] = useState(false);
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMenuOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <Link href="/" className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6" />
            <span className="text-xl font-bold hidden md:inline-block">Terminal</span>
          </Link>

          <LanguageSwitcher />

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant={isActive ? "secondary" : "ghost"}
                      className="gap-2"
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {t(item.translationKey)}
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
              >
                <Search className="h-4 w-4" />
              </Button>

              <Link href="/wallet">
                <Button variant="outline" size="sm" className="gap-2">
                  <Wallet className="h-4 w-4" />
                  Wallet
                </Button>
              </Link>

              <Link href="/broker">
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Back Office
                </Button>
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
              <ThemeToggle />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)}>
                Login
              </Button>
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="container py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <nav className="flex flex-col gap-2">
              {sidebarNavigation.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {t(item.translationKey)}
                  </Button>
                </Link>
              ))}
              <Link
                href="/portfolio"
                className="flex items-center py-2 text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                <Wallet className="mr-2 h-4 w-4" />
                {t('portfolio')}
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Search Menu */}
      {showSearchMenu && (
        <SearchMenu isOpen={showSearchMenu} onClose={() => setShowSearchMenu(false)} />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      )}
    </header>
  );
}
