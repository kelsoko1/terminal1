'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Plus, 
  Search, 
  Trash2 
} from 'lucide-react'

interface FxProvider {
  id: string
  name: string
  type: 'bureau' | 'bank' | 'online'
  contactPerson: string
  email: string
  phone: string
  address: string
  status: 'active' | 'inactive'
  supportedCurrencies: string[]
  commissionRate: number
  notes: string
}

// Mock data for FX providers
const mockProviders: FxProvider[] = [
  {
    id: 'prov1',
    name: 'ABC Bureau de Change',
    type: 'bureau',
    contactPerson: 'Ahmed Mohammed',
    email: 'ahmed@abcbureau.co.tz',
    phone: '+255 712 345 678',
    address: '123 Samora Avenue, Dar es Salaam',
    status: 'active',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'KES'],
    commissionRate: 0.5,
    notes: 'Preferred provider for USD transactions.'
  },
  {
    id: 'prov2',
    name: 'XYZ Forex',
    type: 'bureau',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@xyzforex.co.tz',
    phone: '+255 755 987 654',
    address: '45 Nyerere Road, Dar es Salaam',
    status: 'active',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'ZAR'],
    commissionRate: 0.6,
    notes: 'Good rates for EUR and GBP.'
  },
  {
    id: 'prov3',
    name: 'Global FX',
    type: 'online',
    contactPerson: 'Michael Chen',
    email: 'michael@globalfx.com',
    phone: '+255 786 123 456',
    address: 'Online only',
    status: 'active',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CHF'],
    commissionRate: 0.4,
    notes: 'Online provider with competitive rates for major currencies.'
  },
  {
    id: 'prov4',
    name: 'CRDB Bank FX',
    type: 'bank',
    contactPerson: 'Grace Makundi',
    email: 'grace.makundi@crdb.co.tz',
    phone: '+255 767 890 123',
    address: 'CRDB Tower, Azikiwe Street, Dar es Salaam',
    status: 'active',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'KES', 'UGX', 'ZAR'],
    commissionRate: 0.7,
    notes: 'Bank provider with wider currency support but higher commission.'
  },
  {
    id: 'prov5',
    name: 'East African Exchange',
    type: 'bureau',
    contactPerson: 'David Ochieng',
    email: 'david@eaexchange.co.tz',
    phone: '+255 744 567 890',
    address: '78 Uhuru Street, Arusha',
    status: 'inactive',
    supportedCurrencies: ['USD', 'KES', 'UGX', 'RWF'],
    commissionRate: 0.55,
    notes: 'Specialized in East African currencies. Currently inactive due to licensing renewal.'
  }
]

export function FxProviderManagement() {
  const [providers, setProviders] = useState<FxProvider[]>(mockProviders)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<FxProvider | null>(null)

  // Filter providers based on search term
  const filteredProviders = providers.filter(provider => 
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.supportedCurrencies.some(curr => curr.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Handle adding a new provider
  const handleAddProvider = (newProvider: Omit<FxProvider, 'id'>) => {
    const id = `prov${providers.length + 1}`
    
    setProviders([
      ...providers,
      {
        ...newProvider,
        id
      }
    ])
    
    setShowAddDialog(false)
  }

  // Handle updating a provider
  const handleUpdateProvider = (updatedProvider: FxProvider) => {
    setProviders(providers.map(provider => 
      provider.id === updatedProvider.id ? updatedProvider : provider
    ))
    setShowEditDialog(false)
    setSelectedProvider(null)
  }

  // Handle deleting a provider
  const handleDeleteProvider = (id: string) => {
    if (confirm('Are you sure you want to delete this provider?')) {
      setProviders(providers.filter(provider => provider.id !== id))
    }
  }

  // Handle toggling provider status
  const handleToggleStatus = (id: string) => {
    setProviders(providers.map(provider => 
      provider.id === id ? { 
        ...provider, 
        status: provider.status === 'active' ? 'inactive' : 'active'
      } : provider
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Provider
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Supported Currencies</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">{provider.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {provider.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{provider.contactPerson}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{provider.email}</p>
                      <p>{provider.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {provider.supportedCurrencies.map(currency => (
                        <Badge key={currency} variant="secondary" className="text-xs">
                          {currency}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{provider.commissionRate}%</TableCell>
                  <TableCell>
                    <Badge 
                      variant={provider.status === 'active' ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => handleToggleStatus(provider.id)}
                    >
                      {provider.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedProvider(provider)
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteProvider(provider.id)}
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
                  No providers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Provider Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New FX Provider</DialogTitle>
            <DialogDescription>
              Add a new bureau de change or FX provider
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Provider Name</Label>
              <Input id="name" placeholder="e.g., ABC Bureau de Change" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Provider Type</Label>
              <Select defaultValue="bureau">
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select provider type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bureau">Bureau de Change</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="online">Online Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+255 7xx xxx xxx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                <Input id="commissionRate" type="number" step="0.1" placeholder="e.g., 0.5" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Physical address" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supportedCurrencies">Supported Currencies (comma-separated)</Label>
              <Input id="supportedCurrencies" placeholder="USD, EUR, GBP" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional information about this provider" />
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
              handleAddProvider({
                name: 'New Provider',
                type: 'bureau',
                contactPerson: 'Contact Person',
                email: 'contact@newprovider.com',
                phone: '+255 700 000 000',
                address: 'Address',
                status: 'active',
                supportedCurrencies: ['USD', 'EUR'],
                commissionRate: 0.5,
                notes: 'New provider notes'
              })
            }}>
              Add Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Provider Dialog */}
      {selectedProvider && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Provider</DialogTitle>
              <DialogDescription>
                Update information for {selectedProvider.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Provider Name</Label>
                <Input id="edit-name" defaultValue={selectedProvider.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-type">Provider Type</Label>
                <Select defaultValue={selectedProvider.type}>
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Select provider type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bureau">Bureau de Change</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="online">Online Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contactPerson">Contact Person</Label>
                  <Input id="edit-contactPerson" defaultValue={selectedProvider.contactPerson} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" defaultValue={selectedProvider.email} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input id="edit-phone" defaultValue={selectedProvider.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-commissionRate">Commission Rate (%)</Label>
                  <Input 
                    id="edit-commissionRate" 
                    type="number" 
                    step="0.1" 
                    defaultValue={selectedProvider.commissionRate} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input id="edit-address" defaultValue={selectedProvider.address} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-supportedCurrencies">Supported Currencies (comma-separated)</Label>
                <Input 
                  id="edit-supportedCurrencies" 
                  defaultValue={selectedProvider.supportedCurrencies.join(', ')} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea id="edit-notes" defaultValue={selectedProvider.notes} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select defaultValue={selectedProvider.status}>
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
                setSelectedProvider(null)
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Mock implementation - in a real app, you'd get values from form fields
                handleUpdateProvider({
                  ...selectedProvider,
                  name: selectedProvider.name + ' (Updated)', // Mock change
                  commissionRate: selectedProvider.commissionRate + 0.1 // Mock change
                })
              }}>
                Update Provider
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
