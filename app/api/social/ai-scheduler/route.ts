import { NextRequest, NextResponse } from 'next/server'
import { generalModel } from '@/lib/firebase/ai'

// Helper to fetch DSE daily report/news
async function fetchDSEDailyReport(): Promise<string> {
  try {
    // For now, return mock DSE data since we can't scrape the actual site
    const mockDSEData = [
      'DSE All Share Index (DSEI) closed at 1,234.56 points, up 0.5% from previous session.',
      'Tanzania Breweries Limited (TBL) led gainers with 2.3% increase to TZS 3,200.',
      'CRDB Bank (CRDB) traded 1.2 million shares worth TZS 2.1 billion.',
      'Market capitalization reached TZS 12.5 trillion with 15 stocks advancing.',
      'Foreign investors were net buyers with TZS 450 million in purchases.'
    ]
    
    // Return a random DSE report
    const randomIndex = Math.floor(Math.random() * mockDSEData.length)
    return mockDSEData[randomIndex]
  } catch (error) {
    console.error('Error fetching DSE report:', error)
    return 'DSE market data unavailable at the moment.'
  }
}

// Helper to create a post in the database
async function createAIPost(content: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/social/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        userId: 'ai-user-id',
        userName: 'DSE Market AI',
        userAvatar: '/ai-avatar.jpg'
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to create AI post')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating AI post:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: false, error: 'AI post creation is temporarily paused.' }, { status: 503 })
} 