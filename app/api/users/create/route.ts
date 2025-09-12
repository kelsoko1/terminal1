import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebase/admin';
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

// Helper to get user from Firebase Auth
async function getUserFromRequest(req: Request): Promise<any | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const idToken = authHeader.replace('Bearer ', '');
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Verify the requester has permission to create users
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and HR can create users
    if (authUser.role !== 'admin' && authUser.role !== 'hr') {
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

    const db = getFirestore(app);
    // Check if email already exists
    const usersRef = collection(db, 'users');
    const existingUserSnap = await getDocs(query(usersRef, where('email', '==', validatedData.email)));
    if (!existingUserSnap.empty) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user in Firestore
    const newUser = {
      name: validatedData.name,
      email: validatedData.email,
      passwordHash: hashedPassword,
      role: validatedData.role,
      department: validatedData.department || null,
      contactNumber: validatedData.contactNumber || null,
      licenseNumber: validatedData.licenseNumber || null,
      permissions: validatedData.permissions || [],
      status: 'active',
      createdBy: authUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const userRef = await addDoc(usersRef, newUser);

    // TODO: Create initial portfolio for investors if needed
    // if (validatedData.role === 'investor') { ... }

    return NextResponse.json({
      message: 'User created successfully',
      user: { id: userRef.id, ...newUser }
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
