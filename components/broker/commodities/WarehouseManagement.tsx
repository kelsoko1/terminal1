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
  Edit, 
  MapPin, 
  Package, 
  Plus, 
  Search, 
  Trash2, 
  Warehouse 
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface WarehouseInventory {
  commodityId: string
  commodityName: string
  quantity: number
  unit: string
}

interface CommodityWarehouse {
  id: string
  name: string
  location: string
  address: string
  capacity: number
  capacityUnit: string
  utilization: number
  manager: string
  contact: string
  status: 'active' | 'maintenance' | 'full' | 'inactive'
  inventory: WarehouseInventory[]
}

// Mock data for warehouses
const mockWarehouses: CommodityWarehouse[] = [
  {
    id: 'w1',
    name: 'Mtwara Warehouse',
    location: 'Mtwara, Tanzania',
    address: '123 Port Road, Mtwara',
    capacity: 5000,
    capacityUnit: 'tons',
    utilization: 65,
    manager: 'Ahmed Mohammed',
    contact: '+255 712 345 678',
    status: 'active',
    inventory: [
      { commodityId: 'c1', commodityName: 'Cashew Nuts', quantity: 2500, unit: 'tons' },
      { commodityId: 'c4', commodityName: 'Sesame Seeds', quantity: 750, unit: 'tons' }
    ]
  },
  {
    id: 'w2',
    name: 'Kilimanjaro Warehouse',
    location: 'Moshi, Tanzania',
    address: '45 Coffee Street, Moshi',
    capacity: 2000,
    capacityUnit: 'tons',
    utilization: 85,
    manager: 'Grace Kimaro',
    contact: '+255 755 987 654',
    status: 'full',
    inventory: [
      { commodityId: 'c2', commodityName: 'Coffee (Arabica)', quantity: 1700, unit: 'tons' }
    ]
  },
  {
    id: 'w3',
    name: 'Geita Warehouse',
    location: 'Geita, Tanzania',
    address: '78 Mining Avenue, Geita',
    capacity: 500,
    capacityUnit: 'kg',
    utilization: 30,
    manager: 'John Massawe',
    contact: '+255 786 123 456',
    status: 'active',
    inventory: [
      { commodityId: 'c5', commodityName: 'Gold', quantity: 150, unit: 'kg' }
    ]
  },
  {
    id: 'w4',
    name: 'Arusha Secure Facility',
    location: 'Arusha, Tanzania',
    address: '12 Gemstone Road, Arusha',
    capacity: 1000,
    capacityUnit: 'carats',
    utilization: 10,
    manager: 'Sarah Johnson',
    contact: '+255 767 890 123',
    status: 'active',
    inventory: [
      { commodityId: 'c10', commodityName: 'Tanzanite', quantity: 100, unit: 'carats' }
    ]
  },
  {
    id: 'w5',
    name: 'Dodoma Warehouse',
    location: 'Dodoma, Tanzania',
    address: '56 Capital Street, Dodoma',
    capacity: 3000,
    capacityUnit: 'tons',
    utilization: 40,
    manager: 'David Ochieng',
    contact: '+255 744 567 890',
    status: 'maintenance',
    inventory: [
      { commodityId: 'c4', commodityName: 'Sesame Seeds', quantity: 1200, unit: 'tons' }
    ]
  }
]

export function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState<CommodityWarehouse[]>(mockWarehouses)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<CommodityWarehouse | null>(null)
  const [showInventoryDialog, setShowInventoryDialog] = useState(false)

  // Filter warehouses based on search term
  const filteredWarehouses = warehouses.filter(warehouse => 
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.manager.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle adding a new warehouse
  const handleAddWarehouse = (newWarehouse: Omit<CommodityWarehouse, 'id' | 'inventory'>) => {
    const id = `w${warehouses.length + 1}`
    
    setWarehouses([
      ...warehouses,
      {
        ...newWarehouse,
        id,
        inventory: []
      }
    ])
    
    setShowAddDialog(false)
  }

  // Handle updating a warehouse
  const handleUpdateWarehouse = (updatedWarehouse: CommodityWarehouse) => {
    setWarehouses(warehouses.map(warehouse => 
      warehouse.id === updatedWarehouse.id ? updatedWarehouse : warehouse
    ))
    setShowEditDialog(false)
    setSelectedWarehouse(null)
  }

  // Handle deleting a warehouse
  const handleDeleteWarehouse = (id: string) => {
    if (confirm('Are you sure you want to delete this warehouse?')) {
      setWarehouses(warehouses.filter(warehouse => warehouse.id !== id))
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: CommodityWarehouse['status']) => {
    switch (status) {
      case 'active': return 'default'
      case 'maintenance': return 'outline'
      case 'full': return 'secondary'
      case 'inactive': return 'destructive'
      default: return 'default'
    }
  }

  // Get utilization color
  const getUtilizationColor = (utilization: number) => {
    if (utilization < 50) return 'text-green-500'
    if (utilization < 80) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search warehouses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Button 
          size="sm"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Warehouse
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Warehouse className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Warehouses</p>
            <p className="text-2xl font-bold">{warehouses.length}</p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Capacity</p>
            <p className="text-2xl font-bold">
              {warehouses.reduce((total, w) => {
                if (w.capacityUnit === 'tons') return total + w.capacity
                return total
              }, 0).toLocaleString()} tons
            </p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Locations</p>
            <p className="text-2xl font-bold">
              {new Set(warehouses.filter(w => w.status === 'active').map(w => w.location.split(',')[0])).size}
            </p>
          </div>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Utilization</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWarehouses.length > 0 ? (
              filteredWarehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="font-medium">{warehouse.name}</TableCell>
                  <TableCell>{warehouse.location}</TableCell>
                  <TableCell>{warehouse.capacity.toLocaleString()} {warehouse.capacityUnit}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getUtilizationColor(warehouse.utilization)}`}
                          style={{ width: `${warehouse.utilization}%` }}
                        />
                      </div>
                      <span className={getUtilizationColor(warehouse.utilization)}>
                        {warehouse.utilization}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{warehouse.manager}</p>
                      <p className="text-muted-foreground">{warehouse.contact}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(warehouse.status)}>
                      {warehouse.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedWarehouse(warehouse)
                          setShowInventoryDialog(true)
                        }}
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedWarehouse(warehouse)
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteWarehouse(warehouse.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No warehouses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Warehouse Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Warehouse</DialogTitle>
            <DialogDescription>
              Add a new warehouse for commodity storage
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Warehouse Name</Label>
              <Input id="name" placeholder="e.g., Central Warehouse" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g., Dar es Salaam, Tanzania" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Full address" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" placeholder="e.g., 5000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacityUnit">Capacity Unit</Label>
                <Select defaultValue="tons">
                  <SelectTrigger id="capacityUnit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tons">Tons</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="carats">Carats</SelectItem>
                    <SelectItem value="oz">Ounces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager">Manager Name</Label>
                <Input id="manager" placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input id="contact" placeholder="e.g., +255 7xx xxx xxx" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="utilization">Initial Utilization (%)</Label>
              <Input id="utilization" type="number" defaultValue="0" min="0" max="100" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => {
              // Mock implementation - in a real app, you'd get values from form fields
              handleAddWarehouse({
                name: 'New Warehouse',
                location: 'New Location, Tanzania',
                address: 'New Address',
                capacity: 1000,
                capacityUnit: 'tons',
                utilization: 0,
                manager: 'New Manager',
                contact: '+255 700 000 000',
                status: 'active'
              })
            }}>
              Add Warehouse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Warehouse Dialog */}
      {selectedWarehouse && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Warehouse</DialogTitle>
              <DialogDescription>
                Update information for {selectedWarehouse.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Warehouse Name</Label>
                <Input id="edit-name" defaultValue={selectedWarehouse.name} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input id="edit-location" defaultValue={selectedWarehouse.location} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select defaultValue={selectedWarehouse.status}>
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input id="edit-address" defaultValue={selectedWarehouse.address} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input 
                    id="edit-capacity" 
                    type="number" 
                    defaultValue={selectedWarehouse.capacity} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-capacityUnit">Capacity Unit</Label>
                  <Select defaultValue={selectedWarehouse.capacityUnit}>
                    <SelectTrigger id="edit-capacityUnit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tons">Tons</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="carats">Carats</SelectItem>
                      <SelectItem value="oz">Ounces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-manager">Manager Name</Label>
                  <Input id="edit-manager" defaultValue={selectedWarehouse.manager} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contact">Contact Number</Label>
                  <Input id="edit-contact" defaultValue={selectedWarehouse.contact} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-utilization">Utilization (%)</Label>
                <Input 
                  id="edit-utilization" 
                  type="number" 
                  defaultValue={selectedWarehouse.utilization}
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowEditDialog(false)
                setSelectedWarehouse(null)
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Mock implementation - in a real app, you'd get values from form fields
                handleUpdateWarehouse({
                  ...selectedWarehouse,
                  name: selectedWarehouse.name + ' (Updated)', // Mock change
                  utilization: Math.min(100, selectedWarehouse.utilization + 5) // Mock change
                })
              }}>
                Update Warehouse
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Inventory Dialog */}
      {selectedWarehouse && (
        <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedWarehouse.name} Inventory</DialogTitle>
              <DialogDescription>
                Current inventory stored at this warehouse
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {selectedWarehouse.inventory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commodity</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedWarehouse.inventory.map((item) => (
                      <TableRow key={item.commodityId}>
                        <TableCell>{item.commodityName}</TableCell>
                        <TableCell>{item.quantity.toLocaleString()} {item.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No inventory items found</p>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowInventoryDialog(false)
                setSelectedWarehouse(null)
              }}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
