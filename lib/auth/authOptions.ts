import { NextAuthOptions } from 'next-auth';
import { UserRole } from './types';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions?: string[];
}

interface Token {
  id: string;
  role: UserRole;
  permissions: string[];
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

interface Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    role: UserRole;
    permissions: string[];
  };
}

// If you are not using NextAuth, you can remove this file entirely.
export const authOptions: NextAuthOptions = {
  providers: [], // No legacy providers
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }: { token: Token; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions || [];
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: Token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};
