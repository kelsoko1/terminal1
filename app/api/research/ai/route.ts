import { NextRequest, NextResponse } from 'next/server';
// import { generalModel } from '@/lib/firebase/ai';
// AI temporarily disabled: using stub below.

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Compose a prompt for the AI as a financial research assistant
    const prompt = `
      You are a financial research assistant for investors.
      ${context ? `Context: ${context}` : ''}
      Investor's question: "${message}"
      Please provide a detailed, actionable, and investor-friendly answer.
    `;

    // Stubbed AI response
    const text = 'AI is temporarily unavailable.';
    return NextResponse.json({ answer: text });
  } catch (error) {
    console.error('AI research chat error:', error);
    return NextResponse.json({ error: 'AI research chat failed' }, { status: 500 });
  }
} 