import { NextRequest, NextResponse } from 'next/server'
import { adMobService } from '@/lib/services/adMobService'

// GET /api/ads/admob/[id] - Get specific ad campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ad = await adMobService.getAdCampaign(params.id)
    
    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad campaign not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: ad })
  } catch (error) {
    console.error('Error fetching AdMob ad:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ad campaign' },
      { status: 500 }
    )
  }
}

// PUT /api/ads/admob/[id] - Update ad campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Check if ad exists
    const existingAd = await adMobService.getAdCampaign(params.id)
    if (!existingAd) {
      return NextResponse.json(
        { success: false, error: 'Ad campaign not found' },
        { status: 404 }
      )
    }
    
    // Update the ad
    await adMobService.updateAdCampaign(params.id, body)
    
    // Get updated ad
    const updatedAd = await adMobService.getAdCampaign(params.id)
    
    return NextResponse.json({ success: true, data: updatedAd })
  } catch (error) {
    console.error('Error updating AdMob ad:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update ad campaign' },
      { status: 500 }
    )
  }
}

// DELETE /api/ads/admob/[id] - Delete ad campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if ad exists
    const existingAd = await adMobService.getAdCampaign(params.id)
    if (!existingAd) {
      return NextResponse.json(
        { success: false, error: 'Ad campaign not found' },
        { status: 404 }
      )
    }
    
    // Delete the ad
    await adMobService.deleteAdCampaign(params.id)
    
    return NextResponse.json({ success: true, message: 'Ad campaign deleted successfully' })
  } catch (error) {
    console.error('Error deleting AdMob ad:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete ad campaign' },
      { status: 500 }
    )
  }
} 