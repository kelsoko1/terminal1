'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '../lib/auth/auth-context';
import { EcommerceProvider } from '@/contexts/EcommerceContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated ? (
    <AuthProvider>
      <EcommerceProvider>
        {children}
      </EcommerceProvider>
    </AuthProvider>
  ) : null;
}
