import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase/admin';
import { getAuth } from 'firebase/auth';

export async function GET(request: Request) {
  try {
    // Verify the requester has permission to view users
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user doc from Firestore to check role
    const userSnap = await adminDb.collection('users').doc(user.uid).get();
    if (!userSnap.exists) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userDoc = userSnap.data();
    if (userDoc.role !== 'admin' && userDoc.role !== 'hr') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    
    // Query users collection in Firestore with optional filters
    let query: FirebaseFirestore.Query = adminDb.collection('users');
    if (role) {
      query = query.where('role', '==', role);
    }
    if (status) {
      query = query.where('status', '==', status);
    }
    query = query.orderBy('createdAt', 'desc');
    const snap = await query.get();
    const users = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        department: data.department,
        licenseNumber: data.license_number,
        contactNumber: data.contact_number,
        createdAt: data.createdAt || data.created_at
      };
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
