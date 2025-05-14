import { NextResponse } from 'next/server';
import { register } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await register(body);
    
    // Set token in cookie for authentication
    const cookieStore = cookies();
    cookieStore.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Something went wrong',
      },
      { status: 400 }
    );
  }
}
