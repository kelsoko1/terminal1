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
  Calendar,
  Edit, 
  Filter, 
  Plus, 
  Search, 
  Trash2 
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

// Define contract months
type ContractMonth = 'JAN' | 'FEB' | 'MAR' | 'APR' | 'MAY' | 'JUN' | 'JUL' | 'AUG' | 'SEP' | 'OCT' | 'NOV' | 'DEC'

// Define commodity futures contract
interface CommodityFuture {
  id: string
  name: string
  symbol: string
  baseAsset: string
  contractSize: number
  unit: string
  expiryMonth: ContractMonth
  expiryYear: number
  price: number
  change: number
  openInterest: number
  volume: number
  initialMargin: number
  maintenanceMargin: number
  status: 'active' | 'expired' | 'delivery' | 'settlement'
  lastUpdated: string
}

// Mock data for commodity futures
const mockFutures: CommodityFuture[] = [
  {
    id: 'f1',
    name: 'Cashew Nuts Futures',
    symbol: 'CASH-DEC25',
    baseAsset: 'Cashew Nuts',
    contractSize: 1000,
    unit: 'kg',
    expiryMonth: 'DEC',
    expiryYear: 2025,
    price: 2950,
    change: 1.8,
    openInterest: 125,
    volume: 45,
    initialMargin: 10,
    maintenanceMargin: 5,
    status: 'active',
    lastUpdated: '2025-04-25T08:30:00Z'
  },
  {
    id: 'f2',
    name: 'Coffee Arabica Futures',
    symbol: 'COFA-SEP25',
    baseAsset: 'Coffee (Arabica)',
    contractSize: 500,
    unit: 'kg',
    expiryMonth: 'SEP',
    expiryYear: 2025,
    price: 7650,
    change: 2.1,
    openInterest: 87,
    volume: 32,
    initialMargin: 15,
    maintenanceMargin: 7.5,
    status: 'active',
    lastUpdated: '2025-04-25T08:30:00Z'
  },
  {
    id: 'f3',
    name: 'Gold Futures',
    symbol: 'GOLD-JUN25',
    baseAsset: 'Gold',
    contractSize: 10,
    unit: 'oz',
    expiryMonth: 'JUN',
    expiryYear: 2025,
    price: 2875000,
    change: 0.5,
    openInterest: 210,
    volume: 65,
    initialMargin: 20,
    maintenanceMargin: 10,
    status: 'active',
    lastUpdated: '2025-04-25T08:30:00Z'
  },
  {
    id: 'f4',
    name: 'Sesame Seeds Futures',
    symbol: 'SESA-OCT25',
    baseAsset: 'Sesame Seeds',
    contractSize: 2000,
    unit: 'kg',
    expiryMonth: 'OCT',
    expiryYear: 2025,
    price: 3750,
    change: -0.8,
    openInterest: 56,
    volume: 18,
    initialMargin: 12,
    maintenanceMargin: 6,
    status: 'active',
    lastUpdated: '2025-04-25T08:30:00Z'
  },
  {
    id: 'f5',
    name: 'Coffee Robusta Futures',
    symbol: 'COFR-MAR26',
    baseAsset: 'Coffee (Robusta)',
    contractSize: 500,
    unit: 'kg',
    expiryMonth: 'MAR',
    expiryYear: 2026,
    price: 4350,
    change: 1.2,
    openInterest: 42,
    volume: 15,
    initialMargin: 15,
    maintenanceMargin: 7.5,
    status: 'active',
    lastUpdated: '2025-04-25T08:30:00Z'
  }
]

export function CommodityFutures() {
  const [futures, setFutures] = useState<CommodityFuture[]>(mockFutures)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedFuture, setSelectedFuture] = useState<CommodityFuture | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof CommodityFuture; direction: 'asc' | 'desc' } | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Sort function for futures
  const sortedFutures = [...futures].sort((a, b) => {
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

  // Filter futures based on search term and status
  const filteredFutures = sortedFutures.filter(future => {
    const matchesSearch = 
      future.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      future.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      future.baseAsset.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || future.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Handle sort request
  const requestSort = (key: keyof CommodityFuture) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Handle adding a new future contract
  const handleAddFuture = (newFuture: Omit<CommodityFuture, 'id' | 'lastUpdated' | 'change' | 'volume' | 'openInterest'>) => {
    const now = new Date().toISOString()
    const id = `f${futures.length + 1}`
    
    setFutures([
      ...futures,
      {
        ...newFuture,
        id,
        change: 0,
        volume: 0,
        openInterest: 0,
        lastUpdated: now
      }
    ])
    
    setShowAddDialog(false)
  }

  // Handle updating a future contract
  const handleUpdateFuture = (updatedFuture: CommodityFuture) => {
    setFutures(futures.map(future => 
      future.id === updatedFuture.id ? { ...updatedFuture, lastUpdated: new Date().toISOString() } : future
    ))
    setShowEditDialog(false)
    setSelectedFuture(null)
  }

  // Handle deleting a future contract
  const handleDeleteFuture = (id: string) => {
    if (confirm('Are you sure you want to delete this futures contract?')) {
      setFutures(futures.filter(future => future.id !== id))
    }
  }

  // Handle toggling future status
  const handleToggleStatus = (id: string, newStatus: CommodityFuture['status']) => {
    setFutures(futures.map(future => 
      future.id === id ? { 
        ...future, 
        status: newStatus,
        lastUpdated: new Date().toISOString() 
      } : future
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search futures contracts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 md:flex-none"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button 
            size="sm"
            className="flex-1 md:flex-none"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Futures Contract
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="settlement">Settlement</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>
                <div className="flex items-center">
                  Contract Name
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
              <TableHead>Base Asset</TableHead>
              <TableHead>Contract Size</TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('price')}>
                <div className="flex items-center">
                  Price
                  {sortConfig?.key === 'price' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Open Interest</TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>
                <div className="flex items-center">
                  Status
                  {sortConfig?.key === 'status' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFutures.length > 0 ? (
              filteredFutures.map((future) => (
                <TableRow key={future.id}>
                  <TableCell className="font-medium">{future.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{future.symbol}</Badge>
                  </TableCell>
                  <TableCell>{future.baseAsset}</TableCell>
                  <TableCell>{future.contractSize.toLocaleString()} {future.unit}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {future.price.toLocaleString()} TZS/{future.unit}
                      <Badge 
                        variant={future.change >= 0 ? "default" : "destructive"} 
                        className="ml-2"
                      >
                        {future.change >= 0 ? '+' : ''}{future.change}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{future.expiryMonth}-{future.expiryYear}</TableCell>
                  <TableCell>{future.openInterest}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        future.status === 'active' ? 'default' : 
                        future.status === 'delivery' ? 'outline' :
                        future.status === 'settlement' ? 'secondary' : 'destructive'
                      }
                    >
                      {future.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedFuture(future)
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteFuture(future.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No futures contracts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Future Contract Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Futures Contract</DialogTitle>
            <DialogDescription>
              Add a new commodity futures contract to the trading platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Contract Name</Label>
                <Input id="name" placeholder="e.g., Cashew Nuts Futures" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input id="symbol" placeholder="e.g., CASH-DEC25" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baseAsset">Base Asset</Label>
              <Input id="baseAsset" placeholder="e.g., Cashew Nuts" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractSize">Contract Size</Label>
                <Input id="contractSize" type="number" placeholder="e.g., 1000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" placeholder="e.g., kg" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Expiry Month</Label>
                <Select defaultValue="DEC">
                  <SelectTrigger id="expiryMonth">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JAN">January</SelectItem>
                    <SelectItem value="FEB">February</SelectItem>
                    <SelectItem value="MAR">March</SelectItem>
                    <SelectItem value="APR">April</SelectItem>
                    <SelectItem value="MAY">May</SelectItem>
                    <SelectItem value="JUN">June</SelectItem>
                    <SelectItem value="JUL">July</SelectItem>
                    <SelectItem value="AUG">August</SelectItem>
                    <SelectItem value="SEP">September</SelectItem>
                    <SelectItem value="OCT">October</SelectItem>
                    <SelectItem value="NOV">November</SelectItem>
                    <SelectItem value="DEC">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear">Expiry Year</Label>
                <Select defaultValue="2025">
                  <SelectTrigger id="expiryYear">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2028">2028</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (TZS)</Label>
              <Input id="price" type="number" placeholder="e.g., 2950" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initialMargin">Initial Margin (%)</Label>
                <Input id="initialMargin" type="number" placeholder="e.g., 10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenanceMargin">Maintenance Margin (%)</Label>
                <Input id="maintenanceMargin" type="number" placeholder="e.g., 5" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="active">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="settlement">Settlement</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => {
              // Mock implementation - in a real app, you'd get values from form fields
              handleAddFuture({
                name: 'New Futures Contract',
                symbol: 'NEW-DEC25',
                baseAsset: 'New Commodity',
                contractSize: 1000,
                unit: 'kg',
                expiryMonth: 'DEC',
                expiryYear: 2025,
                price: 3000,
                initialMargin: 10,
                maintenanceMargin: 5,
                status: 'active'
              })
            }}>
              Add Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Future Contract Dialog */}
      {selectedFuture && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Futures Contract</DialogTitle>
              <DialogDescription>
                Update information for {selectedFuture.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Contract Name</Label>
                  <Input id="edit-name" defaultValue={selectedFuture.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-symbol">Symbol</Label>
                  <Input id="edit-symbol" defaultValue={selectedFuture.symbol} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-baseAsset">Base Asset</Label>
                <Input id="edit-baseAsset" defaultValue={selectedFuture.baseAsset} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contractSize">Contract Size</Label>
                  <Input 
                    id="edit-contractSize" 
                    type="number" 
                    defaultValue={selectedFuture.contractSize} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Input id="edit-unit" defaultValue={selectedFuture.unit} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-expiryMonth">Expiry Month</Label>
                  <Select defaultValue={selectedFuture.expiryMonth}>
                    <SelectTrigger id="edit-expiryMonth">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JAN">January</SelectItem>
                      <SelectItem value="FEB">February</SelectItem>
                      <SelectItem value="MAR">March</SelectItem>
                      <SelectItem value="APR">April</SelectItem>
                      <SelectItem value="MAY">May</SelectItem>
                      <SelectItem value="JUN">June</SelectItem>
                      <SelectItem value="JUL">July</SelectItem>
                      <SelectItem value="AUG">August</SelectItem>
                      <SelectItem value="SEP">September</SelectItem>
                      <SelectItem value="OCT">October</SelectItem>
                      <SelectItem value="NOV">November</SelectItem>
                      <SelectItem value="DEC">December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-expiryYear">Expiry Year</Label>
                  <Select defaultValue={selectedFuture.expiryYear.toString()}>
                    <SelectTrigger id="edit-expiryYear">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (TZS)</Label>
                <Input 
                  id="edit-price" 
                  type="number" 
                  defaultValue={selectedFuture.price} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-initialMargin">Initial Margin (%)</Label>
                  <Input 
                    id="edit-initialMargin" 
                    type="number" 
                    defaultValue={selectedFuture.initialMargin} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maintenanceMargin">Maintenance Margin (%)</Label>
                  <Input 
                    id="edit-maintenanceMargin" 
                    type="number" 
                    defaultValue={selectedFuture.maintenanceMargin} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select defaultValue={selectedFuture.status}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="settlement">Settlement</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowEditDialog(false)
                setSelectedFuture(null)
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Mock implementation - in a real app, you'd get values from form fields
                handleUpdateFuture({
                  ...selectedFuture,
                  price: selectedFuture.price + 100, // Mock change
                  openInterest: selectedFuture.openInterest + 5 // Mock change
                })
              }}>
                Update Contract
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
