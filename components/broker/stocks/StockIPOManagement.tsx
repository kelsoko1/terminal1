'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { Progress } from '@/components/ui/progress'
import { Calendar, Plus, FileText, Users, DollarSign, Clock, CheckCircle, AlertCircle, Eye, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface IPO {
  id: string
  companyName: string
  symbol: string
  sector: string
  offerPrice: number
  totalShares: number
  offerValue: number
  subscriptionStart: string
  subscriptionEnd: string
  listingDate: string
  status: 'upcoming' | 'active' | 'closed' | 'listed' | 'pending' | 'completed' | 'rejected'
  leadBroker: string
  description: string
  subscriptionRate?: number
  allotmentDate?: string
  refundDate?: string
  sharesOffered?: number
  announcementDate?: string
  subscriptionStartDate?: string
  subscriptionEndDate?: string
}

const mockIPOs: IPO[] = [
  {
    id: 'IPO-2025-001',
    companyName: 'Tanzania Telecommunications Corporation',
    symbol: 'TTC',
    sector: 'Telecommunications',
    offerPrice: 750,
    totalShares: 25000000,
    offerValue: 18750000000,
    subscriptionStart: '2025-05-01',
    subscriptionEnd: '2025-05-15',
    listingDate: '2025-05-30',
    status: 'upcoming',
    leadBroker: 'Tanzania Securities Limited',
    description: 'Tanzania Telecommunications Corporation is offering 25% of its shares to the public through an IPO on the Dar es Salaam Stock Exchange.'
  },
  {
    id: 'IPO-2025-002',
    companyName: 'Kilimanjaro Bottlers Limited',
    symbol: 'KBL',
    sector: 'Consumer Goods',
    offerPrice: 1200,
    totalShares: 15000000,
    offerValue: 18000000000,
    subscriptionStart: '2025-04-10',
    subscriptionEnd: '2025-04-25',
    listingDate: '2025-05-10',
    status: 'active',
    leadBroker: 'Orbit Securities Co. Ltd',
    description: 'Kilimanjaro Bottlers Limited is a leading beverage manufacturer in Tanzania offering shares to the public for expansion.',
    subscriptionRate: 65
  },
  {
    id: 'IPO-2024-005',
    companyName: 'East African Mining Corporation',
    symbol: 'EAMC',
    sector: 'Mining',
    offerPrice: 950,
    totalShares: 20000000,
    offerValue: 19000000000,
    subscriptionStart: '2024-11-15',
    subscriptionEnd: '2024-12-05',
    listingDate: '2024-12-20',
    status: 'closed',
    leadBroker: 'Tanzania Securities Limited',
    description: 'East African Mining Corporation is a gold and copper mining company with operations across East Africa.',
    subscriptionRate: 120,
    allotmentDate: '2024-12-10',
    refundDate: '2024-12-12'
  },
  {
    id: 'IPO-2024-004',
    companyName: 'Serengeti Insurance Company',
    symbol: 'SIC',
    sector: 'Financial Services',
    offerPrice: 500,
    totalShares: 30000000,
    offerValue: 15000000000,
    subscriptionStart: '2024-09-01',
    subscriptionEnd: '2024-09-20',
    listingDate: '2024-10-05',
    status: 'listed',
    leadBroker: 'Core Securities Ltd',
    description: 'Serengeti Insurance Company is a leading provider of insurance services in Tanzania and East Africa.',
    subscriptionRate: 95,
    allotmentDate: '2024-09-25',
    refundDate: '2024-09-28'
  },
  {
    id: 'IPO-2024-003',
    companyName: 'Coastal Petroleum Tanzania',
    symbol: 'CPT',
    sector: 'Energy',
    offerPrice: 1500,
    totalShares: 10000000,
    offerValue: 15000000000,
    subscriptionStart: '2024-07-10',
    subscriptionEnd: '2024-07-30',
    listingDate: '2024-08-15',
    status: 'listed',
    leadBroker: 'Vertex International Securities',
    description: 'Coastal Petroleum Tanzania is an oil and gas exploration and production company with operations along the Tanzanian coast.',
    subscriptionRate: 110,
    allotmentDate: '2024-08-05',
    refundDate: '2024-08-08'
  },
  {
    id: 'IPO-2024-002',
    companyName: 'New Company Ltd',
    symbol: 'NCL',
    sector: 'Technology',
    offerPrice: 1000,
    totalShares: 1000000,
    offerValue: 1000000000,
    subscriptionStart: '2024-06-01',
    subscriptionEnd: '2024-06-15',
    listingDate: '2024-06-30',
    status: 'pending',
    leadBroker: 'Tanzania Securities Limited',
    description: 'New Company Ltd is a technology company offering shares to the public for expansion.',
    sharesOffered: 1000000,
    announcementDate: '2024-05-15',
    subscriptionStartDate: '2024-06-01',
    subscriptionEndDate: '2024-06-15'
  }
]

export function StockIPOManagement() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddIPODialog, setShowAddIPODialog] = useState(false)
  const [selectedIPO, setSelectedIPO] = useState<IPO | null>(null)
  const [showIPODetailsDialog, setShowIPODetailsDialog] = useState(false)
  const { toast } = useToast()
  
  // Filter IPOs based on active tab
  const filteredIPOs = mockIPOs.filter(ipo => {
    if (activeTab === 'all') return true
    return ipo.status === activeTab
  })
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `TZS ${amount.toLocaleString()}`
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Handle view IPO details
  const handleViewIPODetails = (ipo: IPO) => {
    setSelectedIPO(ipo)
    setShowIPODetailsDialog(true)
  }
  
  // Handle approve IPO
  const handleApproveIPO = (ipo: IPO) => {
    // In a real app, this would call an API to approve the IPO
    toast({
      title: "IPO Approved",
      description: `${ipo.companyName} IPO has been approved.`,
    })
  }
  
  // Handle reject IPO
  const handleRejectIPO = (ipo: IPO) => {
    // In a real app, this would call an API to reject the IPO
    toast({
      title: "IPO Rejected",
      description: `${ipo.companyName} IPO has been rejected.`,
    })
  }
  
  // Handle create new IPO
  const handleCreateIPO = (formData: any) => {
    // In a real app, this would call an API to create a new IPO
    toast({
      title: "IPO Created",
      description: `${formData.companyName} IPO has been created.`,
    })
    setShowAddIPODialog(false)
  }
  
  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> }
      case 'active':
        return { variant: 'default', icon: <AlertCircle className="h-3 w-3 mr-1" /> }
      case 'closed':
        return { variant: 'outline', icon: <CheckCircle className="h-3 w-3 mr-1" /> }
      case 'listed':
        return { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> }
      case 'pending':
        return { variant: 'warning', icon: <AlertCircle className="h-3 w-3 mr-1" /> }
      case 'completed':
        return { variant: 'success', icon: <CheckCircle className="h-3 w-3 mr-1" /> }
      case 'rejected':
        return { variant: 'destructive', icon: <X className="h-3 w-3 mr-1" /> }
      default:
        return { variant: 'outline', icon: null }
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Initial Public Offerings (IPOs)</h3>
        
        <Dialog open={showAddIPODialog} onOpenChange={setShowAddIPODialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowAddIPODialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New IPO
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New IPO</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="companyName" className="text-right">Company Name</Label>
                <Input id="companyName" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="symbol" className="text-right">Symbol</Label>
                <Input id="symbol" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sector" className="text-right">Sector</Label>
                <Input id="sector" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="offerPrice" className="text-right">Offer Price</Label>
                <Input id="offerPrice" type="number" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="totalShares" className="text-right">Total Shares</Label>
                <Input id="totalShares" type="number" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subscriptionStart" className="text-right">Start Date</Label>
                <div className="col-span-3">
                  <DatePicker placeholder="Select start date" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subscriptionEnd" className="text-right">End Date</Label>
                <div className="col-span-3">
                  <DatePicker placeholder="Select end date" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="listingDate" className="text-right">Listing Date</Label>
                <div className="col-span-3">
                  <DatePicker placeholder="Select listing date" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leadBroker" className="text-right">Lead Broker</Label>
                <Input id="leadBroker" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">Description</Label>
                <Textarea id="description" className="col-span-3" rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit"
                onClick={() => {
                  // Mock form data
                  const formData = {
                    companyName: 'New Company Ltd',
                    symbol: 'NCL',
                    offerPrice: 1000,
                    sharesOffered: 1000000
                  }
                  handleCreateIPO(formData)
                }}
              >
                Create IPO
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="p-4">
        <h3 className="font-semibold mb-4">IPO Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total IPOs</p>
            <p className="text-2xl font-semibold">{mockIPOs.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active IPOs</p>
            <p className="text-2xl font-semibold">{mockIPOs.filter(ipo => ipo.status === 'active').length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Upcoming IPOs</p>
            <p className="text-2xl font-semibold">{mockIPOs.filter(ipo => ipo.status === 'upcoming').length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Offer Value</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(mockIPOs.reduce((sum, ipo) => sum + ipo.offerValue, 0) / 1000000000)}B
            </p>
          </div>
        </div>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All IPOs</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          <TabsTrigger value="listed">Listed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Symbol</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead className="text-right">Offer Price</TableHead>
            <TableHead className="text-right">Total Shares</TableHead>
            <TableHead className="text-right">Offer Value</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredIPOs.map((ipo) => (
            <TableRow key={ipo.id}>
              <TableCell className="font-medium">{ipo.symbol}</TableCell>
              <TableCell>{ipo.companyName}</TableCell>
              <TableCell>{ipo.sector}</TableCell>
              <TableCell className="text-right">{formatCurrency(ipo.offerPrice)}</TableCell>
              <TableCell className="text-right">{ipo.totalShares.toLocaleString()}</TableCell>
              <TableCell className="text-right">{formatCurrency(ipo.offerValue)}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">
                    {formatDate(ipo.subscriptionStart)} - {formatDate(ipo.subscriptionEnd)}
                  </div>
                  {ipo.subscriptionRate && (
                    <div className="w-full">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{ipo.subscriptionRate}% Subscribed</span>
                      </div>
                      <Progress value={Math.min(ipo.subscriptionRate, 100)} className="h-2" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={getStatusBadge(ipo.status).variant as any} 
                  className="flex items-center"
                >
                  {getStatusBadge(ipo.status).icon}
                  {ipo.status.charAt(0).toUpperCase() + ipo.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewIPODetails(ipo)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {ipo.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleApproveIPO(ipo)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRejectIPO(ipo)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* IPO Details Dialog */}
      {selectedIPO && (
        <Dialog open={showIPODetailsDialog} onOpenChange={setShowIPODetailsDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>IPO Details: {selectedIPO.companyName}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Company Information</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Symbol:</span>
                      <span className="font-medium">{selectedIPO.symbol}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Sector:</span>
                      <span className="font-medium">{selectedIPO.sector}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Offer Price:</span>
                      <span className="font-medium">{formatCurrency(selectedIPO.offerPrice)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Shares Offered:</span>
                      <span className="font-medium">{selectedIPO.totalShares.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Total Value:</span>
                      <span className="font-medium">{formatCurrency(selectedIPO.offerPrice * selectedIPO.totalShares)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">IPO Timeline</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={selectedIPO.status === 'completed' ? 'success' : selectedIPO.status === 'rejected' ? 'destructive' : 'outline'}>
                        {selectedIPO.status.charAt(0).toUpperCase() + selectedIPO.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Announcement:</span>
                      <span className="font-medium">{formatDate(selectedIPO.subscriptionStart)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Subscription:</span>
                      <span className="font-medium">{formatDate(selectedIPO.subscriptionStart)} - {formatDate(selectedIPO.subscriptionEnd)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Allotment:</span>
                      <span className="font-medium">{selectedIPO.allotmentDate}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Listing:</span>
                      <span className="font-medium">{formatDate(selectedIPO.listingDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Subscription Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subscription Rate:</span>
                    <span className="font-medium">{selectedIPO.subscriptionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${Math.min(selectedIPO.subscriptionRate, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              {selectedIPO.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => {
                    handleRejectIPO(selectedIPO)
                    setShowIPODetailsDialog(false)
                  }}>
                    Reject IPO
                  </Button>
                  <Button onClick={() => {
                    handleApproveIPO(selectedIPO)
                    setShowIPODetailsDialog(false)
                  }}>
                    Approve IPO
                  </Button>
                </div>
              )}
              {selectedIPO.status !== 'pending' && (
                <Button onClick={() => setShowIPODetailsDialog(false)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
