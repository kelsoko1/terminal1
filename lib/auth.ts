import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { User, UserRole } from './auth/types';

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
  const { name, email, password, contactNumber, role = 'investor', metadata = {} } = credentials;
  
  // Validate email and password
  userSchema.parse({ email, password });

  // Check if user already exists
  const existingUser = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Set default permissions based on role
  const permissions = getDefaultPermissions(role);

  // Create user in database
  const result = await db.transaction(async (client) => {
    // Insert user
    const userResult = await client.query(
      `INSERT INTO users (
        name, 
        email, 
        password_hash, 
        role, 
        contact_number, 
        status,
        permissions,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, role`,
      [name, email, hashedPassword, role, contactNumber || null, 'active', permissions, metadata ? JSON.stringify(metadata) : null]
    );

    const userId = userResult.rows[0].id;

    // Create initial portfolio for investors
    if (role === 'investor') {
      const initialInvestment = metadata?.initialInvestment ? parseFloat(metadata.initialInvestment) : 0;
      await client.query(
        'INSERT INTO portfolios (user_id, name, cash_balance) VALUES ($1, $2, $3)',
        [userId, 'Default Portfolio', initialInvestment]
      );
    }

    return userResult.rows[0];
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
}

export async function login(credentials: UserCredentials) {
  const { email, password } = userSchema.parse(credentials);

  // Find user by email
  const result = await db.query(
    `SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.password_hash, 
      u.role, 
      u.permissions,
      u.status,
      u.department,
      u.license_number,
      u.contact_number,
      COALESCE(
        (SELECT json_agg(json_build_object(
          'id', p.id,
          'name', p.name,
          'cash_balance', p.cash_balance
        ))
        FROM portfolios p
        WHERE p.user_id = u.id), '[]'
      ) as portfolios
    FROM users u
    WHERE u.email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];

  // Check if user is active
  if (user.status !== 'active') {
    throw new Error('Account is not active');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
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
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    status: user.status,
    department: user.department,
    licenseNumber: user.license_number,
    contactNumber: user.contact_number,
  };

  return {
    token,
    user: userData,
    portfolios: user.portfolios || [],
  };
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
