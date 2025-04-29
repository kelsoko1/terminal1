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
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowUpDown,
  BarChart3,
  Calendar,
  Clock,
  Download,
  Edit,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2
} from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'

// Types and interfaces
interface FutureCurrencyPair {
  id: string;
  name: string;
  baseCurrency: string;
  quoteCurrency: string;
  contractSize: number;
  tickSize: number;
  status: 'active' | 'inactive';
  description: string;
  lastUpdated: string;
}

interface ExpiryContract {
  id: string;
  pairId: string;
  expiryDate: string;
  displayName: string;
  spotPrice: number;
  futurePremium: number;
  openInterest: number;
  volume: number;
  status: 'active' | 'expired' | 'pending' | 'suspended';
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  orders: number;
}

interface OrderBook {
  contractId: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdated: string;
}

interface MarketMaker {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  contracts: string[]; // List of contract IDs
  minimumSpread: number;
  maxPositionSize: number;
  lastActive: string;
}

interface Trade {
  id: string;
  contractId: string;
  price: number;
  quantity: number;
  type: 'buy' | 'sell';
  executionTime: string;
  buyerId: string;
  sellerId: string;
  status: 'completed' | 'cleared' | 'settled';
}

// Mock data
const mockCurrencyPairs: FutureCurrencyPair[] = [
  {
    id: 'pair1',
    name: 'TZS/USD',
    baseCurrency: 'TZS',
    quoteCurrency: 'USD',
    contractSize: 1000000,
    tickSize: 0.0001,
    status: 'active',
    description: 'Tanzanian Shilling / US Dollar Futures Contract',
    lastUpdated: '2025-04-12T08:30:00Z'
  },
  {
    id: 'pair2',
    name: 'TZS/EUR',
    baseCurrency: 'TZS',
    quoteCurrency: 'EUR',
    contractSize: 1000000,
    tickSize: 0.0001,
    status: 'active',
    description: 'Tanzanian Shilling / Euro Futures Contract',
    lastUpdated: '2025-04-12T08:30:00Z'
  },
  {
    id: 'pair3',
    name: 'TZS/GBP',
    baseCurrency: 'TZS',
    quoteCurrency: 'GBP',
    contractSize: 1000000,
    tickSize: 0.0001,
    status: 'active',
    description: 'Tanzanian Shilling / British Pound Futures Contract',
    lastUpdated: '2025-04-12T08:30:00Z'
  }
];

const mockExpiryContracts: ExpiryContract[] = [
  {
    id: 'contract1',
    pairId: 'pair1',
    expiryDate: '2025-12-15T16:00:00Z',
    displayName: 'DEC 2025',
    spotPrice: 2500,
    futurePremium: 25,
    openInterest: 1500000,
    volume: 500000,
    status: 'active'
  },
  {
    id: 'contract2',
    pairId: 'pair1',
    expiryDate: '2026-03-15T16:00:00Z',
    displayName: 'MAR 2026',
    spotPrice: 2510,
    futurePremium: 40,
    openInterest: 1200000,
    volume: 350000,
    status: 'active'
  },
  {
    id: 'contract3',
    pairId: 'pair1',
    expiryDate: '2026-06-15T16:00:00Z',
    displayName: 'JUN 2026',
    spotPrice: 2520,
    futurePremium: 55,
    openInterest: 800000,
    volume: 200000,
    status: 'active'
  },
  {
    id: 'contract4',
    pairId: 'pair2',
    expiryDate: '2025-12-15T16:00:00Z',
    displayName: 'DEC 2025',
    spotPrice: 2700,
    futurePremium: 30,
    openInterest: 1100000,
    volume: 400000,
    status: 'active'
  },
  {
    id: 'contract5',
    pairId: 'pair2',
    expiryDate: '2026-03-15T16:00:00Z',
    displayName: 'MAR 2026',
    spotPrice: 2710,
    futurePremium: 45,
    openInterest: 900000,
    volume: 250000,
    status: 'active'
  },
  {
    id: 'contract6',
    pairId: 'pair3',
    expiryDate: '2025-12-15T16:00:00Z',
    displayName: 'DEC 2025',
    spotPrice: 3100,
    futurePremium: 35,
    openInterest: 950000,
    volume: 300000,
    status: 'active'
  }
];

const mockOrderBooks: Record<string, OrderBook> = {
  'contract1': {
    contractId: 'contract1',
    bids: [
      { price: 2510, quantity: 50000, orders: 5 },
      { price: 2505, quantity: 75000, orders: 8 },
      { price: 2500, quantity: 100000, orders: 12 }
    ],
    asks: [
      { price: 2530, quantity: 40000, orders: 4 },
      { price: 2535, quantity: 65000, orders: 7 },
      { price: 2540, quantity: 90000, orders: 10 }
    ],
    lastUpdated: '2025-04-12T15:45:23Z'
  },
  'contract2': {
    contractId: 'contract2',
    bids: [
      { price: 2530, quantity: 40000, orders: 4 },
      { price: 2525, quantity: 60000, orders: 6 }
    ],
    asks: [
      { price: 2550, quantity: 35000, orders: 3 },
      { price: 2555, quantity: 55000, orders: 5 }
    ],
    lastUpdated: '2025-04-12T15:45:23Z'
  }
};

const mockMarketMakers: MarketMaker[] = [
  {
    id: 'mm1',
    name: 'Global FX Traders Ltd',
    status: 'active',
    contracts: ['contract1', 'contract2', 'contract3'],
    minimumSpread: 0.05,
    maxPositionSize: 5000000,
    lastActive: '2025-04-12T15:40:00Z'
  },
  {
    id: 'mm2',
    name: 'East African Currency Markets',
    status: 'active',
    contracts: ['contract1', 'contract4', 'contract6'],
    minimumSpread: 0.08,
    maxPositionSize: 3000000,
    lastActive: '2025-04-12T15:38:00Z'
  }
]; 

// Main component
export function FxFutureManagement() {
  // State for currency pairs
  const [currencyPairs, setCurrencyPairs] = useState<FutureCurrencyPair[]>(mockCurrencyPairs);
  const [selectedPair, setSelectedPair] = useState<FutureCurrencyPair | null>(null);
  
  // State for expiry contracts
  const [expiryContracts, setExpiryContracts] = useState<ExpiryContract[]>(mockExpiryContracts);
  const [selectedContract, setSelectedContract] = useState<ExpiryContract | null>(null);
  
  // State for order books
  const [orderBooks, setOrderBooks] = useState<Record<string, OrderBook>>(mockOrderBooks);
  
  // State for market makers
  const [marketMakers, setMarketMakers] = useState<MarketMaker[]>(mockMarketMakers);
  
  // UI state
  const [activeTab, setActiveTab] = useState('contracts');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPairDialog, setShowAddPairDialog] = useState(false);
  const [showAddContractDialog, setShowAddContractDialog] = useState(false);
  const [showAddMarketMakerDialog, setShowAddMarketMakerDialog] = useState(false);
  const [showEditPairDialog, setShowEditPairDialog] = useState(false);
  const [showEditContractDialog, setShowEditContractDialog] = useState(false);
  const [showEditMarketMakerDialog, setShowEditMarketMakerDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // Filter and sort functions
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortedData = <T extends Record<string, any>>(data: T[], key: string): T[] => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      if (a[key] < b[key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  
  // Filter functions
  const filteredPairs = currencyPairs.filter(pair => 
    pair.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pair.baseCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pair.quoteCurrency.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedPairs = getSortedData(filteredPairs, sortConfig?.key || 'name');
  
  const filteredContracts = expiryContracts.filter(contract => {
    if (selectedPair) {
      return contract.pairId === selectedPair.id && 
        (contract.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         new Date(contract.expiryDate).toLocaleDateString().includes(searchTerm));
    }
    return contract.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           new Date(contract.expiryDate).toLocaleDateString().includes(searchTerm);
  });
  
  const sortedContracts = getSortedData(filteredContracts, sortConfig?.key || 'expiryDate');
  
  const filteredMarketMakers = marketMakers.filter(mm => 
    mm.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedMarketMakers = getSortedData(filteredMarketMakers, sortConfig?.key || 'name');
  
  // Handler functions
  const handleAddPair = (newPair: Omit<FutureCurrencyPair, 'id' | 'lastUpdated'>) => {
    const now = new Date().toISOString();
    const id = `pair${currencyPairs.length + 1}`;
    
    setCurrencyPairs([
      ...currencyPairs,
      {
        ...newPair,
        id,
        lastUpdated: now
      }
    ]);
    
    setShowAddPairDialog(false);
  };
  
  const handleUpdatePair = (updatedPair: FutureCurrencyPair) => {
    setCurrencyPairs(currencyPairs.map(pair => 
      pair.id === updatedPair.id ? { ...updatedPair, lastUpdated: new Date().toISOString() } : pair
    ));
    setShowEditPairDialog(false);
    setSelectedPair(null);
  };
  
  const handleDeletePair = (id: string) => {
    if (confirm('Are you sure you want to delete this currency pair? This will also delete all associated contracts.')) {
      setCurrencyPairs(currencyPairs.filter(pair => pair.id !== id));
      setExpiryContracts(expiryContracts.filter(contract => contract.pairId !== id));
    }
  };
  
  const handleAddContract = (newContract: Omit<ExpiryContract, 'id'>) => {
    const id = `contract${expiryContracts.length + 1}`;
    
    setExpiryContracts([
      ...expiryContracts,
      {
        ...newContract,
        id
      }
    ]);
    
    setShowAddContractDialog(false);
  };
  
  const handleUpdateContract = (updatedContract: ExpiryContract) => {
    setExpiryContracts(expiryContracts.map(contract => 
      contract.id === updatedContract.id ? updatedContract : contract
    ));
    setShowEditContractDialog(false);
    setSelectedContract(null);
  };
  
  const handleDeleteContract = (id: string) => {
    if (confirm('Are you sure you want to delete this contract?')) {
      setExpiryContracts(expiryContracts.filter(contract => contract.id !== id));
      
      // Also remove from order books and market makers
      const newOrderBooks = { ...orderBooks };
      delete newOrderBooks[id];
      setOrderBooks(newOrderBooks);
      
      setMarketMakers(marketMakers.map(mm => ({
        ...mm,
        contracts: mm.contracts.filter(cId => cId !== id)
      })));
    }
  };
  
  const handleAddMarketMaker = (newMarketMaker: Omit<MarketMaker, 'id' | 'lastActive'>) => {
    const id = `mm${marketMakers.length + 1}`;
    
    setMarketMakers([
      ...marketMakers,
      {
        ...newMarketMaker,
        id,
        lastActive: new Date().toISOString()
      }
    ]);
    
    setShowAddMarketMakerDialog(false);
  };
  
  const handleUpdateMarketMaker = (updatedMarketMaker: MarketMaker) => {
    setMarketMakers(marketMakers.map(mm => 
      mm.id === updatedMarketMaker.id ? updatedMarketMaker : mm
    ));
    setShowEditMarketMakerDialog(false);
  };
  
  const handleDeleteMarketMaker = (id: string) => {
    if (confirm('Are you sure you want to delete this market maker?')) {
      setMarketMakers(marketMakers.filter(mm => mm.id !== id));
    }
  };
  
  const handleToggleStatus = (type: 'pair' | 'contract' | 'marketMaker', id: string) => {
    if (type === 'pair') {
      setCurrencyPairs(currencyPairs.map(pair => 
        pair.id === id ? { 
          ...pair, 
          status: pair.status === 'active' ? 'inactive' : 'active',
          lastUpdated: new Date().toISOString() 
        } : pair
      ));
    } else if (type === 'contract') {
      setExpiryContracts(expiryContracts.map(contract => 
        contract.id === id ? { 
          ...contract, 
          status: contract.status === 'active' ? 'suspended' : 'active'
        } : contract
      ));
    } else if (type === 'marketMaker') {
      setMarketMakers(marketMakers.map(mm => 
        mm.id === id ? { 
          ...mm, 
          status: mm.status === 'active' ? 'inactive' : 'active',
          lastActive: new Date().toISOString() 
        } : mm
      ));
    }
  };
  
  const calculateFuturePrice = (spotPrice: number, premium: number) => {
    return spotPrice + premium;
  };

  // JSX
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">FX Futures Management</h2>
            <p className="text-muted-foreground">
              Manage currency future contracts, expiry dates, and market makers
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
            {activeTab === 'pairs' && (
              <Button size="sm" className="gap-2" onClick={() => setShowAddPairDialog(true)}>
                <Plus className="h-4 w-4" />
                Add Currency Pair
              </Button>
            )}
            {activeTab === 'contracts' && (
              <Button size="sm" className="gap-2" onClick={() => setShowAddContractDialog(true)}>
                <Plus className="h-4 w-4" />
                Add Contract
              </Button>
            )}
            {activeTab === 'marketMakers' && (
              <Button size="sm" className="gap-2" onClick={() => setShowAddMarketMakerDialog(true)}>
                <Plus className="h-4 w-4" />
                Add Market Maker
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border rounded-lg p-1 mb-6">
            <TabsTrigger 
              value="contracts"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Futures Contracts
            </TabsTrigger>
            <TabsTrigger 
              value="pairs"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Currency Pairs
            </TabsTrigger>
            <TabsTrigger 
              value="marketMakers"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Market Makers
            </TabsTrigger>
            <TabsTrigger 
              value="matching"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Matching Engine
            </TabsTrigger>
            <TabsTrigger 
              value="clearing"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Clearing & Settlement
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Search and export bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab === 'pairs' ? 'currency pairs' : activeTab === 'contracts' ? 'contracts' : 'market makers'}...`}
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

          {/* Future Contracts Tab Content */}
          <TabsContent value="contracts">
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="pairFilter">Filter by Currency Pair:</Label>
                <Select 
                  value={selectedPair?.id || 'all'}
                  onValueChange={(value) => {
                    if (value === 'all') {
                      setSelectedPair(null);
                    } else {
                      const pair = currencyPairs.find(p => p.id === value);
                      setSelectedPair(pair || null);
                    }
                  }}
                >
                  <SelectTrigger id="pairFilter" className="w-[200px]">
                    <SelectValue placeholder="All pairs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All pairs</SelectItem>
                    {currencyPairs.map(pair => (
                      <SelectItem key={pair.id} value={pair.id}>
                        {pair.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge className="ml-auto" variant="outline">Cash Settled</Badge>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('displayName')}>
                      <div className="flex items-center">
                        Contract
                        {sortConfig?.key === 'displayName' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('expiryDate')}>
                      <div className="flex items-center">
                        Expiry Date
                        {sortConfig?.key === 'expiryDate' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('spotPrice')}>
                      <div className="flex items-center">
                        Spot Price
                        {sortConfig?.key === 'spotPrice' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('futurePremium')}>
                      <div className="flex items-center">
                        Premium
                        {sortConfig?.key === 'futurePremium' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Future Price</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('openInterest')}>
                      <div className="flex items-center">
                        Open Interest
                        {sortConfig?.key === 'openInterest' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('volume')}>
                      <div className="flex items-center">
                        Volume
                        {sortConfig?.key === 'volume' && (
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedContracts.length > 0 ? (
                    sortedContracts.map((contract) => {
                      const pair = currencyPairs.find(p => p.id === contract.pairId);
                      const futurePrice = calculateFuturePrice(contract.spotPrice, contract.futurePremium);
                      
                      return (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">
                            {pair?.name} {contract.displayName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(contract.expiryDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{contract.spotPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>+{contract.futurePremium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="font-medium">{futurePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>{contract.openInterest.toLocaleString()}</TableCell>
                          <TableCell>{contract.volume.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                contract.status === 'active' ? 'default' : 
                                contract.status === 'expired' ? 'destructive' : 
                                contract.status === 'pending' ? 'outline' : 'secondary'
                              }
                              className={contract.status !== 'expired' ? "cursor-pointer" : undefined}
                              onClick={() => contract.status !== 'expired' && handleToggleStatus('contract', contract.id)}
                            >
                              {contract.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setShowEditContractDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteContract(contract.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  // View order book
                                  setSelectedContract(contract);
                                  // Additional logic to show order book
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No contracts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Market Makers Tab Content */}
          <TabsContent value="marketMakers">
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
                    <TableHead>Assigned Contracts</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('minimumSpread')}>
                      <div className="flex items-center">
                        Min. Spread
                        {sortConfig?.key === 'minimumSpread' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('maxPositionSize')}>
                      <div className="flex items-center">
                        Max Position
                        {sortConfig?.key === 'maxPositionSize' && (
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
                    <TableHead className="cursor-pointer" onClick={() => requestSort('lastActive')}>
                      <div className="flex items-center">
                        Last Active
                        {sortConfig?.key === 'lastActive' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMarketMakers.length > 0 ? (
                    sortedMarketMakers.map((marketMaker) => (
                      <TableRow key={marketMaker.id}>
                        <TableCell className="font-medium">{marketMaker.name}</TableCell>
                        <TableCell>{marketMaker.contracts.length}</TableCell>
                        <TableCell>{marketMaker.minimumSpread}%</TableCell>
                        <TableCell>{marketMaker.maxPositionSize.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={marketMaker.status === 'active' ? 'default' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() => handleToggleStatus('marketMaker', marketMaker.id)}
                          >
                            {marketMaker.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(marketMaker.lastActive).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // Edit market maker
                                setShowEditMarketMakerDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMarketMaker(marketMaker.id)}
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
                        No market makers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          {/* Matching Engine Tab Content */}
          <TabsContent value="matching">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Matching Engine Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-muted-foreground text-sm">Engine Status</div>
                    <div className="font-medium flex items-center mt-1">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Running
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-muted-foreground text-sm">Active Orders</div>
                    <div className="font-medium text-xl mt-1">247</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-muted-foreground text-sm">Matching Rate</div>
                    <div className="font-medium text-xl mt-1">145/s</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-muted-foreground text-sm">Latency</div>
                    <div className="font-medium text-xl mt-1">12ms</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Engine Configuration</h3>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Matching Algorithm</Label>
                      <div className="font-medium">Price-Time Priority (FIFO)</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Auto-matching</Label>
                      <div className="font-medium">Enabled</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Trade Engine Mode</Label>
                      <div className="font-medium">Production</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Circuit Breakers</Label>
                      <div className="font-medium">Enabled (±5% movement)</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          {/* Clearing & Settlement Tab Content */}
          <TabsContent value="clearing">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Clearing House Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-muted-foreground text-sm">Total Open Positions</div>
                    <div className="font-medium text-xl mt-1">152</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-muted-foreground text-sm">Daily Settled Trades</div>
                    <div className="font-medium text-xl mt-1">245</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-muted-foreground text-sm">Total Margin Held</div>
                    <div className="font-medium text-xl mt-1">$5.24M</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-muted-foreground text-sm">Settlement Cycle</div>
                    <div className="font-medium text-xl mt-1">T+1</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Settlement Configuration</h3>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Margin Requirement</Label>
                      <div className="font-medium">Initial: 10%, Maintenance: 7.5%</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Settlement Method</Label>
                      <div className="font-medium flex items-center">
                        Cash Settlement 
                        <Badge className="ml-2" variant="outline">All futures are cash settled</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Mark-to-Market</Label>
                      <div className="font-medium">Daily at 16:00 EAT</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Default Fund</Label>
                      <div className="font-medium">$1.5M</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          {/* Reports Tab Content */}
          <TabsContent value="reports">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Available Reports</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto py-4 px-4 justify-start">
                      <div className="flex items-start">
                        <BarChart3 className="h-5 w-5 mr-3 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">Daily Trading Volume</div>
                          <div className="text-sm text-muted-foreground">Summary of trading volume by contract</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="h-auto py-4 px-4 justify-start">
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 mr-3 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">Settlement Report</div>
                          <div className="text-sm text-muted-foreground">Daily mark-to-market and settlement</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="h-auto py-4 px-4 justify-start">
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 mr-3 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">Open Interest Analysis</div>
                          <div className="text-sm text-muted-foreground">Breakdown of open interest by participant</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="h-auto py-4 px-4 justify-start">
                      <div className="flex items-start">
                        <RefreshCw className="h-5 w-5 mr-3 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">Market Maker Performance</div>
                          <div className="text-sm text-muted-foreground">Evaluation of market maker activity</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Scheduled Reports</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Daily Trading Summary</TableCell>
                      <TableCell>Daily (16:30 EAT)</TableCell>
                      <TableCell>2025-04-13 16:30</TableCell>
                      <TableCell>5 recipients</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Weekly Market Analysis</TableCell>
                      <TableCell>Weekly (Friday)</TableCell>
                      <TableCell>2025-04-18 17:00</TableCell>
                      <TableCell>3 recipients</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab Content */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="default-tick-size">Default Tick Size</Label>
                      <Input id="default-tick-size" type="number" defaultValue="0.0001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default-contract-size">Default Contract Size</Label>
                      <Input id="default-contract-size" type="number" defaultValue="1000000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trading-hours-start">Trading Hours (Start)</Label>
                      <Input id="trading-hours-start" type="time" defaultValue="08:00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trading-hours-end">Trading Hours (End)</Label>
                      <Input id="trading-hours-end" type="time" defaultValue="16:00" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="default-expiry-dates">Default Contract Expiry Dates</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className="py-1">
                        March (3rd Friday)
                        <Button variant="ghost" size="sm" className="h-4 w-4 ml-1 p-0">✕</Button>
                      </Badge>
                      <Badge className="py-1">
                        June (3rd Friday)
                        <Button variant="ghost" size="sm" className="h-4 w-4 ml-1 p-0">✕</Button>
                      </Badge>
                      <Badge className="py-1">
                        September (3rd Friday)
                        <Button variant="ghost" size="sm" className="h-4 w-4 ml-1 p-0">✕</Button>
                      </Badge>
                      <Badge className="py-1">
                        December (3rd Friday)
                        <Button variant="ghost" size="sm" className="h-4 w-4 ml-1 p-0">✕</Button>
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add Expiry
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button>Save Settings</Button>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Price Limits & Circuit Breakers</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="daily-price-limit">Daily Price Limit (%)</Label>
                      <Input id="daily-price-limit" type="number" defaultValue="5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="circuit-breaker">Circuit Breaker Level (%)</Label>
                      <Input id="circuit-breaker" type="number" defaultValue="10" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="enable-circuit-breakers" checked={true} />
                    <Label htmlFor="enable-circuit-breakers">Enable circuit breakers</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="enable-price-limits" checked={true} />
                    <Label htmlFor="enable-price-limits">Enable daily price limits</Label>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button>Save Limits</Button>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Margin Requirements</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="initial-margin">Initial Margin (%)</Label>
                      <Input id="initial-margin" type="number" defaultValue="10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maintenance-margin">Maintenance Margin (%)</Label>
                      <Input id="maintenance-margin" type="number" defaultValue="7.5" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="margin-calculation">Margin Calculation Method</Label>
                    <Select defaultValue="span">
                      <SelectTrigger id="margin-calculation">
                        <SelectValue placeholder="Select calculation method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="span">SPAN (Portfolio-based)</SelectItem>
                        <SelectItem value="fixed">Fixed Percentage</SelectItem>
                        <SelectItem value="var">Value-at-Risk (VaR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button>Save Margin Settings</Button>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Market Maker Requirements</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-spread">Maximum Allowed Spread (%)</Label>
                      <Input id="max-spread" type="number" step="0.01" defaultValue="0.25" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min-quote-size">Minimum Quote Size</Label>
                      <Input id="min-quote-size" type="number" defaultValue="100000" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="market-maker-notes">Additional Requirements</Label>
                    <Textarea id="market-maker-notes" placeholder="Enter any additional requirements for market makers..." />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button>Save Requirements</Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
} 