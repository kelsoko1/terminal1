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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  ArrowUpDown, 
  Check, 
  Download, 
  Eye, 
  Filter, 
  Search, 
  X 
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface FxTransaction {
  id: string
  userId: string
  userName: string
  currencyPair: string
  type: 'buy' | 'sell'
  amount: number
  baseCurrency: string
  exchangeRate: number
  quoteCurrency: string
  quoteAmount: number
  fee: number
  status: 'pending' | 'completed' | 'cancelled' | 'processing'
  providerId: string
  providerName: string
  timestamp: string
}

// Mock data for FX transactions
const mockTransactions: FxTransaction[] = [
  {
    id: 'tx1',
    userId: 'user123',
    userName: 'John Doe',
    currencyPair: 'TZS/USD',
    type: 'buy',
    amount: 2500000,
    baseCurrency: 'TZS',
    exchangeRate: 2500,
    quoteCurrency: 'USD',
    quoteAmount: 1000,
    fee: 25,
    status: 'completed',
    providerId: 'prov1',
    providerName: 'ABC Bureau de Change',
    timestamp: '2025-04-12T03:24:00Z'
  },
  {
    id: 'tx2',
    userId: 'user456',
    userName: 'Jane Smith',
    currencyPair: 'TZS/EUR',
    type: 'sell',
    amount: 1350000,
    baseCurrency: 'TZS',
    exchangeRate: 2700,
    quoteCurrency: 'EUR',
    quoteAmount: 500,
    fee: 15,
    status: 'pending',
    providerId: 'prov2',
    providerName: 'XYZ Forex',
    timestamp: '2025-04-12T04:15:00Z'
  },
  {
    id: 'tx3',
    userId: 'user789',
    userName: 'Robert Johnson',
    currencyPair: 'USD/TZS',
    type: 'sell',
    amount: 2000,
    baseCurrency: 'USD',
    exchangeRate: 0.0004,
    quoteCurrency: 'TZS',
    quoteAmount: 5000000,
    fee: 50,
    status: 'processing',
    providerId: 'prov1',
    providerName: 'ABC Bureau de Change',
    timestamp: '2025-04-12T02:45:00Z'
  },
  {
    id: 'tx4',
    userId: 'user123',
    userName: 'John Doe',
    currencyPair: 'EUR/TZS',
    type: 'buy',
    amount: 1000,
    baseCurrency: 'EUR',
    exchangeRate: 0.00037,
    quoteCurrency: 'TZS',
    quoteAmount: 2702700,
    fee: 30,
    status: 'completed',
    providerId: 'prov3',
    providerName: 'Global FX',
    timestamp: '2025-04-11T14:30:00Z'
  },
  {
    id: 'tx5',
    userId: 'user456',
    userName: 'Jane Smith',
    currencyPair: 'TZS/USD',
    type: 'buy',
    amount: 5000000,
    baseCurrency: 'TZS',
    exchangeRate: 2500,
    quoteCurrency: 'USD',
    quoteAmount: 2000,
    fee: 50,
    status: 'cancelled',
    providerId: 'prov2',
    providerName: 'XYZ Forex',
    timestamp: '2025-04-11T10:15:00Z'
  }
]

export function FxTransactionList() {
  const [transactions, setTransactions] = useState<FxTransaction[]>(mockTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [selectedTransaction, setSelectedTransaction] = useState<FxTransaction | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Filter transactions based on search term and filters
  const filteredTransactions = transactions.filter(tx => {
    // Search filter
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.currencyPair.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.providerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Status filter
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(tx.status)
    
    // Type filter
    const matchesType = typeFilter.length === 0 || typeFilter.includes(tx.type)
    
    // Date range filter
    let matchesDateRange = true
    if (dateRange.from) {
      matchesDateRange = matchesDateRange && new Date(tx.timestamp) >= new Date(dateRange.from)
    }
    if (dateRange.to) {
      matchesDateRange = matchesDateRange && new Date(tx.timestamp) <= new Date(dateRange.to)
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDateRange
  })

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    )
  }

  // Handle type filter change
  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    )
  }

  // Handle transaction status change
  const updateTransactionStatus = (id: string, newStatus: FxTransaction['status']) => {
    setTransactions(transactions.map(tx => 
      tx.id === id ? { ...tx, status: newStatus } : tx
    ))
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: FxTransaction['status']) => {
    switch (status) {
      case 'completed': return 'default'
      case 'pending': return 'secondary'
      case 'processing': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 sm:flex-none"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Transaction Status</Label>
              <div className="space-y-2">
                {['pending', 'processing', 'completed', 'cancelled'].map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`status-${status}`} 
                      checked={statusFilter.includes(status)}
                      onCheckedChange={() => handleStatusFilterChange(status)}
                    />
                    <label 
                      htmlFor={`status-${status}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <div className="space-y-2">
                {['buy', 'sell'].map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`type-${type}`} 
                      checked={typeFilter.includes(type)}
                      onCheckedChange={() => handleTypeFilterChange(type)}
                    />
                    <label 
                      htmlFor={`type-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="date-from" className="text-xs">From</Label>
                  <Input 
                    id="date-from" 
                    type="date" 
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="date-to" className="text-xs">To</Label>
                  <Input 
                    id="date-to" 
                    type="date" 
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setStatusFilter([])
                setTypeFilter([])
                setDateRange({ from: '', to: '' })
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Currency Pair</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{tx.userName}</TableCell>
                  <TableCell>{tx.currencyPair}</TableCell>
                  <TableCell>
                    <Badge variant={tx.type === 'buy' ? 'default' : 'secondary'}>
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tx.amount.toLocaleString()} {tx.baseCurrency}
                  </TableCell>
                  <TableCell>{tx.exchangeRate.toFixed(4)}</TableCell>
                  <TableCell>{tx.providerName}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(tx.status)}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedTransaction(tx)
                          setShowDetailsDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {tx.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-500 hover:text-green-700"
                            onClick={() => updateTransactionStatus(tx.id, 'completed')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => updateTransactionStatus(tx.id, 'cancelled')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Complete information about this FX transaction
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                  <p className="font-medium">{selectedTransaction.id}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div>
                    <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <p>{selectedTransaction.userName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <p>{selectedTransaction.userId}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Currency Pair</Label>
                  <p>{selectedTransaction.currencyPair}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Transaction Type</Label>
                  <div>
                    <Badge variant={selectedTransaction.type === 'buy' ? 'default' : 'secondary'}>
                      {selectedTransaction.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Base Amount</Label>
                  <p>{selectedTransaction.amount.toLocaleString()} {selectedTransaction.baseCurrency}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Quote Amount</Label>
                  <p>{selectedTransaction.quoteAmount.toLocaleString()} {selectedTransaction.quoteCurrency}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Exchange Rate</Label>
                  <p>{selectedTransaction.exchangeRate.toFixed(4)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Fee</Label>
                  <p>{selectedTransaction.fee.toLocaleString()} {selectedTransaction.baseCurrency}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Provider</Label>
                  <p>{selectedTransaction.providerName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Provider ID</Label>
                  <p>{selectedTransaction.providerId}</p>
                </div>
                
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs text-muted-foreground">Timestamp</Label>
                  <p>{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-between">
              {selectedTransaction.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button 
                    variant="default"
                    size="sm"
                    onClick={() => {
                      updateTransactionStatus(selectedTransaction.id, 'completed')
                      setShowDetailsDialog(false)
                    }}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      updateTransactionStatus(selectedTransaction.id, 'cancelled')
                      setShowDetailsDialog(false)
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
