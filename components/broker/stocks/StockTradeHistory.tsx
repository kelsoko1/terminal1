'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Calendar, Search, Download, FileText, BarChart2, Eye, FileDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { subDays } from 'date-fns'

interface Trade {
  id: string
  symbol: string
  price: number
  quantity: number
  value: number
  buyerName: string
  sellerName: string
  buyerId: string
  sellerId: string
  timestamp: string
  settlementDate: string
  settlementStatus: 'pending' | 'completed' | 'failed'
  fees: number
  type: string
  commission: number
}

const mockTrades: Trade[] = [
  {
    id: 'TRD-2025-04-12-001',
    symbol: 'CRDB',
    price: 385,
    quantity: 1000,
    value: 385000,
    buyerName: 'John Makamba',
    sellerName: 'Amina Hassan',
    buyerId: 'CLI-001',
    sellerId: 'CLI-007',
    timestamp: '2025-04-12T10:15:00Z',
    settlementDate: '2025-04-14',
    settlementStatus: 'pending',
    fees: 3850,
    type: 'buy',
    commission: 385
  },
  {
    id: 'TRD-2025-04-12-002',
    symbol: 'TBL',
    price: 10900,
    quantity: 200,
    value: 2180000,
    buyerName: 'NSSF Investment Fund',
    sellerName: 'Grace Mwakio',
    buyerId: 'CLI-004',
    sellerId: 'CLI-002',
    timestamp: '2025-04-12T10:05:00Z',
    settlementDate: '2025-04-14',
    settlementStatus: 'pending',
    fees: 21800,
    type: 'sell',
    commission: 2180
  },
  {
    id: 'TRD-2025-04-11-001',
    symbol: 'NMB',
    price: 2950,
    quantity: 300,
    value: 885000,
    buyerName: 'Tanzania Breweries Limited',
    sellerName: 'Robert Nyerere',
    buyerId: 'CLI-003',
    sellerId: 'CLI-008',
    timestamp: '2025-04-11T14:30:00Z',
    settlementDate: '2025-04-13',
    settlementStatus: 'completed',
    fees: 8850,
    type: 'buy',
    commission: 885
  },
  {
    id: 'TRD-2025-04-11-002',
    symbol: 'TPCC',
    price: 4200,
    quantity: 500,
    value: 2100000,
    buyerName: 'Michael Sangiwa',
    sellerName: 'Vodacom Tanzania PLC',
    buyerId: 'CLI-006',
    sellerId: 'CLI-005',
    timestamp: '2025-04-11T13:45:00Z',
    settlementDate: '2025-04-13',
    settlementStatus: 'completed',
    fees: 21000,
    type: 'sell',
    commission: 2100
  },
  {
    id: 'TRD-2025-04-10-001',
    symbol: 'TCC',
    price: 17000,
    quantity: 150,
    value: 2550000,
    buyerName: 'NSSF Investment Fund',
    sellerName: 'Tanzania Breweries Limited',
    buyerId: 'CLI-004',
    sellerId: 'CLI-003',
    timestamp: '2025-04-10T15:20:00Z',
    settlementDate: '2025-04-12',
    settlementStatus: 'completed',
    fees: 25500,
    type: 'buy',
    commission: 2550
  },
  {
    id: 'TRD-2025-04-10-002',
    symbol: 'DSE',
    price: 1800,
    quantity: 1000,
    value: 1800000,
    buyerName: 'Amina Hassan',
    sellerName: 'John Makamba',
    buyerId: 'CLI-007',
    sellerId: 'CLI-001',
    timestamp: '2025-04-10T14:10:00Z',
    settlementDate: '2025-04-12',
    settlementStatus: 'completed',
    fees: 18000,
    type: 'sell',
    commission: 1800
  },
  {
    id: 'TRD-2025-04-09-001',
    symbol: 'SWIS',
    price: 1320,
    quantity: 800,
    value: 1056000,
    buyerName: 'Grace Mwakio',
    sellerName: 'Michael Sangiwa',
    buyerId: 'CLI-002',
    sellerId: 'CLI-006',
    timestamp: '2025-04-09T11:30:00Z',
    settlementDate: '2025-04-11',
    settlementStatus: 'completed',
    fees: 10560,
    type: 'buy',
    commission: 1056
  },
  {
    id: 'TRD-2025-04-09-002',
    symbol: 'CRDB',
    price: 380,
    quantity: 2000,
    value: 760000,
    buyerName: 'Vodacom Tanzania PLC',
    sellerName: 'Robert Nyerere',
    buyerId: 'CLI-005',
    sellerId: 'CLI-008',
    timestamp: '2025-04-09T10:45:00Z',
    settlementDate: '2025-04-11',
    settlementStatus: 'completed',
    fees: 7600,
    type: 'sell',
    commission: 760
  }
]

interface DateRange {
  from: Date
  to: Date
}

export function StockTradeHistory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Trade['settlementStatus']>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [showTradeDetailsDialog, setShowTradeDetailsDialog] = useState(false)
  const { toast } = useToast()

  // Get unique symbols for filtering
  const symbols = Array.from(new Set(mockTrades.map(trade => trade.symbol)))

  // Filter trades based on search term, symbol, settlement status, and date range
  const filteredTrades = mockTrades.filter(trade => {
    const matchesSearch =
      trade.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.buyerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.sellerId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || trade.settlementStatus === statusFilter

    // Date filtering
    const tradeDate = new Date(trade.timestamp)
    const matchesStartDate = !dateRange || !dateRange.from || tradeDate >= dateRange.from
    const matchesEndDate = !dateRange || !dateRange.to || tradeDate <= dateRange.to

    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return `TZS ${amount.toLocaleString()}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (dateString.includes('T')) {
      // ISO format
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      // Just date
      return dateString
    }
  }

  // Calculate totals
  const totalValue = filteredTrades.reduce((sum, trade) => sum + trade.value, 0)
  const totalFees = filteredTrades.reduce((sum, trade) => sum + trade.fees, 0)
  const totalQuantity = filteredTrades.reduce((sum, trade) => sum + trade.quantity, 0)

  // Handle view trade details
  const handleViewTradeDetails = (trade: Trade) => {
    setSelectedTrade(trade)
    setShowTradeDetailsDialog(true)
  }

  // Handle export trades
  const handleExportTrades = () => {
    // In a real app, this would generate a CSV or PDF export
    toast({
      title: "Export Started",
      description: "Your trade history export is being prepared.",
    })

    // Simulate export completion after 2 seconds
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Trade history has been exported successfully.",
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Trade Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Trades</p>
            <p className="text-2xl font-semibold">{filteredTrades.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-semibold">{totalQuantity.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-semibold">{formatCurrency(totalValue)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Fees</p>
            <p className="text-2xl font-semibold">{formatCurrency(totalFees)}</p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trades..."
            className="pl-8 w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Settlement Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <DatePicker
            selected={dateRange?.from}
            onSelect={(date) => setDateRange({ ...dateRange, from: date })}
            placeholder="Start Date"
          />
          <span className="text-muted-foreground">to</span>
          <DatePicker
            selected={dateRange?.to}
            onSelect={(date) => setDateRange({ ...dateRange, to: date })}
            placeholder="End Date"
          />
        </div>

        <div className="ml-auto">
          <Button variant="outline" onClick={handleExportTrades}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Trade ID</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Trade Date</TableHead>
            <TableHead>Settlement</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTrades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell className="font-medium">{trade.id}</TableCell>
              <TableCell>{trade.symbol}</TableCell>
              <TableCell className="text-right">{formatCurrency(trade.price)}</TableCell>
              <TableCell className="text-right">{trade.quantity.toLocaleString()}</TableCell>
              <TableCell className="text-right">{formatCurrency(trade.value)}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{trade.buyerName}</div>
                  <div className="text-sm text-muted-foreground">{trade.buyerId}</div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{trade.sellerName}</div>
                  <div className="text-sm text-muted-foreground">{trade.sellerId}</div>
                </div>
              </TableCell>
              <TableCell>{formatDate(trade.timestamp)}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge
                    variant={
                      trade.settlementStatus === 'completed' ? 'default' :
                        trade.settlementStatus === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {trade.settlementStatus.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-muted-foreground">{trade.settlementDate}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewTradeDetails(trade)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Trade Details Dialog */}
      {selectedTrade && (
        <Dialog open={showTradeDetailsDialog} onOpenChange={setShowTradeDetailsDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Trade Details: #{selectedTrade.id}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Trade Information</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Stock:</span>
                      <span className="font-medium">{selectedTrade.symbol}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <span className="font-medium">{selectedTrade.type}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{selectedTrade.quantity.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-medium">{formatCurrency(selectedTrade.price)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Total Value:</span>
                      <span className="font-medium">{formatCurrency(selectedTrade.price * selectedTrade.quantity)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Settlement Information</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={selectedTrade.settlementStatus === 'completed' ? 'success' : selectedTrade.settlementStatus === 'failed' ? 'destructive' : 'outline'}>
                        {selectedTrade.settlementStatus.charAt(0).toUpperCase() + selectedTrade.settlementStatus.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Trade Date:</span>
                      <span className="font-medium">{selectedTrade.timestamp}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Settlement Date:</span>
                      <span className="font-medium">{selectedTrade.settlementDate}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Commission:</span>
                      <span className="font-medium">{formatCurrency(selectedTrade.commission)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Fees:</span>
                      <span className="font-medium">{formatCurrency(selectedTrade.fees)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Client Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-muted-foreground">Buyer:</span>
                        <span className="font-medium">{selectedTrade.buyerName}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-muted-foreground">Buyer Account:</span>
                        <span className="font-medium">{selectedTrade.buyerId}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-muted-foreground">Seller:</span>
                        <span className="font-medium">{selectedTrade.sellerName}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-muted-foreground">Seller Account:</span>
                        <span className="font-medium">{selectedTrade.sellerId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowTradeDetailsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
