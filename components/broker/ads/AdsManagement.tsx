'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Plus, Trash2, Edit, Eye, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react'

// Mock data for campaigns
const mockCampaigns = [
  { 
    id: 1, 
    name: 'New Investor Onboarding', 
    objective: 'Acquisition',
    status: 'Active', 
    budget: 1500000, 
    spent: 750000, 
    impressions: 45000, 
    clicks: 3200, 
    conversions: 180,
    startDate: '2025-03-15',
    endDate: '2025-04-30'
  },
  { 
    id: 2, 
    name: 'Premium Trading Features', 
    objective: 'Engagement',
    status: 'Active', 
    budget: 2000000, 
    spent: 1200000, 
    impressions: 62000, 
    clicks: 5100, 
    conversions: 320,
    startDate: '2025-03-01',
    endDate: '2025-05-15'
  },
  { 
    id: 3, 
    name: 'DSE Market Insights', 
    objective: 'Awareness',
    status: 'Paused', 
    budget: 800000, 
    spent: 350000, 
    impressions: 28000, 
    clicks: 1800, 
    conversions: 95,
    startDate: '2025-02-20',
    endDate: '2025-04-20'
  },
  { 
    id: 4, 
    name: 'Retirement Planning Services', 
    objective: 'Conversion',
    status: 'Draft', 
    budget: 1200000, 
    spent: 0, 
    impressions: 0, 
    clicks: 0, 
    conversions: 0,
    startDate: '2025-05-01',
    endDate: '2025-06-30'
  },
]

// Mock data for analytics
const performanceData = [
  { day: 'Mon', impressions: 5200, clicks: 420, conversions: 28 },
  { day: 'Tue', impressions: 6100, clicks: 510, conversions: 32 },
  { day: 'Wed', impressions: 7800, clicks: 620, conversions: 41 },
  { day: 'Thu', impressions: 8400, clicks: 680, conversions: 45 },
  { day: 'Fri', impressions: 9200, clicks: 740, conversions: 52 },
  { day: 'Sat', impressions: 7500, clicks: 580, conversions: 38 },
  { day: 'Sun', impressions: 6300, clicks: 490, conversions: 30 },
]

const channelData = [
  { name: 'Mobile App', value: 45 },
  { name: 'Website', value: 30 },
  { name: 'Email', value: 15 },
  { name: 'Social Media', value: 10 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AdsManagement() {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null)
  const [analyticsView, setAnalyticsView] = useState('performance')

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return `TZS ${(amount).toLocaleString()}`
  }

  // Function to calculate CTR (Click-Through Rate)
  const calculateCTR = (clicks: number, impressions: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) + '%' : '0%'
  }

  // Function to calculate conversion rate
  const calculateConversionRate = (conversions: number, clicks: number) => {
    return clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) + '%' : '0%'
  }

  // Function to calculate ROI
  const calculateROI = (campaign: any) => {
    // Assuming each conversion is worth TZS 50,000 on average
    const conversionValue = campaign.conversions * 50000
    return campaign.spent > 0 
      ? ((conversionValue - campaign.spent) / campaign.spent * 100).toFixed(2) + '%' 
      : '0%'
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border rounded-lg p-1 mb-4">
          <TabsTrigger 
            value="campaigns"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
          >
            Campaigns
          </TabsTrigger>
          <TabsTrigger 
            value="create"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
          >
            Create Ad
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Ad Campaigns</h2>
            <Button 
              onClick={() => {
                setShowNewCampaign(true)
                setActiveTab('create')
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>

          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Active Campaigns</h3>
                <p className="text-2xl font-bold">{mockCampaigns.filter(c => c.status === 'Active').length}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Budget</h3>
                <p className="text-2xl font-bold">{formatCurrency(mockCampaigns.reduce((sum, c) => sum + c.budget, 0))}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Conversions</h3>
                <p className="text-2xl font-bold">{mockCampaigns.reduce((sum, c) => sum + c.conversions, 0)}</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Objective</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Conv. Rate</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCampaigns.map(campaign => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{campaign.objective}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        campaign.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : campaign.status === 'Paused' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(campaign.budget)}</TableCell>
                    <TableCell>{formatCurrency(campaign.spent)}</TableCell>
                    <TableCell>{campaign.impressions.toLocaleString()}</TableCell>
                    <TableCell>{calculateCTR(campaign.clicks, campaign.impressions)}</TableCell>
                    <TableCell>{calculateConversionRate(campaign.conversions, campaign.clicks)}</TableCell>
                    <TableCell>{calculateROI(campaign)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Create Ad Tab */}
        <TabsContent value="create" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Create New Ad Campaign</h2>
            {showNewCampaign && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewCampaign(false)
                  setActiveTab('campaigns')
                }}
              >
                Back to Campaigns
              </Button>
            )}
          </div>

          <Card className="p-6">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input id="campaign-name" placeholder="Enter campaign name" />
                  </div>
                  
                  <div>
                    <Label htmlFor="objective">Campaign Objective</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select objective" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">Brand Awareness</SelectItem>
                        <SelectItem value="acquisition">Client Acquisition</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="conversion">Conversion</SelectItem>
                        <SelectItem value="retention">Client Retention</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="ad-format">Ad Format</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ad format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner Ad</SelectItem>
                        <SelectItem value="interstitial">Interstitial</SelectItem>
                        <SelectItem value="native">Native Ad</SelectItem>
                        <SelectItem value="video">Video Ad</SelectItem>
                        <SelectItem value="carousel">Carousel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="ad-text">Ad Text</Label>
                    <Textarea id="ad-text" placeholder="Enter your ad copy here" rows={4} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target-audience">Target Audience</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new-investors">New Investors</SelectItem>
                        <SelectItem value="active-traders">Active Traders</SelectItem>
                        <SelectItem value="high-net-worth">High Net Worth Individuals</SelectItem>
                        <SelectItem value="institutional">Institutional Clients</SelectItem>
                        <SelectItem value="retirement">Retirement Planners</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input id="start-date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input id="end-date" type="date" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="budget">Budget (TZS)</Label>
                    <Input id="budget" type="number" placeholder="Enter budget amount" />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-4">
                    <Switch id="auto-optimize" />
                    <Label htmlFor="auto-optimize">Enable auto-optimization</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="conversion-tracking" />
                    <Label htmlFor="conversion-tracking">Enable conversion tracking</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button variant="outline" type="button">Save as Draft</Button>
                <Button type="button">Launch Campaign</Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Campaign Analytics</h2>
            <div className="flex space-x-2">
              <Button 
                variant={analyticsView === 'performance' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setAnalyticsView('performance')}
              >
                <LineChartIcon className="h-4 w-4 mr-2" />
                Performance
              </Button>
              <Button 
                variant={analyticsView === 'channels' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setAnalyticsView('channels')}
              >
                <PieChartIcon className="h-4 w-4 mr-2" />
                Channels
              </Button>
              <Button 
                variant={analyticsView === 'objectives' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setAnalyticsView('objectives')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Objectives
              </Button>
            </div>
          </div>

          <Card className="p-6">
            {analyticsView === 'performance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Campaign Performance</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="impressions" stroke="#8884d8" name="Impressions" />
                      <Line type="monotone" dataKey="clicks" stroke="#82ca9d" name="Clicks" />
                      <Line type="monotone" dataKey="conversions" stroke="#ffc658" name="Conversions" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Impressions</h3>
                    <p className="text-2xl font-bold">{performanceData.reduce((sum, d) => sum + d.impressions, 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Clicks</h3>
                    <p className="text-2xl font-bold">{performanceData.reduce((sum, d) => sum + d.clicks, 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Conversions</h3>
                    <p className="text-2xl font-bold">{performanceData.reduce((sum, d) => sum + d.conversions, 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Conversion Rate</h3>
                    <p className="text-2xl font-bold">
                      {calculateConversionRate(
                        performanceData.reduce((sum, d) => sum + d.conversions, 0),
                        performanceData.reduce((sum, d) => sum + d.clicks, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {analyticsView === 'channels' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Distribution by Channel</h3>
                <div className="h-[400px] flex justify-center">
                  <ResponsiveContainer width="80%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {channelData.map((channel, index) => (
                    <div key={channel.name} className="bg-muted/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <h3 className="text-sm font-medium">{channel.name}</h3>
                      </div>
                      <p className="text-2xl font-bold mt-1">{channel.value}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {analyticsView === 'objectives' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Performance by Objective</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Awareness', value: 85 },
                        { name: 'Acquisition', value: 72 },
                        { name: 'Engagement', value: 91 },
                        { name: 'Conversion', value: 64 },
                        { name: 'Retention', value: 78 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" name="Performance Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-muted/20 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Objective Performance Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    Engagement campaigns are currently performing the best with a score of 91/100, 
                    followed by Awareness (85/100) and Retention (78/100). Conversion campaigns 
                    have the most room for improvement at 64/100.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
