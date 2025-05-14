import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

    // Get investor profile from database
    const result = await db.query(
      `SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.contact_number,
        u.join_date,
        ip.investor_bio,
        ip.investment_goals,
        ip.risk_tolerance
      FROM users u
      LEFT JOIN investor_profiles ip ON u.id = ip.user_id
      WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      contactNumber: user.contact_number,
      joinDate: user.join_date,
      investorBio: user.investor_bio || '',
      investmentGoals: user.investment_goals || '',
      riskTolerance: user.risk_tolerance || 'moderate'
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

    // Check if investor profile exists
    const checkResult = await db.query(
      'SELECT * FROM investor_profiles WHERE user_id = $1',
      [userId]
    );

    if (checkResult.rows.length === 0) {
      // Create new investor profile
      await db.query(
        `INSERT INTO investor_profiles (
          user_id, 
          investor_bio, 
          investment_goals, 
          risk_tolerance
        ) VALUES ($1, $2, $3, $4)`,
        [userId, investorBio, investmentGoals, riskTolerance]
      );
    } else {
      // Update existing investor profile
      await db.query(
        `UPDATE investor_profiles 
        SET 
          investor_bio = $2, 
          investment_goals = $3, 
          risk_tolerance = $4
        WHERE user_id = $1`,
        [userId, investorBio, investmentGoals, riskTolerance]
      );
    }

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
