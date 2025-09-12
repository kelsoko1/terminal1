import { NextRequest, NextResponse } from 'next/server'
import { generalModel } from '@/lib/firebase/ai'

// Helper to fetch DSE daily report/news (simple web scrape or fetch)
async function fetchDSEDailyReport(): Promise<string> {
  try {
    // Example: Fetch from DSE website (replace with actual endpoint if available)
    const dseUrl = 'https://www.dse.co.tz/market-reports';
    const res = await fetch(dseUrl)
    const html = await res.text()
    // Simple extraction: get the first report/news headline and summary (customize as needed)
    const match = html.match(/<div class="news-item">([\s\S]*?)<\/div>/)
    if (match) {
      return match[1].replace(/<[^>]+>/g, '').trim()
    }
    return 'No DSE report found.'
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
        userId: 'ai-user-id', // Special AI user ID
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