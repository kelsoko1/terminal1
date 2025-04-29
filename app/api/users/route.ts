import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth/auth-utils';
import { User } from '@/lib/auth/types';

export async function GET(request: Request) {
  try {
    // Verify the requester has permission to view users
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and HR can view all users
    if (authResult.user?.role !== 'admin' && authResult.user?.role !== 'hr') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    
    // Build query with optional filters
    let query = 'SELECT id, name, email, role, status, department, license_number, contact_number, created_at FROM users';
    const queryParams: string[] = [];
    const conditions: string[] = [];
    
    if (role) {
      conditions.push(`role = $${queryParams.length + 1}`);
      queryParams.push(role);
    }
    
    if (status) {
      conditions.push(`status = $${queryParams.length + 1}`);
      queryParams.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    // Execute query
    const result = await db.query(query, queryParams);
    
    // Transform data for frontend
    const users = result.rows.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department,
      licenseNumber: user.license_number,
      contactNumber: user.contact_number,
      createdAt: user.created_at
    }));
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
