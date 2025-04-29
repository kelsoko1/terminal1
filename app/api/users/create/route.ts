import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth/auth-utils';
import { UserRole } from '@/lib/auth/types';

// Schema for user creation
const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['investor', 'broker', 'trader', 'hr', 'accounting', 'admin'] as [UserRole, ...UserRole[]]),
  department: z.string().optional(),
  contactNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    // Verify the requester has permission to create users
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and HR can create users
    if (authResult.user?.role !== 'admin' && authResult.user?.role !== 'hr') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Additional validation based on role
    if ((validatedData.role === 'broker' || validatedData.role === 'trader') && !validatedData.department) {
      return NextResponse.json(
        { message: 'Department is required for broker and trader roles' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [validatedData.email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user in database
    const result = await db.query(
      `INSERT INTO users (
        name, 
        email, 
        password_hash, 
        role, 
        department, 
        contact_number, 
        license_number, 
        permissions, 
        status,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, name, email, role`,
      [
        validatedData.name,
        validatedData.email,
        hashedPassword,
        validatedData.role,
        validatedData.department || null,
        validatedData.contactNumber || null,
        validatedData.licenseNumber || null,
        validatedData.permissions || [],
        'active',
        authResult.user?.id
      ]
    );

    // Create initial portfolio for investors
    if (validatedData.role === 'investor') {
      await db.query(
        'INSERT INTO portfolios (user_id, name, cash_balance) VALUES ($1, $2, $3)',
        [result.rows[0].id, 'Default Portfolio', 0]
      );
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}
