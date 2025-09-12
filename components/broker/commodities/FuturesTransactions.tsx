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
  Check, 
  Download, 
  Eye, 
  Filter, 
  Search, 
  X 
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface FuturesTransaction {
  id: string
  userId: string
  userName: string
  contractName: string
  contractSymbol: string
  type: 'buy' | 'sell'
  position: 'open' | 'close'
  contracts: number
  price: number
  total: number
  margin: number
  fee: number
  status: 'pending' | 'completed' | 'cancelled' | 'processing'
  timestamp: string
}

// Mock data for futures transactions
const mockTransactions: FuturesTransaction[] = [
  {
    id: 'ft1',
    userId: 'user123',
    userName: 'John Doe',
    contractName: 'Cashew Nuts Futures',
    contractSymbol: 'CASH-DEC25',
    type: 'buy',
    position: 'open',
    contracts: 5,
    price: 2950,
    total: 14750000, // 5 contracts x 1000kg x 2950 TZS
    margin: 1475000, // 10% initial margin
    fee: 14750,
    status: 'completed',
    timestamp: '2025-04-25T03:24:00Z'
  },
  {
    id: 'ft2',
    userId: 'user456',
    userName: 'Jane Smith',
    contractName: 'Coffee Arabica Futures',
    contractSymbol: 'COFA-SEP25',
    type: 'sell',
    position: 'open',
    contracts: 3,
    price: 7650,
    total: 11475000, // 3 contracts x 500kg x 7650 TZS
    margin: 1721250, // 15% initial margin
    fee: 11475,
    status: 'pending',
    timestamp: '2025-04-25T04:15:00Z'
  },
  {
    id: 'ft3',
    userId: 'user789',
    userName: 'Robert Johnson',
    contractName: 'Gold Futures',
    contractSymbol: 'GOLD-JUN25',
    type: 'buy',
    position: 'open',
    contracts: 1,
    price: 2875000,
    total: 28750000, // 1 contract x 10oz x 2875000 TZS
    margin: 5750000, // 20% initial margin
    fee: 28750,
    status: 'processing',
    timestamp: '2025-04-25T02:45:00Z'
  },
  {
    id: 'ft4',
    userId: 'user123',
    userName: 'John Doe',
    contractName: 'Cashew Nuts Futures',
    contractSymbol: 'CASH-DEC25',
    type: 'sell',
    position: 'close',
    contracts: 2,
    price: 3000,
    total: 6000000, // 2 contracts x 1000kg x 3000 TZS
    margin: 0, // No margin for closing position
    fee: 6000,
    status: 'completed',
    timestamp: '2025-04-24T14:30:00Z'
  },
  {
    id: 'ft5',
    userId: 'user456',
    userName: 'Jane Smith',
    contractName: 'Coffee Robusta Futures',
    contractSymbol: 'COFR-MAR26',
    type: 'buy',
    position: 'open',
    contracts: 4,
    price: 4350,
    total: 8700000, // 4 contracts x 500kg x 4350 TZS
    margin: 1305000, // 15% initial margin
    fee: 8700,
    status: 'cancelled',
    timestamp: '2025-04-24T10:15:00Z'
  }
]

export function FuturesTransactions() {
  const [transactions, setTransactions] = useState<FuturesTransaction[]>(mockTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [positionFilter, setPositionFilter] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [selectedTransaction, setSelectedTransaction] = useState<FuturesTransaction | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Filter transactions based on search term and filters
  const filteredTransactions = transactions.filter(tx => {
    // Search filter
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.contractName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.contractSymbol.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Status filter
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(tx.status)
    
    // Type filter
    const matchesType = typeFilter.length === 0 || typeFilter.includes(tx.type)
    
    // Position filter
    const matchesPosition = positionFilter.length === 0 || positionFilter.includes(tx.position)
    
    // Date range filter
    let matchesDateRange = true
    if (dateRange.from) {
      matchesDateRange = matchesDateRange && new Date(tx.timestamp) >= new Date(dateRange.from)
    }
    if (dateRange.to) {
      matchesDateRange = matchesDateRange && new Date(tx.timestamp) <= new Date(dateRange.to)
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesPosition && matchesDateRange
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

  // Handle position filter change
  const handlePositionFilterChange = (position: string) => {
    setPositionFilter(prev => 
      prev.includes(position) 
        ? prev.filter(p => p !== position) 
        : [...prev, position]
    )
  }

  // Handle transaction status change
  const updateTransactionStatus = (id: string, newStatus: FuturesTransaction['status']) => {
    setTransactions(transactions.map(tx => 
      tx.id === id ? { ...tx, status: newStatus } : tx
    ))
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: FuturesTransaction['status']) => {
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Label>Position</Label>
              <div className="space-y-2">
                {['open', 'close'].map(position => (
                  <div key={position} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`position-${position}`} 
                      checked={positionFilter.includes(position)}
                      onCheckedChange={() => handlePositionFilterChange(position)}
                    />
                    <label 
                      htmlFor={`position-${position}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {position.charAt(0).toUpperCase() + position.slice(1)}
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
                setPositionFilter([])
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
              <TableHead>Contract</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Contracts</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Margin</TableHead>
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
                  <TableCell>
                    <div>
                      <span>{tx.contractName}</span>
                      <Badge variant="outline" className="ml-2">{tx.contractSymbol}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.type === 'buy' ? 'default' : 'secondary'}>
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.position === 'open' ? 'outline' : 'default'}>
                      {tx.position}
                    </Badge>
                  </TableCell>
                  <TableCell>{tx.contracts}</TableCell>
                  <TableCell>{tx.price.toLocaleString()} TZS</TableCell>
                  <TableCell>{tx.total.toLocaleString()} TZS</TableCell>
                  <TableCell>{tx.margin.toLocaleString()} TZS</TableCell>
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
                <TableCell colSpan={12} className="h-24 text-center">
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
                Complete information about this futures transaction
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
                  <Label className="text-xs text-muted-foreground">Contract</Label>
                  <p>{selectedTransaction.contractName} ({selectedTransaction.contractSymbol})</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Transaction Type</Label>
                  <div className="flex space-x-2">
                    <Badge variant={selectedTransaction.type === 'buy' ? 'default' : 'secondary'}>
                      {selectedTransaction.type}
                    </Badge>
                    <Badge variant={selectedTransaction.position === 'open' ? 'outline' : 'default'}>
                      {selectedTransaction.position}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Contracts</Label>
                  <p>{selectedTransaction.contracts}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Price</Label>
                  <p>{selectedTransaction.price.toLocaleString()} TZS</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Total Value</Label>
                  <p>{selectedTransaction.total.toLocaleString()} TZS</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Margin Required</Label>
                  <p>{selectedTransaction.margin.toLocaleString()} TZS</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Fee</Label>
                  <p>{selectedTransaction.fee.toLocaleString()} TZS</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Timestamp</Label>
                  <p>{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                </div>
                
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs text-muted-foreground">Settlement Information</Label>
                  <p className="text-sm">
                    {selectedTransaction.position === 'open' 
                      ? `Initial margin of ${selectedTransaction.margin.toLocaleString()} TZS has been reserved from the user's account. Daily mark-to-market settlements will apply until position is closed or contract expires.`
                      : `Position has been closed. Any profit/loss has been settled to the user's account.`
                    }
                  </p>
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
