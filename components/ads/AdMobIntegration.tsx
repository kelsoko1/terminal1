'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Users, 
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'

// AdMob Configuration
const ADMOB_CONFIG = {
  appId: 'ca-app-pub-1610851241877510~6177677290',
  bannerAdUnitId: 'ca-app-pub-1610851241877510/8480407000',
  interstitialAdUnitId: 'ca-app-pub-1610851241877510/8480407000',
  rewardedAdUnitId: 'ca-app-pub-1610851241877510/8480407000',
  nativeAdUnitId: 'ca-app-pub-1610851241877510/8480407000'
}

interface AdMobAd {
  id: string
  name: string
  type: 'banner' | 'interstitial' | 'rewarded' | 'native'
  status: 'active' | 'paused' | 'draft'
  impressions: number
  clicks: number
  revenue: number
  ctr: number
  cpm: number
  startDate: string
  endDate?: string
}

interface AdMobAnalytics {
  totalImpressions: number
  totalClicks: number
  totalRevenue: number
  avgCTR: number
  avgCPM: number
  dailyStats: Array<{
    date: string
    impressions: number
    clicks: number
    revenue: number
  }>
}

export function AdMobIntegration() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [ads, setAds] = useState<AdMobAd[]>([])
  const [analytics, setAnalytics] = useState<AdMobAnalytics>({
    totalImpressions: 0,
    totalClicks: 0,
    totalRevenue: 0,
    avgCTR: 0,
    avgCPM: 0,
    dailyStats: []
  })
  const [isAdMobEnabled, setIsAdMobEnabled] = useState(true)
  const [showCreateAd, setShowCreateAd] = useState(false)

  // Mock data initialization
  useEffect(() => {
    const mockAds: AdMobAd[] = [
      {
        id: '1',
        name: 'Twitter Feed Banner',
        type: 'banner',
        status: 'active',
        impressions: 125000,
        clicks: 2500,
        revenue: 1250.50,
        ctr: 2.0,
        cpm: 10.0,
        startDate: '2025-01-15',
        endDate: '2025-12-31'
      },
      {
        id: '2',
        name: 'Investment Tips Interstitial',
        type: 'interstitial',
        status: 'active',
        impressions: 85000,
        clicks: 1700,
        revenue: 850.25,
        ctr: 2.0,
        cpm: 10.0,
        startDate: '2025-02-01',
        endDate: '2025-11-30'
      },
      {
        id: '3',
        name: 'Trading Rewards Video',
        type: 'rewarded',
        status: 'paused',
        impressions: 45000,
        clicks: 900,
        revenue: 450.75,
        ctr: 2.0,
        cpm: 10.0,
        startDate: '2025-01-20',
        endDate: '2025-10-31'
      }
    ]

    const mockAnalytics: AdMobAnalytics = {
      totalImpressions: 255000,
      totalClicks: 5100,
      totalRevenue: 2551.50,
      avgCTR: 2.0,
      avgCPM: 10.0,
      dailyStats: [
        { date: '2025-01-01', impressions: 8500, clicks: 170, revenue: 8.50 },
        { date: '2025-01-02', impressions: 9200, clicks: 184, revenue: 9.20 },
        { date: '2025-01-03', impressions: 8800, clicks: 176, revenue: 8.80 },
        { date: '2025-01-04', impressions: 9500, clicks: 190, revenue: 9.50 },
        { date: '2025-01-05', impressions: 10200, clicks: 204, revenue: 10.20 },
        { date: '2025-01-06', impressions: 9800, clicks: 196, revenue: 9.80 },
        { date: '2025-01-07', impressions: 8900, clicks: 178, revenue: 8.90 }
      ]
    }

    setAds(mockAds)
    setAnalytics(mockAnalytics)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getAdTypeIcon = (type: string) => {
    switch (type) {
      case 'banner':
        return <BarChart3 className="h-4 w-4" />
      case 'interstitial':
        return <PieChart className="h-4 w-4" />
      case 'rewarded':
        return <TrendingUp className="h-4 w-4" />
      case 'native':
        return <LineChart className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'paused':
        return 'bg-yellow-500'
      case 'draft':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">AdMob Integration</h1>
          <p className="text-muted-foreground">Manage your Twitter ads with Google AdMob</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="admob-enabled"
              checked={isAdMobEnabled}
              onCheckedChange={setIsAdMobEnabled}
            />
            <Label htmlFor="admob-enabled">Enable AdMob</Label>
          </div>
          <Button onClick={() => setShowCreateAd(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Ad
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics.totalImpressions)}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics.totalClicks)}</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. CTR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avgCTR}%</div>
                <p className="text-xs text-muted-foreground">+2% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AdMob Configuration</CardTitle>
              <CardDescription>Your AdMob app configuration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>App ID</Label>
                  <Input value={ADMOB_CONFIG.appId} readOnly />
                </div>
                <div>
                  <Label>Banner Ad Unit ID</Label>
                  <Input value={ADMOB_CONFIG.bannerAdUnitId} readOnly />
                </div>
                <div>
                  <Label>Interstitial Ad Unit ID</Label>
                  <Input value={ADMOB_CONFIG.interstitialAdUnitId} readOnly />
                </div>
                <div>
                  <Label>Rewarded Ad Unit ID</Label>
                  <Input value={ADMOB_CONFIG.rewardedAdUnitId} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">AdMob Campaigns</h2>
            <Button onClick={() => setShowCreateAd(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>

          <div className="grid gap-4">
            {ads.map((ad) => (
              <Card key={ad.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center space-x-3">
                    {getAdTypeIcon(ad.type)}
                    <div>
                      <CardTitle className="text-lg">{ad.name}</CardTitle>
                      <CardDescription>
                        {ad.startDate} {ad.endDate ? `- ${ad.endDate}` : ''}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(ad.status)} text-white`}>
                    {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="font-medium">{formatNumber(ad.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="font-medium">{formatNumber(ad.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="font-medium">{formatCurrency(ad.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CTR</p>
                      <p className="font-medium">{ad.ctr}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CPM</p>
                      <p className="font-medium">{formatCurrency(ad.cpm)}</p>
                    </div>
                  </div>
                </CardContent>
                <CardContent className="flex justify-end space-x-2 border-t pt-4">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {ad.status === 'active' && (
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  {ad.status === 'paused' && (
                    <Button variant="outline" size="sm" className="text-green-600">
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-xl font-semibold">AdMob Analytics</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue Performance</CardTitle>
              <CardDescription>Daily revenue trends over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chart visualization would appear here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total Revenue: {formatCurrency(analytics.totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ad Type Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ads.map((ad) => (
                    <div key={ad.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {getAdTypeIcon(ad.type)}
                        <span className="font-medium">{ad.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(ad.revenue)}</p>
                        <p className="text-sm text-muted-foreground">{ad.ctr}% CTR</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average CTR</span>
                    <span className="font-medium">{analytics.avgCTR}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average CPM</span>
                    <span className="font-medium">{formatCurrency(analytics.avgCPM)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Impressions</span>
                    <span className="font-medium">{formatNumber(analytics.totalImpressions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Clicks</span>
                    <span className="font-medium">{formatNumber(analytics.totalClicks)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-xl font-semibold">AdMob Settings</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>AdMob Configuration</CardTitle>
              <CardDescription>Manage your AdMob integration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">AdMob Integration</p>
                  <p className="text-sm text-muted-foreground">Enable or disable AdMob ads</p>
                </div>
                <Switch checked={isAdMobEnabled} onCheckedChange={setIsAdMobEnabled} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Test Mode</p>
                  <p className="text-sm text-muted-foreground">Show test ads instead of real ads</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-refresh</p>
                  <p className="text-sm text-muted-foreground">Automatically refresh banner ads</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ad Placement Settings</CardTitle>
              <CardDescription>Configure where ads appear in your app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Banner Ad Frequency</Label>
                  <Select defaultValue="every-5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="every-3">Every 3 screens</SelectItem>
                      <SelectItem value="every-5">Every 5 screens</SelectItem>
                      <SelectItem value="every-10">Every 10 screens</SelectItem>
                      <SelectItem value="manual">Manual placement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Interstitial Ad Frequency</Label>
                  <Select defaultValue="every-10">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="every-5">Every 5 screens</SelectItem>
                      <SelectItem value="every-10">Every 10 screens</SelectItem>
                      <SelectItem value="every-15">Every 15 screens</SelectItem>
                      <SelectItem value="manual">Manual placement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 