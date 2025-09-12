import { NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

// GET /api/investors/profile - Get investor profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }
    // Fetch user from Firestore
    const db = getFirestore(app);
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    const user = userSnap.data();
    return NextResponse.json({
      id: userId,
      name: user.name,
      email: user.email,
      contactNumber: user.contactNumber || '',
      joinDate: user.createdAt,
      investorBio: user.investorBio || '',
      investmentGoals: user.investmentGoals || '',
      riskTolerance: user.riskTolerance || 'moderate'
    });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/investors/profile - Update investor profile
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, investorBio, investmentGoals, riskTolerance } = body;
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }
    // Update investor profile fields in Firestore
    const db = getFirestore(app);
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      investorBio,
          investmentGoals,
          riskTolerance
    });
    return NextResponse.json({ message: 'Investor profile updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
