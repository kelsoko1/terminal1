import 'next-auth/react';

declare module 'next-auth/react' {
  export function getSession(options?: { req?: any }): Promise<{
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      permissions?: string[];
    }
  } | null>;
}
