'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
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
  previousClose: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio: number
  dividend: number
  dividendYield: number
  isActive: boolean
}

export function StockListing() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newStock, setNewStock] = useState({
    symbol: '',
    name: '',
    sector: '',
    currentPrice: 0,
    previousClose: 0,
    volume: 0,
    marketCap: 0,
    peRatio: 0,
    dividend: 0,
    dividendYield: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchStocks()
  }, [])

  const fetchStocks = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/trading/stocks')
      setStocks(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load stocks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let parsedValue: string | number = value
    
    if (name === 'currentPrice' || name === 'previousClose' || name === 'volume' || 
        name === 'marketCap' || name === 'peRatio' || name === 'dividend' || name === 'dividendYield') {
      parsedValue = parseFloat(value) || 0
    }
    
    setNewStock({
      ...newStock,
      [name]: parsedValue
    })
  }

  const handleSectorChange = (value: string) => {
    setNewStock({
      ...newStock,
      sector: value
    })
  }

  const filteredStocks = stocks.filter(stock => {
    const query = searchQuery.toLowerCase()
    return (
      stock.symbol.toLowerCase().includes(query) ||
      stock.name.toLowerCase().includes(query) ||
      stock.sector.toLowerCase().includes(query)
    )
  })

  const handleAddStock = async () => {
    try {
      // Calculate change and change percent
      const change = newStock.currentPrice - newStock.previousClose
      const changePercent = (change / newStock.previousClose) * 100
      
      const stockToAdd = {
        ...newStock,
        change,
        changePercent,
        isActive: true
      }
      
      const response = await axios.post('/api/trading/stocks', stockToAdd)
      setStocks([...stocks, response.data])
      setShowAddDialog(false)
      setNewStock({
        symbol: '',
        name: '',
        sector: '',
        currentPrice: 0,
        previousClose: 0,
        volume: 0,
        marketCap: 0,
        peRatio: 0,
        dividend: 0,
        dividendYield: 0
      })
      
      toast({
        title: "Success",
        description: "Stock added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add stock. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  return (
    <div className="space-y-4">
      {loading ? (
        <Card className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading stocks...</p>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-8">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchStocks}>
              Retry
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stocks..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Stock</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="symbol">Symbol</Label>
                      <Input id="symbol" name="symbol" value={newStock.symbol} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" value={newStock.name} onChange={handleInputChange} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <Select value={newStock.sector} onValueChange={handleSectorChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Financial Services">Financial Services</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Consumer Goods">Consumer Goods</SelectItem>
                        <SelectItem value="Energy">Energy</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Materials">Materials</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                        <SelectItem value="Industrials">Industrials</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPrice">Current Price ($)</Label>
                      <Input
                        id="currentPrice"
                        name="currentPrice"
                        type="number"
                        step="0.01"
                        value={newStock.currentPrice}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="previousClose">Previous Close ($)</Label>
                      <Input
                        id="previousClose"
                        name="previousClose"
                        type="number"
                        step="0.01"
                        value={newStock.previousClose}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="volume">Volume</Label>
                      <Input
                        id="volume"
                        name="volume"
                        type="number"
                        value={newStock.volume}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marketCap">Market Cap ($)</Label>
                      <Input
                        id="marketCap"
                        name="marketCap"
                        type="number"
                        value={newStock.marketCap}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="peRatio">P/E Ratio</Label>
                      <Input
                        id="peRatio"
                        name="peRatio"
                        type="number"
                        step="0.01"
                        value={newStock.peRatio}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dividend">Dividend ($)</Label>
                      <Input
                        id="dividend"
                        name="dividend"
                        type="number"
                        step="0.01"
                        value={newStock.dividend}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dividendYield">Yield (%)</Label>
                      <Input
                        id="dividendYield"
                        name="dividendYield"
                        type="number"
                        step="0.01"
                        value={newStock.dividendYield}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddStock}>Add Stock</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {filteredStocks.length === 0 ? (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                <p>No stocks found matching your search.</p>
              </div>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Price ($)</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Market Cap</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">{stock.symbol}</TableCell>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{stock.sector}</Badge>
                      </TableCell>
                      <TableCell>${stock.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {stock.change >= 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className={stock.change >= 0 ? "text-green-500" : "text-red-500"}>
                            {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{stock.volume.toLocaleString()}</TableCell>
                      <TableCell>${(stock.marketCap / 1000000).toFixed(1)}M</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <BarChart2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
