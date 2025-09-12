import { NextRequest, NextResponse } from 'next/server'
import { adMobService } from '@/lib/services/adMobService'

// GET /api/ads/admob - Get all ad campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    
    let ads = await adMobService.getAdCampaigns()
    
    // Filter by type if provided
    if (type) {
      ads = ads.filter(ad => ad.type === type)
    }
    
    // Filter by status if provided
    if (status) {
      ads = ads.filter(ad => ad.status === status)
    }
    
    return NextResponse.json({ success: true, data: ads })
  } catch (error) {
    console.error('Error fetching AdMob ads:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ads' },
      { status: 500 }
    )
  }
}

// POST /api/ads/admob - Create new ad campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'type', 'status', 'startDate']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    const adData = {
      name: body.name,
      type: body.type,
      status: body.status,
      startDate: body.startDate,
      endDate: body.endDate,
      targetAudience: body.targetAudience || [],
      budget: body.budget,
      spent: body.spent || 0,
      impressions: body.impressions || 0,
      clicks: body.clicks || 0,
      revenue: body.revenue || 0,
      ctr: body.ctr || 0,
      cpm: body.cpm || 0
    }
    
    const newAd = await adMobService.createAdCampaign(adData)
    
    return NextResponse.json({ success: true, data: newAd })
  } catch (error) {
    console.error('Error creating AdMob ad:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create ad campaign' },
      { status: 500 }
    )
  }
} 