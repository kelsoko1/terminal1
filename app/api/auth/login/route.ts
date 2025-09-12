import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({
    message: 'Login is now handled client-side via Firebase Auth.'
  }, { status: 404 });
}