import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/investors/profile - Get investor profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      if (decoded.id !== userId) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get investor profile from database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // For now, we'll use the user data directly
    // Later, when Prisma client is regenerated, we can include the investorProfile
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      contactNumber: user.contactNumber || '',
      joinDate: user.createdAt,
      investorBio: '',  // Default values until investorProfile is available
      investmentGoals: '',
      riskTolerance: 'moderate'
    });
  } catch (error) {
    console.error('Error fetching investor profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/investors/profile - Update investor profile
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, investorBio, investmentGoals, riskTolerance } = body;

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      if (decoded.id !== userId) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Store investor profile data in a custom field for now
    // This is a temporary solution until Prisma client is regenerated
    await prisma.user.update({
      where: { id: userId },
      data: {
        // We'll store this in metadata or another existing field
        // This is just a temporary solution
        department: `INVESTOR_PROFILE:${JSON.stringify({
          bio: investorBio,
          investmentGoals,
          riskTolerance
        })}`
      }
    });

    return NextResponse.json({ 
      message: 'Investor profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating investor profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
