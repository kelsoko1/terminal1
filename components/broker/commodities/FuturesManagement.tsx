import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFuturesContracts } from '@/contexts/FuturesContractsContext'
import { useToast } from '@/components/ui/use-toast'
import FuturesOrderBook from './FuturesOrderBook'
import FuturesMatchingEngine from './FuturesMatchingEngine'

const FUTURES_CATEGORIES = [
  { key: 'fx', label: 'FX' },
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'metals', label: 'Metals' },
  { key: 'rates', label: 'Interest Rates' },
  { key: 'crypto', label: 'Cryptocurrency' },
]

type FuturesCategory = typeof FUTURES_CATEGORIES[number]['key']

type FuturesContract = {
  symbol: string
  name: string
  expiry: string
  price: number
  category: FuturesCategory
}

const INITIAL_MOCK_FUTURES: Record<FuturesCategory, FuturesContract[]> = {
  fx: [
    { symbol: 'USD/TZS-JUN24', name: 'USD/TZS Futures', expiry: '2024-06-30', price: 2550, category: 'fx' },
    { symbol: 'EUR/USD-SEP24', name: 'EUR/USD Futures', expiry: '2024-09-30', price: 1.09, category: 'fx' },
  ],
  agriculture: [
    { symbol: 'COFFEE-DEC24', name: 'Coffee Futures', expiry: '2024-12-15', price: 3200, category: 'agriculture' },
    { symbol: 'COTTON-MAR25', name: 'Cotton Futures', expiry: '2025-03-20', price: 2100, category: 'agriculture' },
  ],
  metals: [
    { symbol: 'GOLD-JUN24', name: 'Gold Futures', expiry: '2024-06-30', price: 2875000, category: 'metals' },
    { symbol: 'SILVER-SEP24', name: 'Silver Futures', expiry: '2024-09-30', price: 35000, category: 'metals' },
  ],
  rates: [
    { symbol: 'TBILL-1Y-DEC24', name: '1Y Treasury Bill Futures', expiry: '2024-12-31', price: 98.5, category: 'rates' },
    { symbol: 'TBOND-10Y-JUN25', name: '10Y Treasury Bond Futures', expiry: '2025-06-30', price: 102.3, category: 'rates' },
  ],
  crypto: [
    { symbol: 'BTC-USD-SEP24', name: 'Bitcoin Futures', expiry: '2024-09-30', price: 65000, category: 'crypto' },
    { symbol: 'ETH-USD-SEP24', name: 'Ethereum Futures', expiry: '2024-09-30', price: 3200, category: 'crypto' },
  ],
}

const MAIN_TABS = [
  ...FUTURES_CATEGORIES.map(cat => ({ key: cat.key, label: cat.label })),
  { key: 'orderbook', label: 'Order Book' },
  { key: 'matching', label: 'Matching Engine' },
]

export function FuturesManagement() {
  const { contracts, addContract, updateContract, deleteContract, categories } = useFuturesContracts()
  const [activeTab, setActiveTab] = useState<string>(FUTURES_CATEGORIES[0].key)
  const [showSheet, setShowSheet] = useState(false)
  const [editingContract, setEditingContract] = useState<FuturesContract | null>(null)
  const [form, setForm] = useState<FuturesContract>({ symbol: '', name: '', expiry: '', price: 0, category: 'fx' })
  const [isEdit, setIsEdit] = useState(false)
  const { toast } = useToast()

  const logAudit = async (action: string, contract: FuturesContract) => {
    await fetch('/api/futures-contracts/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, contract, user: 'broker-demo' })
    })
  }

  const openNewContract = () => {
    setForm({ symbol: '', name: '', expiry: '', price: 0, category: selectedCategory })
    setIsEdit(false)
    setShowSheet(true)
  }

  const openEditContract = (contract: FuturesContract) => {
    setForm({ ...contract, category: contract.category })
    setEditingContract(contract)
    setIsEdit(true)
    setShowSheet(true)
  }

  const handleFormChange = (field: keyof FuturesContract, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value, category: selectedCategory }))
  }

  const handleSave = async () => {
    const contractWithCategory: FuturesContract = { ...form, category: selectedCategory }
    if (isEdit && editingContract) {
      await updateContract(contractWithCategory)
      toast({ title: 'Contract updated', description: contractWithCategory.name })
      await logAudit('update', contractWithCategory)
    } else {
      await addContract(contractWithCategory)
      toast({ title: 'Contract created', description: contractWithCategory.name })
      await logAudit('create', contractWithCategory)
    }
    setShowSheet(false)
    setEditingContract(null)
    setForm({ symbol: '', name: '', expiry: '', price: 0, category: selectedCategory })
  }

  const handleDelete = async (symbol: string) => {
    const contract = contracts[selectedCategory].find((c: FuturesContract) => c.symbol === symbol)
    await deleteContract(symbol, selectedCategory)
    toast({ title: 'Contract deleted', description: contract?.name })
    if (contract) await logAudit('delete', contract)
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Futures Exchange Management</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {MAIN_TABS.map(tab => (
            <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
        {FUTURES_CATEGORIES.map(cat => (
          <TabsContent key={cat.key} value={cat.key} className="space-y-4">
            <div className="flex justify-end mb-2">
              <Button onClick={openNewContract}>New Contract</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts[cat.key as FuturesCategory].map(contract => (
                  <TableRow key={contract.symbol}>
                    <TableCell>{contract.name}</TableCell>
                    <TableCell>{contract.symbol}</TableCell>
                    <TableCell>{contract.expiry}</TableCell>
                    <TableCell>{contract.price}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openEditContract(contract)} className="mr-2">Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(contract.symbol)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
        <TabsContent value="orderbook">
          <FuturesOrderBook />
        </TabsContent>
        <TabsContent value="matching">
          <FuturesMatchingEngine />
        </TabsContent>
      </Tabs>
      {/* Create/Edit Sheet */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent side="right" className="max-w-md w-full">
          <SheetHeader>
            <SheetTitle>{isEdit ? 'Edit Contract' : 'New Contract'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={e => handleFormChange('name', e.target.value)}
                placeholder="Contract Name"
              />
            </div>
            <div>
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={form.symbol}
                onChange={e => handleFormChange('symbol', e.target.value)}
                placeholder="Symbol"
                disabled={isEdit}
              />
            </div>
            <div>
              <Label htmlFor="expiry">Expiry</Label>
              <Input
                id="expiry"
                value={form.expiry}
                onChange={e => handleFormChange('expiry', e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={form.price}
                onChange={e => handleFormChange('price', parseFloat(e.target.value))}
                placeholder="Price"
              />
            </div>
            <SheetFooter>
              <Button onClick={handleSave}>{isEdit ? 'Save Changes' : 'Create Contract'}</Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  )
}

export default FuturesManagement 