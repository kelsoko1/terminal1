import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { User, UserRole } from './auth/types';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type UserCredentials = z.infer<typeof userSchema>;

export async function register(credentials: {
  name: string;
  email: string;
  password: string;
  contactNumber?: string;
  role?: UserRole;
  metadata?: Record<string, any>;
}) {
  const { name, email, password, contactNumber, role = 'USER', metadata = {} } = credentials;
  
  // Validate email and password
  userSchema.parse({ email, password });

  try {
    // Check if user already exists
    const existingUser = await db.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set default permissions based on role
    const permissions = getDefaultPermissions(role);

    // Create user in database using Prisma transaction
    const result = await db.prisma.$transaction(async (prisma) => {
      // Insert user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: (role || 'investor') as UserRole, // Default to investor if no role provided
          contactNumber,
          status: 'ACTIVE',
          permissions,
          // Create organization relationship if needed
          // organization: { connect: { id: organizationId } }
        }
      });

      return user;
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: result.id, email: result.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function login(credentials: UserCredentials) {
  const { email, password } = userSchema.parse(credentials);

  try {
    // Find user by email using Prisma
    const user = await db.prisma.user.findUnique({
      where: { email },
      include: {
        // Include any related data needed for the user
        // For example, include organization data if needed
        organization: true
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new Error('Account is not active');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Format user object for client
    const userData: Partial<User> = {
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: user.role as UserRole,
      permissions: user.permissions || [],
      status: user.status,
      department: user.department || undefined,
      contactNumber: user.contactNumber || undefined,
    };

    return {
      token,
      user: userData
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
  } catch {
    throw new Error('Invalid token');
  }
}

function getDefaultPermissions(role: UserRole): string[] {
  switch (role) {
    case 'admin':
      return [
        'all_access',
        'system_config',
        'user_management',
        'broker_management',
        'trader_management',
        'financial_reports',
        'client_management',
        'trading',
        'market_analysis',
      ];
    case 'hr':
      return [
        'user_management',
        'broker_management',
        'trader_management',
        'hiring',
        'department_management',
        'performance_review',
      ];
    case 'accounting':
      return [
        'financial_reports',
        'broker_accounts',
        'settlements',
        'audit_logs',
        'transaction_history',
      ];
    case 'broker':
      return [
        'trading',
        'client_management',
        'reports',
        'market_analysis',
        'portfolio_management',
      ];
    case 'trader':
      return [
        'trading',
        'market_analysis',
        'portfolio_view',
        'order_management',
      ];
    case 'investor':
      return [
        'view_portfolio',
        'place_orders',
        'view_reports',
      ];
    default:
      return [];
  }
}
