'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowUpDown, Plus, Edit, BarChart2, ArrowUp, ArrowDown, Search } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'

interface Stock {
  id: string
  symbol: string
  name: string
  sector: string
  currentPrice: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  status: 'active' | 'suspended' | 'delisted'
  lastUpdated: string
}

const mockStocks: Stock[] = [
  {
    id: '1',
    symbol: 'CRDB',
    name: 'CRDB Bank PLC',
    sector: 'Banking',
    currentPrice: 385,
    change: 5,
    changePercent: 1.32,
    volume: 125000,
    marketCap: 1005000000,
    status: 'active',
    lastUpdated: '2025-04-12T09:45:00Z'
  },
  {
    id: '2',
    symbol: 'TBL',
    name: 'Tanzania Breweries Limited',
    sector: 'Consumer Goods',
    currentPrice: 10850,
    change: -150,
    changePercent: -1.36,
    volume: 32500,
    marketCap: 3210000000,
    status: 'active',
    lastUpdated: '2025-04-12T09:45:00Z'
  },
  {
    id: '3',
    symbol: 'NMB',
    name: 'NMB Bank PLC',
    sector: 'Banking',
    currentPrice: 2950,
    change: 50,
    changePercent: 1.72,
    volume: 85000,
    marketCap: 1475000000,
    status: 'active',
    lastUpdated: '2025-04-12T09:45:00Z'
  },
  {
    id: '4',
    symbol: 'TPCC',
    name: 'Tanzania Portland Cement Company',
    sector: 'Manufacturing',
    currentPrice: 4200,
    change: 0,
    changePercent: 0,
    volume: 18500,
    marketCap: 756000000,
    status: 'active',
    lastUpdated: '2025-04-12T09:45:00Z'
  },
  {
    id: '5',
    symbol: 'TCC',
    name: 'Tanzania Cigarette Company',
    sector: 'Consumer Goods',
    currentPrice: 17000,
    change: 200,
    changePercent: 1.19,
    volume: 12000,
    marketCap: 1700000000,
    status: 'active',
    lastUpdated: '2025-04-12T09:45:00Z'
  },
  {
    id: '6',
    symbol: 'SWIS',
    name: 'Swissport Tanzania PLC',
    sector: 'Services',
    currentPrice: 1320,
    change: -30,
    changePercent: -2.22,
    volume: 9500,
    marketCap: 475200000,
    status: 'active',
    lastUpdated: '2025-04-12T09:45:00Z'
  },
  {
    id: '7',
    symbol: 'DSE',
    name: 'Dar es Salaam Stock Exchange PLC',
    sector: 'Financial Services',
    currentPrice: 1800,
    change: 20,
    changePercent: 1.12,
    volume: 7500,
    marketCap: 396000000,
    status: 'active',
    lastUpdated: '2025-04-12T09:45:00Z'
  },
  {
    id: '8',
    symbol: 'EABL',
    name: 'East African Breweries Limited',
    sector: 'Consumer Goods',
    currentPrice: 5400,
    change: -80,
    changePercent: -1.46,
    volume: 22000,
    marketCap: 1080000000,
    status: 'active',
    lastUpdated: '2025-04-12T09:45:00Z'
  },
  {
    id: '9',
    symbol: 'JHL',
    name: 'Jubilee Holdings Limited',
    sector: 'Insurance',
    currentPrice: 12500,
    change: 150,
    changePercent: 1.21,
    volume: 5000,
    marketCap: 906250000,
    status: 'active',
    lastUpdated: '2025-04-12T09:45:00Z'
  },
  {
    id: '10',
    symbol: 'KCB',
    name: 'KCB Group PLC',
    sector: 'Banking',
    currentPrice: 890,
    change: 10,
    changePercent: 1.14,
    volume: 45000,
    marketCap: 2853000000,
    status: 'active',
    lastUpdated: '2025-04-12T09:45:00Z'
  }
]

export function StockListing() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [showAddStockDialog, setShowAddStockDialog] = useState(false)
  const [sortColumn, setSortColumn] = useState('symbol')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [showEditStockDialog, setShowEditStockDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const { toast } = useToast()
  
  // Get unique sectors for filtering
  const sectors = Array.from(new Set(mockStocks.map(stock => stock.sector)))
  
  // Filter stocks based on search term and sector filter
  const filteredStocks = mockStocks.filter(stock => {
    const matchesSearch = 
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSector = sectorFilter === 'all' || stock.sector === sectorFilter
    
    return matchesSearch && matchesSector
  })
  
  // Sort stocks based on selected column and direction
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    const aValue = a[sortColumn as keyof Stock]
    const bValue = b[sortColumn as keyof Stock]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue)
    } else {
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number)
    }
  })
  
  // Handle sort column change
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `TZS ${amount.toLocaleString()}`
  }
  
  // Format market cap in billions/millions
  const formatMarketCap = (amount: number) => {
    if (amount >= 1000000000) {
      return `TZS ${(amount / 1000000000).toFixed(2)}B`
    } else {
      return `TZS ${(amount / 1000000).toFixed(2)}M`
    }
  }
  
  // Handle edit stock
  const handleEditStock = (stock: Stock) => {
    setSelectedStock(stock)
    setShowEditStockDialog(true)
  }
  
  // Handle stock analytics
  const handleStockAnalytics = (stock: Stock) => {
    setSelectedStock(stock)
    setShowAnalyticsDialog(true)
  }
  
  // Handle add new stock
  const handleAddStock = (formData: any) => {
    // In a real app, this would call an API to add the stock
    toast({
      title: "Stock Added",
      description: `${formData.symbol} has been added successfully.`,
    })
    setShowAddStockDialog(false)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stocks..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={sectorFilter}
            onValueChange={setSectorFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={showAddStockDialog} onOpenChange={setShowAddStockDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowAddStockDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Stock Listing</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="symbol" className="text-right">Symbol</Label>
                <Input id="symbol" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Company Name</Label>
                <Input id="name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sector" className="text-right">Sector</Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                    <SelectItem value="new">Add New Sector</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Initial Price</Label>
                <Input id="price" type="number" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="marketCap" className="text-right">Market Cap</Label>
                <Input id="marketCap" type="number" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit"
                onClick={() => {
                  // Mock form data
                  const formData = {
                    symbol: 'NEW',
                    name: 'New Stock',
                    sector: 'Technology',
                    price: 1000,
                    marketCap: 500000000
                  }
                  handleAddStock(formData)
                }}
              >
                Add Stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort('symbol')}>
              <div className="flex items-center">
                Symbol
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
              <div className="flex items-center">
                Company Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('sector')}>
              <div className="flex items-center">
                Sector
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('currentPrice')}>
              <div className="flex items-center justify-end">
                Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('changePercent')}>
              <div className="flex items-center justify-end">
                Change
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('volume')}>
              <div className="flex items-center justify-end">
                Volume
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('marketCap')}>
              <div className="flex items-center justify-end">
                Market Cap
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStocks.map((stock) => (
            <TableRow key={stock.id}>
              <TableCell className="font-medium">{stock.symbol}</TableCell>
              <TableCell>{stock.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{stock.sector}</Badge>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(stock.currentPrice)}</TableCell>
              <TableCell className="text-right">
                <div className={`flex items-center justify-end ${stock.change > 0 ? 'text-green-600' : stock.change < 0 ? 'text-red-600' : ''}`}>
                  {stock.change > 0 ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : stock.change < 0 ? (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  ) : null}
                  {stock.change > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
              </TableCell>
              <TableCell className="text-right">{stock.volume.toLocaleString()}</TableCell>
              <TableCell className="text-right">{formatMarketCap(stock.marketCap)}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditStock(stock)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStockAnalytics(stock)}
                  >
                    <BarChart2 className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Edit Stock Dialog */}
      {selectedStock && (
        <Dialog open={showEditStockDialog} onOpenChange={setShowEditStockDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Stock: {selectedStock.symbol}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Company Name</Label>
                <Input id="edit-name" className="col-span-3" defaultValue={selectedStock.name} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sector" className="text-right">Sector</Label>
                <Input id="edit-sector" className="col-span-3" defaultValue={selectedStock.sector} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">Current Price</Label>
                <Input id="edit-price" type="number" className="col-span-3" defaultValue={selectedStock.currentPrice} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-marketCap" className="text-right">Market Cap</Label>
                <Input id="edit-marketCap" type="number" className="col-span-3" defaultValue={selectedStock.marketCap} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditStockDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast({
                  title: "Stock Updated",
                  description: `${selectedStock.symbol} has been updated successfully.`,
                })
                setShowEditStockDialog(false)
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Analytics Dialog */}
      {selectedStock && (
        <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{selectedStock.symbol} - Analytics</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">{selectedStock.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedStock.sector}</Badge>
                  <span className={`flex items-center ${selectedStock.change > 0 ? 'text-green-600' : selectedStock.change < 0 ? 'text-red-600' : ''}`}>
                    {selectedStock.change > 0 ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : selectedStock.change < 0 ? (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    ) : null}
                    {selectedStock.change > 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Price Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current Price:</span>
                      <span className="font-medium">{formatCurrency(selectedStock.currentPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Daily Change:</span>
                      <span className={`font-medium ${selectedStock.change > 0 ? 'text-green-600' : selectedStock.change < 0 ? 'text-red-600' : ''}`}>
                        {selectedStock.change > 0 ? '+' : ''}{formatCurrency(selectedStock.change)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Market Cap:</span>
                      <span className="font-medium">{formatMarketCap(selectedStock.marketCap)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Trading Volume:</span>
                      <span className="font-medium">{selectedStock.volume.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Performance</h4>
                  <div className="h-[150px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart2 className="h-16 w-16 mx-auto mb-2 opacity-50" />
                      <p>Performance chart would appear here</p>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowAnalyticsDialog(false)
                    toast({
                      title: "Report Generated",
                      description: `${selectedStock.symbol} performance report has been generated.`,
                    })
                  }}>
                    Generate Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowAnalyticsDialog(false)
                    toast({
                      title: "Alert Set",
                      description: `Price alert for ${selectedStock.symbol} has been set.`,
                    })
                  }}>
                    Set Price Alert
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowAnalyticsDialog(false)
                    toast({
                      title: "Added to Watchlist",
                      description: `${selectedStock.symbol} has been added to your watchlist.`,
                    })
                  }}>
                    Add to Watchlist
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
