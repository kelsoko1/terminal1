// Type declarations for next-auth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      role: string;
      permissions: string[];
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions?: string[];
  }

  export interface NextAuthOptions {
    providers: any[];
    session: {
      strategy: string;
      maxAge: number;
    };
    callbacks: {
      jwt: (params: { token: any; user?: any }) => Promise<any>;
      session: (params: { session: any; token: any }) => Promise<any>;
    };
    pages?: {
      signIn?: string;
      error?: string;
    };
    secret?: string;
  }
}

declare module 'next-auth/next' {
  import { NextApiRequest, NextApiResponse } from 'next';
  import { NextAuthOptions } from 'next-auth';

  export function getServerSession(
    ...args: any[]
  ): Promise<{
    user: {
      id: string;
      name?: string;
      email?: string;
      role: string;
      permissions: string[];
    } | null;
  } | null>;
}

declare module 'next-auth/providers/credentials' {
  export default function Credentials(config: any): any;
}
