import { NextRequest, NextResponse } from 'next/server'
import { adMobService } from '@/lib/services/adMobService'

// GET /api/ads/admob/analytics - Get AdMob analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const analytics = await adMobService.getAnalytics(startDate || undefined, endDate || undefined)
    
    return NextResponse.json({ success: true, data: analytics })
  } catch (error) {
    console.error('Error fetching AdMob analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
} 