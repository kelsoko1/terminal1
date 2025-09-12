import React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DollarSign } from 'lucide-react'

interface AdMobCommentProps {
  ad: {
    id: string
    name: string
    type: 'banner' | 'interstitial' | 'rewarded' | 'native'
    impressions: number
    clicks: number
    revenue: number
    ctr: number
    cpm: number
    startDate: string
    endDate?: string
  }
}

export function AdMobComment({ ad }: AdMobCommentProps) {
  return (
    <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-2">
      <Avatar className="h-6 w-6 border border-yellow-400">
        <AvatarFallback className="bg-yellow-300 text-yellow-900 text-xs">AD</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Sponsored</span>
          <Badge variant="secondary" className="text-xs bg-yellow-400 text-yellow-900">Ad</Badge>
        </div>
        <div className="text-xs text-yellow-900 dark:text-yellow-100 font-medium mb-1">
          {ad.type === 'banner' && 'Check out this offer!'}
          {ad.type === 'interstitial' && 'Special Promotion!'}
          {ad.type === 'rewarded' && 'Watch and Earn!'}
          {ad.type === 'native' && 'Recommended for you!'}
        </div>
        <div className="text-xs text-yellow-700 dark:text-yellow-200">
          {ad.name} • Impressions: {ad.impressions} • Clicks: {ad.clicks}
        </div>
        <div className="flex items-center gap-1 text-xs text-yellow-700 dark:text-yellow-200 mt-1">
          <DollarSign className="h-3 w-3" /> Revenue: ${ad.revenue.toFixed(2)}
        </div>
      </div>
    </div>
  )
} 