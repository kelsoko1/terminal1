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
  Edit, 
  Filter, 
  Plus, 
  Search, 
  Trash2 
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

// Define commodity categories
type CommodityCategory = 'agricultural' | 'metals' | 'energy' | 'specialty'

// Define commodity interface
interface Commodity {
  id: string
  name: string
  symbol: string
  category: CommodityCategory
  price: number
  unit: string
  change: number
  volume: number
  grade: string
  warehouse: string
  origin: string
  description: string
  minimumOrder: number
  status: 'active' | 'inactive'
  lastUpdated: string
}

// Mock data for commodities based on Tanzania Mercantile Exchange offerings
const mockCommodities: Commodity[] = [
  {
    id: 'c1',
    name: 'Cashew Nuts',
    symbol: 'CASH',
    category: 'agricultural',
    price: 2850,
    unit: 'kg',
    change: 1.2,
    volume: 25000,
    grade: 'W320',
    warehouse: 'Mtwara Warehouse',
    origin: 'Mtwara, Tanzania',
    description: 'Premium grade cashew nuts from Southern Tanzania.',
    minimumOrder: 100,
    status: 'active',
    lastUpdated: '2025-04-12T08:30:00Z'
  },
  {
    id: 'c2',
    name: 'Coffee (Arabica)',
    symbol: 'COFA',
    category: 'agricultural',
    price: 7500,
    unit: 'kg',
    change: 2.5,
    volume: 15000,
    grade: 'AA',
    warehouse: 'Kilimanjaro Warehouse',
    origin: 'Kilimanjaro, Tanzania',
    description: 'High-quality Arabica coffee beans from the slopes of Mount Kilimanjaro.',
    minimumOrder: 60,
    status: 'active',
    lastUpdated: '2025-04-12T08:30:00Z'
  },
  {
    id: 'c3',
    name: 'Coffee (Robusta)',
    symbol: 'COFR',
    category: 'agricultural',
    price: 4200,
    unit: 'kg',
    change: -0.8,
    volume: 18000,
    grade: 'A',
    warehouse: 'Kagera Warehouse',
    origin: 'Kagera, Tanzania',
    description: 'Robust coffee beans from the Kagera region.',
    minimumOrder: 60,
    status: 'active',
    lastUpdated: '2025-04-12T08:30:00Z'
  },
  {
    id: 'c5',
    name: 'Gold',
    symbol: 'GOLD',
    category: 'metals',
    price: 2850000,
    unit: 'oz',
    change: 0.3,
    volume: 500,
    grade: '24K',
    warehouse: 'Geita Warehouse',
    origin: 'Geita, Tanzania',
    description: 'Pure gold from Tanzania\'s Geita mines.',
    minimumOrder: 1,
    status: 'active',
    lastUpdated: '2025-04-12T08:30:00Z'
  },
  {
    id: 'c10',
    name: 'Tanzanite',
    symbol: 'TANZ',
    category: 'specialty',
    price: 1250000,
    unit: 'carat',
    change: 0.1,
    volume: 100,
    grade: 'AAA',
    warehouse: 'Arusha Secure Facility',
    origin: 'Merelani, Tanzania',
    description: 'Rare Tanzanite gemstones from the only known source in the world.',
    minimumOrder: 1,
    status: 'inactive',
    lastUpdated: '2025-04-12T08:30:00Z'
  }
]

export function CommodityList() {
  const [commodities, setCommodities] = useState<Commodity[]>(mockCommodities)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CommodityCategory | 'all'>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Commodity; direction: 'asc' | 'desc' } | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Sort function for commodities
  const sortedCommodities = [...commodities].sort((a, b) => {
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

  // Filter commodities based on search term and category
  const filteredCommodities = sortedCommodities.filter(commodity => {
    const matchesSearch = 
      commodity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commodity.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commodity.origin.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || commodity.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Handle sort request
  const requestSort = (key: keyof Commodity) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Handle adding a new commodity
  const handleAddCommodity = (newCommodity: Omit<Commodity, 'id' | 'lastUpdated' | 'change' | 'volume'>) => {
    const now = new Date().toISOString()
    const id = `c${commodities.length + 1}`
    
    setCommodities([
      ...commodities,
      {
        ...newCommodity,
        id,
        change: 0,
        volume: 0,
        lastUpdated: now
      }
    ])
    
    setShowAddDialog(false)
  }

  // Handle updating a commodity
  const handleUpdateCommodity = (updatedCommodity: Commodity) => {
    setCommodities(commodities.map(commodity => 
      commodity.id === updatedCommodity.id ? { ...updatedCommodity, lastUpdated: new Date().toISOString() } : commodity
    ))
    setShowEditDialog(false)
    setSelectedCommodity(null)
  }

  // Handle deleting a commodity
  const handleDeleteCommodity = (id: string) => {
    if (confirm('Are you sure you want to delete this commodity?')) {
      setCommodities(commodities.filter(commodity => commodity.id !== id))
    }
  }

  // Handle toggling commodity status
  const handleToggleStatus = (id: string) => {
    setCommodities(commodities.map(commodity => 
      commodity.id === id ? { 
        ...commodity, 
        status: commodity.status === 'active' ? 'inactive' : 'active',
        lastUpdated: new Date().toISOString() 
      } : commodity
    ))
  }

  return (
    <div className="space-y-4">
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
            Add Commodity
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => setSelectedCategory(value as CommodityCategory | 'all')}
              >
                <SelectTrigger>
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
                  Name
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
              <TableHead className="cursor-pointer" onClick={() => requestSort('category')}>
                <div className="flex items-center">
                  Category
                  {sortConfig?.key === 'category' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('price')}>
                <div className="flex items-center">
                  Price
                  {sortConfig?.key === 'price' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Warehouse</TableHead>
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
            {filteredCommodities.length > 0 ? (
              filteredCommodities.map((commodity) => (
                <TableRow key={commodity.id}>
                  <TableCell className="font-medium">{commodity.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{commodity.symbol}</Badge>
                  </TableCell>
                  <TableCell>{commodity.category}</TableCell>
                  <TableCell>{commodity.price.toLocaleString()} TZS/{commodity.unit}</TableCell>
                  <TableCell>{commodity.grade}</TableCell>
                  <TableCell>{commodity.warehouse}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={commodity.status === 'active' ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => handleToggleStatus(commodity.id)}
                    >
                      {commodity.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCommodity(commodity)
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCommodity(commodity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No commodities found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Commodity Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Commodity</DialogTitle>
            <DialogDescription>
              Add a new commodity to the trading platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Commodity Name</Label>
                <Input id="name" placeholder="e.g., Cashew Nuts" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input id="symbol" placeholder="e.g., CASH" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue="agricultural">
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agricultural">Agricultural</SelectItem>
                  <SelectItem value="metals">Metals</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="specialty">Specialty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (TZS)</Label>
                <Input id="price" type="number" placeholder="e.g., 2850" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" placeholder="e.g., kg" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input id="grade" placeholder="e.g., Premium" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumOrder">Minimum Order</Label>
                <Input id="minimumOrder" type="number" placeholder="e.g., 100" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse</Label>
              <Input id="warehouse" placeholder="e.g., Mtwara Warehouse" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input id="origin" placeholder="e.g., Mtwara, Tanzania" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Detailed description of the commodity" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="active">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
              handleAddCommodity({
                name: 'New Commodity',
                symbol: 'NEW',
                category: 'agricultural',
                price: 1000,
                unit: 'kg',
                grade: 'Standard',
                warehouse: 'Central Warehouse',
                origin: 'Tanzania',
                description: 'New commodity description',
                minimumOrder: 50,
                status: 'active'
              })
            }}>
              Add Commodity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Commodity Dialog */}
      {selectedCommodity && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Commodity</DialogTitle>
              <DialogDescription>
                Update information for {selectedCommodity.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Commodity Name</Label>
                  <Input id="edit-name" defaultValue={selectedCommodity.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-symbol">Symbol</Label>
                  <Input id="edit-symbol" defaultValue={selectedCommodity.symbol} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select defaultValue={selectedCommodity.category}>
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agricultural">Agricultural</SelectItem>
                    <SelectItem value="metals">Metals</SelectItem>
                    <SelectItem value="energy">Energy</SelectItem>
                    <SelectItem value="specialty">Specialty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (TZS)</Label>
                  <Input 
                    id="edit-price" 
                    type="number" 
                    defaultValue={selectedCommodity.price} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Input id="edit-unit" defaultValue={selectedCommodity.unit} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-grade">Grade</Label>
                  <Input id="edit-grade" defaultValue={selectedCommodity.grade} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-minimumOrder">Minimum Order</Label>
                  <Input 
                    id="edit-minimumOrder" 
                    type="number" 
                    defaultValue={selectedCommodity.minimumOrder} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-warehouse">Warehouse</Label>
                <Input id="edit-warehouse" defaultValue={selectedCommodity.warehouse} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-origin">Origin</Label>
                <Input id="edit-origin" defaultValue={selectedCommodity.origin} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea id="edit-description" defaultValue={selectedCommodity.description} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select defaultValue={selectedCommodity.status}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowEditDialog(false)
                setSelectedCommodity(null)
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Mock implementation - in a real app, you'd get values from form fields
                handleUpdateCommodity({
                  ...selectedCommodity,
                  price: selectedCommodity.price + 100, // Mock change
                  grade: selectedCommodity.grade + '+' // Mock change
                })
              }}>
                Update Commodity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
