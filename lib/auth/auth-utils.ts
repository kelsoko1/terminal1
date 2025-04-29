import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { User } from './types';

// Get JWT configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Warning for development environments
if (process.env.NODE_ENV !== 'production' && JWT_SECRET === 'your-secret-key') {
  console.warn(
    'WARNING: Using default JWT secret key. This is insecure and should only be used in development.'
  );
}

interface AuthResult {
  success: boolean;
  user?: User;
  message?: string;
}

/**
 * Verifies the authentication token from the request
 * @param request The incoming request
 * @returns AuthResult object with success status and user data if authenticated
 */
export async function verifyAuth(request: Request): Promise<AuthResult> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get token from cookies as fallback
      const cookieStore = cookies();
      token = cookieStore.get('auth_token')?.value;
    }

    if (!token) {
      return { success: false, message: 'No authentication token provided' };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    
    // Get user from database
    const result = await db.query(
      'SELECT id, name, email, role, status, permissions, department FROM users WHERE id = $1 AND status = $2',
      [decoded.id, 'active']
    );

    if (result.rows.length === 0) {
      return { success: false, message: 'User not found or inactive' };
    }

    const user = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      role: result.rows[0].role,
      status: result.rows[0].status,
      permissions: result.rows[0].permissions || [],
      department: result.rows[0].department
    };

    return { success: true, user };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Authentication failed' 
    };
  }
}

/**
 * Checks if a user has a specific permission
 * @param user The user object
 * @param permission The permission to check
 * @returns Boolean indicating if the user has the permission
 */
export function hasPermission(user: User, permission: string): boolean {
  if (!user || !user.permissions) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check if the user has the specific permission
  return user.permissions.includes(permission);
}

/**
 * Generates a JWT token for a user
 * @param user The user object
 * @returns JWT token string
 */
export function generateToken(user: { id: string; email: string }): string {
  // Create a payload for the JWT
  const payload = {
    id: user.id,
    email: user.email
  };
  
  // Sign the token with the secret key
  try {
    // Using any to bypass TypeScript's strict checking
    return jwt.sign(payload, JWT_SECRET as any, { 
      expiresIn: JWT_EXPIRY 
    });
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
}
