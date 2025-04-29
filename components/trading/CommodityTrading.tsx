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
  ArrowUpRight, 
  Info, 
  Search, 
  TrendingUp, 
  Filter, 
  BarChart3 
} from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

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
    minimumOrder: 100
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
    minimumOrder: 60
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
    minimumOrder: 60
  },
  {
    id: 'c4',
    name: 'Sesame Seeds',
    symbol: 'SESA',
    category: 'agricultural',
    price: 3600,
    unit: 'kg',
    change: 0.5,
    volume: 30000,
    grade: 'Premium',
    warehouse: 'Dodoma Warehouse',
    origin: 'Dodoma, Tanzania',
    description: 'High-quality sesame seeds from central Tanzania.',
    minimumOrder: 100
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
    minimumOrder: 1
  },
  {
    id: 'c6',
    name: 'Copper',
    symbol: 'COPP',
    category: 'metals',
    price: 32000,
    unit: 'kg',
    change: -1.2,
    volume: 12000,
    grade: 'Grade A',
    warehouse: 'Mbeya Warehouse',
    origin: 'Mbeya, Tanzania',
    description: 'Industrial grade copper from Tanzanian mines.',
    minimumOrder: 50
  },
  {
    id: 'c7',
    name: 'Cotton',
    symbol: 'COTN',
    category: 'agricultural',
    price: 2200,
    unit: 'kg',
    change: 1.8,
    volume: 45000,
    grade: 'Long Staple',
    warehouse: 'Shinyanga Warehouse',
    origin: 'Shinyanga, Tanzania',
    description: 'High-quality long staple cotton from Tanzania\'s cotton belt.',
    minimumOrder: 100
  },
  {
    id: 'c8',
    name: 'Cocoa',
    symbol: 'COCO',
    category: 'agricultural',
    price: 6800,
    unit: 'kg',
    change: 2.1,
    volume: 8000,
    grade: 'Premium',
    warehouse: 'Mbeya Warehouse',
    origin: 'Mbeya, Tanzania',
    description: 'Premium cocoa beans from Tanzania\'s southern highlands.',
    minimumOrder: 50
  },
  {
    id: 'c9',
    name: 'Natural Gas',
    symbol: 'NGAS',
    category: 'energy',
    price: 12500,
    unit: 'MMBtu',
    change: 3.2,
    volume: 5000,
    grade: 'Standard',
    warehouse: 'Mtwara Gas Terminal',
    origin: 'Mtwara, Tanzania',
    description: 'Natural gas from Tanzania\'s southern gas fields.',
    minimumOrder: 10
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
    minimumOrder: 1
  }
]

export function CommodityTrading() {
  const [selectedCategory, setSelectedCategory] = useState<CommodityCategory | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null)
  const [showTradeDialog, setShowTradeDialog] = useState(false)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const { t } = useLanguage()

  // Filter commodities based on category and search term
  const filteredCommodities = mockCommodities.filter(commodity => {
    const matchesCategory = selectedCategory === 'all' || commodity.category === selectedCategory
    const matchesSearch = 
      commodity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commodity.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commodity.origin.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesPriceRange = true
    if (priceRange.min && !isNaN(parseFloat(priceRange.min))) {
      matchesPriceRange = matchesPriceRange && commodity.price >= parseFloat(priceRange.min)
    }
    if (priceRange.max && !isNaN(parseFloat(priceRange.max))) {
      matchesPriceRange = matchesPriceRange && commodity.price <= parseFloat(priceRange.max)
    }
    
    return matchesCategory && matchesSearch && matchesPriceRange
  })

  // Handle trade submission
  const handleTrade = () => {
    if (!selectedCommodity || !quantity) return
    
    // In a real application, this would connect to a backend service to execute the trade
    console.log('Commodity Trade executed:', {
      commodity: selectedCommodity.name,
      symbol: selectedCommodity.symbol,
      type: tradeType,
      quantity: parseFloat(quantity),
      price: selectedCommodity.price,
      total: parseFloat(quantity) * selectedCommodity.price
    })
    
    // Close the dialog after trade is submitted
    setShowTradeDialog(false)
    setQuantity('')
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{t('commodityTrading') || 'Commodity Trading'}</h2>
            <p className="text-muted-foreground">
              {t('commodityTradingDesc') || `Trade agricultural, metals, energy and specialty commodities`}
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchCommodities') || "Search commodities..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('priceRange') || 'Price Range'}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input 
                      placeholder={t('min') || "Min"}
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      type="number"
                    />
                  </div>
                  <div>
                    <Input 
                      placeholder={t('max') || "Max"}
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      type="number"
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
                  setPriceRange({ min: '', max: '' })
                }}
              >
                {t('clearFilters') || 'Clear Filters'}
              </Button>
            </div>
          </Card>
        )}

        <Tabs defaultValue="all">
          <TabsList className="bg-transparent border rounded-lg p-1 mb-6">
            <TabsTrigger 
              value="all"
              onClick={() => setSelectedCategory('all')}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('allCommodities') || 'All Commodities'}
            </TabsTrigger>
            <TabsTrigger 
              value="agricultural"
              onClick={() => setSelectedCategory('agricultural')}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('agricultural') || 'Agricultural'}
            </TabsTrigger>
            <TabsTrigger 
              value="metals"
              onClick={() => setSelectedCategory('metals')}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('metals') || 'Metals'}
            </TabsTrigger>
            <TabsTrigger 
              value="energy"
              onClick={() => setSelectedCategory('energy')}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('energy') || 'Energy'}
            </TabsTrigger>
            <TabsTrigger 
              value="specialty"
              onClick={() => setSelectedCategory('specialty')}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('specialty') || 'Specialty'}
            </TabsTrigger>
            <TabsTrigger 
              value="my-positions"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('myPositions') || 'My Positions'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <CommodityTable 
              commodities={filteredCommodities} 
              onTrade={(commodity, type) => {
                setSelectedCommodity(commodity)
                setTradeType(type)
                setShowTradeDialog(true)
              }}
            />
          </TabsContent>

          <TabsContent value="agricultural">
            <CommodityTable 
              commodities={filteredCommodities} 
              onTrade={(commodity, type) => {
                setSelectedCommodity(commodity)
                setTradeType(type)
                setShowTradeDialog(true)
              }}
            />
          </TabsContent>

          <TabsContent value="metals">
            <CommodityTable 
              commodities={filteredCommodities} 
              onTrade={(commodity, type) => {
                setSelectedCommodity(commodity)
                setTradeType(type)
                setShowTradeDialog(true)
              }}
            />
          </TabsContent>

          <TabsContent value="energy">
            <CommodityTable 
              commodities={filteredCommodities} 
              onTrade={(commodity, type) => {
                setSelectedCommodity(commodity)
                setTradeType(type)
                setShowTradeDialog(true)
              }}
            />
          </TabsContent>

          <TabsContent value="specialty">
            <CommodityTable 
              commodities={filteredCommodities} 
              onTrade={(commodity, type) => {
                setSelectedCommodity(commodity)
                setTradeType(type)
                setShowTradeDialog(true)
              }}
            />
          </TabsContent>

          <TabsContent value="my-positions">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {t('noPositionsYet') || 'No positions yet. Start trading to see your positions here.'}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('marketAnalytics') || 'Market Analytics'}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('priceHistory') || 'Price History'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('dataSource') || 'Data source: Tanzania Mercantile Exchange (TMX)'}
          </p>
        </div>
      </Card>

      {/* Trade Dialog */}
      {selectedCommodity && (
        <Dialog open={showTradeDialog} onOpenChange={setShowTradeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {tradeType === 'buy' ? t('buyCommodity') || 'Buy' : t('sellCommodity') || 'Sell'} {selectedCommodity.name}
              </DialogTitle>
              <DialogDescription>
                {t('enterTradeDetails') || 'Enter the details for your commodity trade'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">{t('currentPrice') || 'Current Price'}:</p>
                  <p className="text-lg font-bold">
                    {selectedCommodity.price.toLocaleString()} TZS/{selectedCommodity.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('change') || 'Change'}:</p>
                  <p className={`text-lg ${selectedCommodity.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedCommodity.change >= 0 ? '+' : ''}{selectedCommodity.change}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradeType">{t('tradeType') || 'Trade Type'}</Label>
                <Select 
                  value={tradeType} 
                  onValueChange={(value) => setTradeType(value as 'buy' | 'sell')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectTradeType') || "Select trade type"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">{t('buy') || 'Buy'}</SelectItem>
                    <SelectItem value="sell">{t('sell') || 'Sell'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="quantity">
                    {t('quantity') || 'Quantity'} ({selectedCommodity.unit})
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {t('minOrder') || 'Min order'}: {selectedCommodity.minimumOrder} {selectedCommodity.unit}
                  </span>
                </div>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={`${t('min') || "Min"}: ${selectedCommodity.minimumOrder}`}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('totalValue') || 'Total Value'}:</Label>
                <div className="p-3 bg-muted rounded-md">
                  {parseFloat(quantity) > 0 ? (
                    <p className="text-lg font-medium">
                      {(parseFloat(quantity) * selectedCommodity.price).toLocaleString()} TZS
                    </p>
                  ) : (
                    <p className="text-muted-foreground">{t('enterQuantityFirst') || 'Enter quantity first'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('deliveryInfo') || 'Delivery Information'}:</Label>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">{t('grade') || 'Grade'}:</span> {selectedCommodity.grade}</p>
                  <p><span className="font-medium">{t('warehouse') || 'Warehouse'}:</span> {selectedCommodity.warehouse}</p>
                  <p><span className="font-medium">{t('origin') || 'Origin'}:</span> {selectedCommodity.origin}</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>{t('commodityNote') || 'Note: All trades are subject to warehouse delivery terms and conditions.'}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTradeDialog(false)}>
                {t('cancel') || 'Cancel'}
              </Button>
              <Button 
                onClick={handleTrade}
                disabled={!quantity || parseFloat(quantity) < selectedCommodity.minimumOrder}
              >
                {t('confirmTrade') || 'Confirm Trade'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Commodity Table Component
interface CommodityTableProps {
  commodities: Commodity[]
  onTrade: (commodity: Commodity, type: 'buy' | 'sell') => void
}

function CommodityTable({ commodities, onTrade }: CommodityTableProps) {
  const { t } = useLanguage()
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('commodity') || 'Commodity'}</TableHead>
            <TableHead>{t('symbol') || 'Symbol'}</TableHead>
            <TableHead>{t('price') || 'Price (TZS)'}</TableHead>
            <TableHead>{t('change') || 'Change'}</TableHead>
            <TableHead>{t('volume') || 'Volume'}</TableHead>
            <TableHead>{t('origin') || 'Origin'}</TableHead>
            <TableHead>{t('actions') || 'Actions'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commodities.length > 0 ? (
            commodities.map((commodity) => (
              <TableRow key={commodity.id}>
                <TableCell className="font-medium">{commodity.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{commodity.symbol}</Badge>
                </TableCell>
                <TableCell>
                  {commodity.price.toLocaleString()}/{commodity.unit}
                </TableCell>
                <TableCell className={commodity.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {commodity.change >= 0 ? '+' : ''}{commodity.change}%
                </TableCell>
                <TableCell>{commodity.volume.toLocaleString()} {commodity.unit}</TableCell>
                <TableCell>{commodity.origin}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onTrade(commodity, 'buy')}
                    >
                      {t('buy') || 'Buy'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTrade(commodity, 'sell')}
                    >
                      {t('sell') || 'Sell'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {t('noCommoditiesFound') || 'No commodities found'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
