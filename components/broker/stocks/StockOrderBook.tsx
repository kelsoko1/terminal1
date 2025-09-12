'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowUpDown, Search, CheckCircle, XCircle, AlertCircle, Clock, Plus, Eye, Check, X } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

interface Order {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  price: number
  quantity: number
  value: number
  clientId: string
  clientName: string
  status: 'pending' | 'executed' | 'partial' | 'cancelled' | 'rejected'
  timestamp: string
  executedQuantity?: number
  remainingQuantity?: number
}

const mockOrders: Order[] = [
  {
    id: 'ORD-2025-04-12-001',
    symbol: 'CRDB',
    type: 'buy',
    price: 390,
    quantity: 1000,
    value: 390000,
    clientId: 'CLI-001',
    clientName: 'John Makamba',
    status: 'pending',
    timestamp: '2025-04-12T09:30:00Z'
  },
  {
    id: 'ORD-2025-04-12-002',
    symbol: 'TBL',
    type: 'sell',
    price: 10900,
    quantity: 200,
    value: 2180000,
    clientId: 'CLI-002',
    clientName: 'Grace Mwakio',
    status: 'executed',
    timestamp: '2025-04-12T09:15:00Z',
    executedQuantity: 200,
    remainingQuantity: 0
  },
  {
    id: 'ORD-2025-04-12-003',
    symbol: 'NMB',
    type: 'buy',
    price: 2960,
    quantity: 500,
    value: 1480000,
    clientId: 'CLI-003',
    clientName: 'Tanzania Breweries Limited',
    status: 'partial',
    timestamp: '2025-04-12T09:10:00Z',
    executedQuantity: 300,
    remainingQuantity: 200
  },
  {
    id: 'ORD-2025-04-12-004',
    symbol: 'DSE',
    type: 'buy',
    price: 1810,
    quantity: 1000,
    value: 1810000,
    clientId: 'CLI-004',
    clientName: 'NSSF Investment Fund',
    status: 'pending',
    timestamp: '2025-04-12T09:05:00Z'
  },
  {
    id: 'ORD-2025-04-12-005',
    symbol: 'TPCC',
    type: 'sell',
    price: 4250,
    quantity: 300,
    value: 1275000,
    clientId: 'CLI-005',
    clientName: 'Vodacom Tanzania PLC',
    status: 'cancelled',
    timestamp: '2025-04-12T09:00:00Z'
  },
  {
    id: 'ORD-2025-04-12-006',
    symbol: 'TCC',
    type: 'buy',
    price: 17100,
    quantity: 100,
    value: 1710000,
    clientId: 'CLI-006',
    clientName: 'Michael Sangiwa',
    status: 'rejected',
    timestamp: '2025-04-12T08:55:00Z'
  },
  {
    id: 'ORD-2025-04-12-007',
    symbol: 'CRDB',
    type: 'sell',
    price: 385,
    quantity: 2000,
    value: 770000,
    clientId: 'CLI-007',
    clientName: 'Amina Hassan',
    status: 'executed',
    timestamp: '2025-04-12T08:50:00Z',
    executedQuantity: 2000,
    remainingQuantity: 0
  },
  {
    id: 'ORD-2025-04-12-008',
    symbol: 'SWIS',
    type: 'buy',
    price: 1330,
    quantity: 500,
    value: 665000,
    clientId: 'CLI-008',
    clientName: 'Robert Nyerere',
    status: 'pending',
    timestamp: '2025-04-12T08:45:00Z'
  }
]

export function StockOrderBook() {
  const [searchTerm, setSearchTerm] = useState('')
  const [symbolFilter, setSymbolFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('all')
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false)
  const { toast } = useToast()
  
  // Get unique symbols for filtering
  const symbols = Array.from(new Set(mockOrders.map(order => order.symbol)))
  
  // Filter orders based on search term, symbol, status, and type filters
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSymbol = symbolFilter === 'all' || order.symbol === symbolFilter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesType = typeFilter === 'all' || order.type === typeFilter
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'buy' && order.type === 'buy') ||
                      (activeTab === 'sell' && order.type === 'sell')
    
    return matchesSearch && matchesSymbol && matchesStatus && matchesType && matchesTab
  })
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `TZS ${amount.toLocaleString()}`
  }
  
  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'executed':
        return { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> }
      case 'pending':
        return { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> }
      case 'partial':
        return { variant: 'outline', icon: <AlertCircle className="h-3 w-3 mr-1" /> }
      case 'cancelled':
        return { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> }
      case 'rejected':
        return { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> }
      default:
        return { variant: 'outline', icon: null }
    }
  }
  
  // Handle view order details
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetailsDialog(true)
  }
  
  // Handle approve order
  const handleApproveOrder = (order: Order) => {
    // In a real app, this would call an API to approve the order
    toast({
      title: "Order Approved",
      description: `Order #${order.id} has been approved.`,
    })
  }
  
  // Handle cancel order
  const handleCancelOrder = (order: Order) => {
    // In a real app, this would call an API to cancel the order
    toast({
      title: "Order Cancelled",
      description: `Order #${order.id} has been cancelled.`,
    })
  }
  
  // Handle create new order
  const handleCreateOrder = (formData: any) => {
    // In a real app, this would call an API to create a new order
    toast({
      title: "Order Created",
      description: `New ${formData.orderType} order for ${formData.symbol} has been created.`,
    })
    setShowNewOrderDialog(false)
  }
  
  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">DSE Order Book Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-semibold">{mockOrders.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pending Orders</p>
            <p className="text-2xl font-semibold">{mockOrders.filter(o => o.status === 'pending').length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Executed Value</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(mockOrders
                .filter(o => o.status === 'executed')
                .reduce((sum, order) => sum + order.value, 0))}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Buy/Sell Ratio</p>
            <p className="text-2xl font-semibold">
              {mockOrders.filter(o => o.type === 'buy').length} : {mockOrders.filter(o => o.type === 'sell').length}
            </p>
          </div>
        </div>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="buy">Buy Orders</TabsTrigger>
          <TabsTrigger value="sell">Sell Orders</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8 w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select
          value={symbolFilter}
          onValueChange={setSymbolFilter}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Symbol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Symbols</SelectItem>
            {symbols.map((symbol) => (
              <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="executed">Executed</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        
        <Dialog open={showNewOrderDialog} onOpenChange={setShowNewOrderDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowNewOrderDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Order Information</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Stock:</span>
                      <span className="font-medium">CRDB</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <span className="font-medium">BUY</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <span className="font-medium">100</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-medium">{formatCurrency(500)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit"
                onClick={() => {
                  // Mock form data
                  const formData = {
                    symbol: 'CRDB',
                    orderType: 'BUY',
                    quantity: 100,
                    price: 500
                  }
                  handleCreateOrder(formData)
                }}
              >
                Create Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Order ID</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.symbol}</TableCell>
              <TableCell>
                <Badge variant={order.type === 'buy' ? 'default' : 'destructive'}>
                  {order.type.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(order.price)}</TableCell>
              <TableCell className="text-right">
                {order.status === 'partial' ? (
                  <span>
                    {order.executedQuantity}/{order.quantity}
                  </span>
                ) : (
                  order.quantity.toLocaleString()
                )}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(order.value)}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.clientName}</div>
                  <div className="text-sm text-muted-foreground">{order.clientId}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={getStatusBadge(order.status).variant as any} 
                  className="flex items-center"
                >
                  {getStatusBadge(order.status).icon}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewOrderDetails(order)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {order.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleApproveOrder(order)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCancelOrder(order)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={showOrderDetailsDialog} onOpenChange={setShowOrderDetailsDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Order Details: #{selectedOrder.id}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Order Information</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Stock:</span>
                      <span className="font-medium">{selectedOrder.symbol}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <span className="font-medium">{selectedOrder.type}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{selectedOrder.quantity.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.price)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Total Value:</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.price * selectedOrder.quantity)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Status Information</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={selectedOrder.status === 'executed' ? 'success' : selectedOrder.status === 'cancelled' ? 'destructive' : 'outline'}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="font-medium">{selectedOrder.timestamp}</span>
                    </div>
                    {selectedOrder.executedQuantity && (
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-muted-foreground">Executed:</span>
                        <span className="font-medium">{selectedOrder.timestamp}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Client:</span>
                      <span className="font-medium">{selectedOrder.clientName}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Account:</span>
                      <span className="font-medium">{selectedOrder.clientId}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">
                  No notes available for this order.
                </p>
              </div>
            </div>
            <DialogFooter>
              {selectedOrder.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => {
                    handleCancelOrder(selectedOrder)
                    setShowOrderDetailsDialog(false)
                  }}>
                    Cancel Order
                  </Button>
                  <Button onClick={() => {
                    handleApproveOrder(selectedOrder)
                    setShowOrderDetailsDialog(false)
                  }}>
                    Approve Order
                  </Button>
                </div>
              )}
              {selectedOrder.status !== 'pending' && (
                <Button onClick={() => setShowOrderDetailsDialog(false)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
