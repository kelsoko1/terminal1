'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '../lib/auth/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated ? (
    <AuthProvider>
      {children}
    </AuthProvider>
  ) : null;
}
