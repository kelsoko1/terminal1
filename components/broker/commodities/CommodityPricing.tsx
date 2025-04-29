'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  ArrowUpDown, 
  BarChart3, 
  Download, 
  RefreshCw, 
  Search, 
  TrendingUp, 
  Upload 
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PriceHistory {
  date: string
  price: number
  change: number
}

interface CommodityPrice {
  id: string
  commodityId: string
  name: string
  symbol: string
  category: string
  currentPrice: number
  unit: string
  change24h: number
  change7d: number
  volume24h: number
  lastUpdated: string
  source: 'manual' | 'api' | 'exchange'
  history: PriceHistory[]
}

// Mock data for commodity prices
const mockPrices: CommodityPrice[] = [
  {
    id: 'p1',
    commodityId: 'c1',
    name: 'Cashew Nuts',
    symbol: 'CASH',
    category: 'agricultural',
    currentPrice: 2850,
    unit: 'kg',
    change24h: 1.2,
    change7d: 3.5,
    volume24h: 25000,
    lastUpdated: '2025-04-12T08:30:00Z',
    source: 'exchange',
    history: [
      { date: '2025-04-11', price: 2816, change: 0.8 },
      { date: '2025-04-10', price: 2794, change: -0.3 },
      { date: '2025-04-09', price: 2802, change: 1.5 },
      { date: '2025-04-08', price: 2760, change: 0.2 },
      { date: '2025-04-07', price: 2755, change: -0.5 }
    ]
  },
  {
    id: 'p2',
    commodityId: 'c2',
    name: 'Coffee (Arabica)',
    symbol: 'COFA',
    category: 'agricultural',
    currentPrice: 7500,
    unit: 'kg',
    change24h: 2.5,
    change7d: 5.2,
    volume24h: 15000,
    lastUpdated: '2025-04-12T08:30:00Z',
    source: 'exchange',
    history: [
      { date: '2025-04-11', price: 7317, change: 1.2 },
      { date: '2025-04-10', price: 7230, change: 0.8 },
      { date: '2025-04-09', price: 7172, change: 2.1 },
      { date: '2025-04-08', price: 7025, change: 0.5 },
      { date: '2025-04-07', price: 6990, change: 0.3 }
    ]
  },
  {
    id: 'p3',
    commodityId: 'c5',
    name: 'Gold',
    symbol: 'GOLD',
    category: 'metals',
    currentPrice: 2850000,
    unit: 'oz',
    change24h: 0.3,
    change7d: -1.2,
    volume24h: 500,
    lastUpdated: '2025-04-12T08:30:00Z',
    source: 'api',
    history: [
      { date: '2025-04-11', price: 2841450, change: 0.1 },
      { date: '2025-04-10', price: 2838600, change: -0.5 },
      { date: '2025-04-09', price: 2852800, change: -0.3 },
      { date: '2025-04-08', price: 2861400, change: -0.2 },
      { date: '2025-04-07', price: 2867100, change: -0.3 }
    ]
  },
  {
    id: 'p4',
    commodityId: 'c10',
    name: 'Tanzanite',
    symbol: 'TANZ',
    category: 'specialty',
    currentPrice: 1250000,
    unit: 'carat',
    change24h: 0.1,
    change7d: 2.8,
    volume24h: 100,
    lastUpdated: '2025-04-12T08:30:00Z',
    source: 'manual',
    history: [
      { date: '2025-04-11', price: 1248750, change: 0.0 },
      { date: '2025-04-10', price: 1248750, change: 0.5 },
      { date: '2025-04-09', price: 1242500, change: 1.0 },
      { date: '2025-04-08', price: 1230250, change: 0.8 },
      { date: '2025-04-07', price: 1220500, change: 0.5 }
    ]
  },
  {
    id: 'p5',
    commodityId: 'c9',
    name: 'Natural Gas',
    symbol: 'NGAS',
    category: 'energy',
    currentPrice: 12500,
    unit: 'MMBtu',
    change24h: 3.2,
    change7d: 8.5,
    volume24h: 5000,
    lastUpdated: '2025-04-12T08:30:00Z',
    source: 'api',
    history: [
      { date: '2025-04-11', price: 12112, change: 2.1 },
      { date: '2025-04-10', price: 11863, change: 1.5 },
      { date: '2025-04-09', price: 11688, change: 2.2 },
      { date: '2025-04-08', price: 11437, change: 1.8 },
      { date: '2025-04-07', price: 11234, change: 0.9 }
    ]
  }
]

export function CommodityPricing() {
  const [prices, setPrices] = useState<CommodityPrice[]>(mockPrices)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{ key: keyof CommodityPrice; direction: 'asc' | 'desc' } | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<CommodityPrice | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  // Sort function for prices
  const sortedPrices = [...prices].sort((a, b) => {
    if (!sortConfig) return 0
    
    const { key, direction } = sortConfig
    if (a[key] < b[key]) {
      return direction === 'asc' ? -1 : 1
    }
    if (a[key] > b[key]) {
      return direction === 'asc' ? 1 : -1
    }
    return 0
  })

  // Filter prices based on search term and category
  const filteredPrices = sortedPrices.filter(price => {
    const matchesSearch = 
      price.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || price.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Handle sort request
  const requestSort = (key: keyof CommodityPrice) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Start editing a price
  const startEditing = (price: CommodityPrice) => {
    setEditingId(price.id)
    setEditValue(price.currentPrice.toString())
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null)
    setEditValue('')
  }

  // Save edited price
  const savePrice = (id: string) => {
    const newPrice = parseFloat(editValue)
    if (isNaN(newPrice) || newPrice <= 0) {
      alert('Please enter a valid price')
      return
    }

    setPrices(prices.map(price => {
      if (price.id === id) {
        const oldPrice = price.currentPrice
        const change = ((newPrice - oldPrice) / oldPrice) * 100
        
        return { 
          ...price, 
          currentPrice: newPrice, 
          change24h: change,
          lastUpdated: new Date().toISOString(),
          source: 'manual',
          history: [
            { date: new Date().toISOString().split('T')[0], price: newPrice, change },
            ...price.history
          ]
        }
      }
      return price
    }))
    setEditingId(null)
  }

  // Refresh prices from external source (mock)
  const refreshPrices = () => {
    // In a real app, this would fetch from an API
    alert('Fetching latest prices from external sources...')
    
    // Mock updated prices
    const updatedPrices = prices.map(price => {
      const randomChange = (Math.random() * 2 - 1) * 2 // Random change between -2% and +2%
      const newPrice = price.currentPrice * (1 + randomChange / 100)
      
      return {
        ...price,
        currentPrice: newPrice,
        change24h: randomChange,
        lastUpdated: new Date().toISOString(),
        source: price.source === 'manual' ? 'manual' : price.source,
        history: [
          { date: new Date().toISOString().split('T')[0], price: newPrice, change: randomChange },
          ...price.history
        ]
      }
    })
    
    setPrices(updatedPrices)
  }

  // Import prices from file (mock)
  const importPrices = () => {
    // In a real app, this would open a file dialog
    alert('This would open a file import dialog in a real application')
  }

  // Get change color
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500'
    if (change < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search commodities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Select 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="agricultural">Agricultural</SelectItem>
              <SelectItem value="metals">Metals</SelectItem>
              <SelectItem value="energy">Energy</SelectItem>
              <SelectItem value="specialty">Specialty</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={importPrices}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button size="sm" onClick={refreshPrices}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Prices
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>
                <div className="flex items-center">
                  Commodity
                  {sortConfig?.key === 'name' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('symbol')}>
                <div className="flex items-center">
                  Symbol
                  {sortConfig?.key === 'symbol' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('currentPrice')}>
                <div className="flex items-center">
                  Price (TZS)
                  {sortConfig?.key === 'currentPrice' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('change24h')}>
                <div className="flex items-center">
                  24h Change
                  {sortConfig?.key === 'change24h' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('change7d')}>
                <div className="flex items-center">
                  7d Change
                  {sortConfig?.key === 'change7d' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('volume24h')}>
                <div className="flex items-center">
                  Volume (24h)
                  {sortConfig?.key === 'volume24h' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrices.length > 0 ? (
              filteredPrices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell className="font-medium">{price.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{price.symbol}</Badge>
                  </TableCell>
                  <TableCell>
                    {editingId === price.id ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          type="number"
                          step="0.01"
                          className="w-24"
                        />
                        <Button size="sm" variant="ghost" onClick={() => savePrice(price.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEditing}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>{price.currentPrice.toLocaleString()}/{price.unit}</>
                    )}
                  </TableCell>
                  <TableCell className={getChangeColor(price.change24h)}>
                    {price.change24h > 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                  </TableCell>
                  <TableCell className={getChangeColor(price.change7d)}>
                    {price.change7d > 0 ? '+' : ''}{price.change7d.toFixed(2)}%
                  </TableCell>
                  <TableCell>{price.volume24h.toLocaleString()} {price.unit}</TableCell>
                  <TableCell>
                    <Badge variant={price.source === 'manual' ? 'outline' : 'default'}>
                      {price.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(price.lastUpdated).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(price)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedPrice(price)}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No prices found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedPrice && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">{selectedPrice.name} ({selectedPrice.symbol}) Price History</h3>
              <p className="text-sm text-muted-foreground">Historical price data for the past 5 days</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedPrice(null)}>
              Close
            </Button>
          </div>

          <Tabs defaultValue="table">
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="chart">Chart</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Price (TZS)</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPrice.history.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.price.toLocaleString()}</TableCell>
                      <TableCell className={getChangeColor(entry.change)}>
                        {entry.change > 0 ? '+' : ''}{entry.change.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="chart">
              <div className="h-64 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">Chart visualization would be displayed here</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  )
}
