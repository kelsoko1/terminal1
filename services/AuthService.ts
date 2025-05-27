import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export class AuthService {
  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) return null;

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        role: user.role
      };
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        role: user.role
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  generateToken(user: User): string {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const expiresIn = process.env.JWT_EXPIRY || '24h';

    return jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      },
      secret,
      { expiresIn }
    );
  }

  verifyToken(token: string): User | null {
    try {
      const secret = process.env.JWT_SECRET || 'fallback-secret-key';
      const decoded = jwt.verify(token, secret) as any;
      
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();
