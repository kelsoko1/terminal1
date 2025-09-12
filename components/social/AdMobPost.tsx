import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface AdMobPostProps {
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

export function AdMobPost({ ad }: AdMobPostProps) {
  return (
    <Card className="mb-4 border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 relative">
      <CardHeader className="pb-2 flex flex-row items-center gap-3">
        <Avatar className="h-10 w-10 border border-yellow-400">
          <AvatarFallback className="bg-yellow-300 text-yellow-900">AD</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
            Sponsored
            <Badge variant="secondary" className="text-xs bg-yellow-400 text-yellow-900">Ad</Badge>
          </div>
          <div className="text-xs text-yellow-700 dark:text-yellow-200">{ad.name}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-yellow-900 dark:text-yellow-100 font-semibold">
          {ad.type === 'banner' && 'Check out this offer!'}
          {ad.type === 'interstitial' && 'Special Promotion!'}
          {ad.type === 'rewarded' && 'Watch and Earn!'}
          {ad.type === 'native' && 'Recommended for you!'}
        </div>
        <div className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">
          Impressions: {ad.impressions} | Clicks: {ad.clicks} | CTR: {ad.ctr}%
        </div>
        <div className="flex items-center gap-2 text-xs text-yellow-800 dark:text-yellow-200">
          Revenue: TZS {ad.revenue.toLocaleString()}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-end">
        <span className="text-xs text-yellow-700 dark:text-yellow-200">Ad by Google</span>
      </CardFooter>
    </Card>
  )
} 