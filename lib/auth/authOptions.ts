import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { login } from '../auth';
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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { user } = await login({
            email: credentials.email,
            password: credentials.password
          });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            permissions: user.permissions || []
          } as User;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
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
