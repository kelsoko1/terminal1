'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  DialogTitle, 
  DialogTrigger 
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
  Download, 
  Edit, 
  Plus, 
  RefreshCw, 
  Search, 
  Trash2 
} from 'lucide-react'
import { FxRateEditor } from './FxRateEditor'
import { FxTransactionList } from './FxTransactionList'
import { FxProviderManagement } from './FxProviderManagement'

interface CurrencyPair {
  id: string
  name: string
  baseCurrency: string
  quoteCurrency: string
  exchangeRate: number
  spread: number
  minAmount: number
  status: 'active' | 'inactive'
  lastUpdated: string
}

// Mock data for currency pairs
const mockCurrencyPairs: CurrencyPair[] = [
  {
    id: 'fx1',
    name: 'TZS/USD',
    baseCurrency: 'TZS',
    quoteCurrency: 'USD',
    exchangeRate: 2500,
    spread: 0.5,
    minAmount: 100000,
    status: 'active',
    lastUpdated: '2025-04-12T08:30:00Z'
  },
  {
    id: 'fx2',
    name: 'TZS/EUR',
    baseCurrency: 'TZS',
    quoteCurrency: 'EUR',
    exchangeRate: 2700,
    spread: 0.6,
    minAmount: 100000,
    status: 'active',
    lastUpdated: '2025-04-12T08:30:00Z'
  },
  {
    id: 'fx3',
    name: 'TZS/GBP',
    baseCurrency: 'TZS',
    quoteCurrency: 'GBP',
    exchangeRate: 3100,
    spread: 0.7,
    minAmount: 100000,
    status: 'active',
    lastUpdated: '2025-04-12T08:30:00Z'
  },
  {
    id: 'fx4',
    name: 'USD/TZS',
    baseCurrency: 'USD',
    quoteCurrency: 'TZS',
    exchangeRate: 0.0004,
    spread: 0.5,
    minAmount: 50,
    status: 'active',
    lastUpdated: '2025-04-12T08:30:00Z'
  },
  {
    id: 'fx5',
    name: 'EUR/TZS',
    baseCurrency: 'EUR',
    quoteCurrency: 'TZS',
    exchangeRate: 0.00037,
    spread: 0.6,
    minAmount: 50,
    status: 'active',
    lastUpdated: '2025-04-12T08:30:00Z'
  }
]

export function FxManagement() {
  const [currencyPairs, setCurrencyPairs] = useState<CurrencyPair[]>(mockCurrencyPairs)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddPairDialog, setShowAddPairDialog] = useState(false)
  const [showEditRateDialog, setShowEditRateDialog] = useState(false)
  const [selectedPair, setSelectedPair] = useState<CurrencyPair | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof CurrencyPair; direction: 'asc' | 'desc' } | null>(null)

  // Sort function for currency pairs
  const sortedPairs = [...currencyPairs].sort((a, b) => {
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

  // Filter pairs based on search term
  const filteredPairs = sortedPairs.filter(pair => 
    pair.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pair.baseCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pair.quoteCurrency.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle sort request
  const requestSort = (key: keyof CurrencyPair) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Handle adding a new currency pair
  const handleAddPair = (newPair: Omit<CurrencyPair, 'id' | 'lastUpdated'>) => {
    const now = new Date().toISOString()
    const id = `fx${currencyPairs.length + 1}`
    
    setCurrencyPairs([
      ...currencyPairs,
      {
        ...newPair,
        id,
        lastUpdated: now
      }
    ])
    
    setShowAddPairDialog(false)
  }

  // Handle updating a currency pair
  const handleUpdatePair = (updatedPair: CurrencyPair) => {
    setCurrencyPairs(currencyPairs.map(pair => 
      pair.id === updatedPair.id ? { ...updatedPair, lastUpdated: new Date().toISOString() } : pair
    ))
    setShowEditRateDialog(false)
    setSelectedPair(null)
  }

  // Handle deleting a currency pair
  const handleDeletePair = (id: string) => {
    if (confirm('Are you sure you want to delete this currency pair?')) {
      setCurrencyPairs(currencyPairs.filter(pair => pair.id !== id))
    }
  }

  // Handle toggling pair status
  const handleToggleStatus = (id: string) => {
    setCurrencyPairs(currencyPairs.map(pair => 
      pair.id === id ? { 
        ...pair, 
        status: pair.status === 'active' ? 'inactive' : 'active',
        lastUpdated: new Date().toISOString() 
      } : pair
    ))
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">FX Spot Trading Management</h2>
            <p className="text-muted-foreground">
              Manage currency pairs, rates, and transactions for FX spot trading
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Rates
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setShowAddPairDialog(true)}>
              <Plus className="h-4 w-4" />
              Add Currency Pair
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pairs">
          <TabsList className="bg-transparent border rounded-lg p-1 mb-6">
            <TabsTrigger 
              value="pairs"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Currency Pairs
            </TabsTrigger>
            <TabsTrigger 
              value="transactions"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Transactions
            </TabsTrigger>
            <TabsTrigger 
              value="providers"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              FX Providers
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pairs">
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search currency pairs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>
                      <div className="flex items-center">
                        Currency Pair
                        {sortConfig?.key === 'name' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('exchangeRate')}>
                      <div className="flex items-center">
                        Exchange Rate
                        {sortConfig?.key === 'exchangeRate' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('spread')}>
                      <div className="flex items-center">
                        Spread
                        {sortConfig?.key === 'spread' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('minAmount')}>
                      <div className="flex items-center">
                        Min Amount
                        {sortConfig?.key === 'minAmount' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>
                      <div className="flex items-center">
                        Status
                        {sortConfig?.key === 'status' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('lastUpdated')}>
                      <div className="flex items-center">
                        Last Updated
                        {sortConfig?.key === 'lastUpdated' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPairs.length > 0 ? (
                    filteredPairs.map((pair) => (
                      <TableRow key={pair.id}>
                        <TableCell className="font-medium">{pair.name}</TableCell>
                        <TableCell>{pair.exchangeRate.toFixed(4)}</TableCell>
                        <TableCell>{pair.spread}%</TableCell>
                        <TableCell>
                          {pair.minAmount.toLocaleString()} {pair.baseCurrency}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={pair.status === 'active' ? 'default' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() => handleToggleStatus(pair.id)}
                          >
                            {pair.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(pair.lastUpdated).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedPair(pair)
                                setShowEditRateDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePair(pair.id)}
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
                        No currency pairs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <FxTransactionList />
          </TabsContent>

          <TabsContent value="providers">
            <FxProviderManagement />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="default-spread">Default Spread (%)</Label>
                      <Input id="default-spread" type="number" defaultValue="0.5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rate-refresh">Rate Refresh Interval (minutes)</Label>
                      <Input id="rate-refresh" type="number" defaultValue="15" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="auto-approve">Auto-approve Transactions</Label>
                    <Select defaultValue="below">
                      <SelectTrigger id="auto-approve">
                        <SelectValue placeholder="Select threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All transactions</SelectItem>
                        <SelectItem value="below">Below threshold</SelectItem>
                        <SelectItem value="none">None (manual approval)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="approval-threshold">Approval Threshold Amount</Label>
                    <Input id="approval-threshold" type="number" defaultValue="1000000" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button>Save Settings</Button>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">API Integration</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-source">FX Rate API Source</Label>
                    <Select defaultValue="internal">
                      <SelectTrigger id="api-source">
                        <SelectValue placeholder="Select API source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal (Manual)</SelectItem>
                        <SelectItem value="external">External API</SelectItem>
                        <SelectItem value="mixed">Mixed (External with Manual Override)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input id="api-key" type="password" placeholder="Enter API key" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-endpoint">API Endpoint</Label>
                    <Input id="api-endpoint" placeholder="https://api.example.com/fx-rates" />
                  </div>
                </div>
                
                <div className="mt-6 flex gap-2">
                  <Button>Save API Settings</Button>
                  <Button variant="outline">Test Connection</Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Add Currency Pair Dialog */}
      <Dialog open={showAddPairDialog} onOpenChange={setShowAddPairDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Currency Pair</DialogTitle>
            <DialogDescription>
              Create a new currency pair for FX spot trading
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseCurrency">Base Currency</Label>
                <Input id="baseCurrency" placeholder="e.g., TZS" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quoteCurrency">Quote Currency</Label>
                <Input id="quoteCurrency" placeholder="e.g., USD" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exchangeRate">Exchange Rate</Label>
              <Input id="exchangeRate" type="number" step="0.0001" placeholder="e.g., 2500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="spread">Spread (%)</Label>
                <Input id="spread" type="number" step="0.1" placeholder="e.g., 0.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minAmount">Minimum Amount</Label>
                <Input id="minAmount" type="number" placeholder="e.g., 100000" />
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
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPairDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => {
              // Mock implementation - in a real app, you'd get values from form fields
              handleAddPair({
                name: 'NEW/PAIR',
                baseCurrency: 'NEW',
                quoteCurrency: 'PAIR',
                exchangeRate: 1.0,
                spread: 0.5,
                minAmount: 100000,
                status: 'active'
              })
            }}>
              Add Currency Pair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rate Dialog */}
      {selectedPair && (
        <Dialog open={showEditRateDialog} onOpenChange={setShowEditRateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit {selectedPair.name} Rate</DialogTitle>
              <DialogDescription>
                Update exchange rate and spread for this currency pair
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editExchangeRate">Exchange Rate</Label>
                <Input 
                  id="editExchangeRate" 
                  type="number" 
                  step="0.0001" 
                  defaultValue={selectedPair.exchangeRate}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editSpread">Spread (%)</Label>
                <Input 
                  id="editSpread" 
                  type="number" 
                  step="0.1" 
                  defaultValue={selectedPair.spread}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editMinAmount">Minimum Amount</Label>
                <Input 
                  id="editMinAmount" 
                  type="number" 
                  defaultValue={selectedPair.minAmount}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select defaultValue={selectedPair.status}>
                  <SelectTrigger id="editStatus">
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
                setShowEditRateDialog(false)
                setSelectedPair(null)
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Mock implementation - in a real app, you'd get values from form fields
                handleUpdatePair({
                  ...selectedPair,
                  exchangeRate: selectedPair.exchangeRate + 0.01, // Mock change
                  spread: selectedPair.spread
                })
              }}>
                Update Rate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
