import { NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { verifyAuth } from '@/lib/auth/auth-utils';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    // Fetch user from Firestore
    const db = getFirestore(app);
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = userSnap.data();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Return user data (add balance: 0 for now)
    return NextResponse.json({
      user: {
        id: userId,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      contactNumber: user.contactNumber,
      department: user.department,
        position: user.position,
        balance: 0 // Placeholder, implement wallet in Firestore if needed
      }
    }, { status: 200 });
  } catch (error) {
    logger.error('Error fetching user account', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch user account', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    const body = await request.json();
    const { name, email, phone, department, position } = body;
    // Update user in Firestore
    const db = getFirestore(app);
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        name,
        email,
        contactNumber: phone,
        department,
        position,
      updatedAt: new Date().toISOString()
    });
    // Fetch updated user
    const userSnap = await getDoc(userRef);
    const user = userSnap.data();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    logger.info('User account updated', { userId, updatedBy: userId });
    return NextResponse.json({
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        contactNumber: user.contactNumber,
        department: user.department,
        position: user.position
      }
    }, { status: 200 });
  } catch (error) {
    logger.error('Error updating user account', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to update user account', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
