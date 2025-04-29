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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  ArrowDownUp,
  BarChart3,
  Clock,
  Download,
  FileText,
  RefreshCw,
  Settings,
  AlertTriangle
} from 'lucide-react'

// Types and interfaces
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

interface Trade {
  id: string;
  contractId: string;
  contractName: string;
  price: number;
  quantity: number;
  type: 'buy' | 'sell';
  executionTime: string;
  buyerId: string;
  sellerId: string;
  status: 'completed' | 'cleared' | 'settled';
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

// Mock data
const mockOrderBooks: Record<string, OrderBook> = {
  'f1': {
    contractId: 'f1',
    bids: [
      { price: 2930, quantity: 15000, orders: 4 },
      { price: 2925, quantity: 25000, orders: 7 },
      { price: 2920, quantity: 35000, orders: 9 }
    ],
    asks: [
      { price: 2960, quantity: 12000, orders: 3 },
      { price: 2965, quantity: 22000, orders: 6 },
      { price: 2970, quantity: 30000, orders: 8 }
    ],
    lastUpdated: '2025-04-26T15:45:23Z'
  },
  'f2': {
    contractId: 'f2',
    bids: [
      { price: 7630, quantity: 8000, orders: 3 },
      { price: 7625, quantity: 12000, orders: 5 }
    ],
    asks: [
      { price: 7660, quantity: 7000, orders: 2 },
      { price: 7665, quantity: 11000, orders: 4 }
    ],
    lastUpdated: '2025-04-26T15:45:23Z'
  },
  'f3': {
    contractId: 'f3',
    bids: [
      { price: 2874000, quantity: 5, orders: 2 },
      { price: 2873500, quantity: 8, orders: 3 }
    ],
    asks: [
      { price: 2875500, quantity: 4, orders: 1 },
      { price: 2876000, quantity: 7, orders: 3 }
    ],
    lastUpdated: '2025-04-26T15:45:23Z'
  }
};

const mockTrades: Trade[] = [
  {
    id: 't1',
    contractId: 'f1',
    contractName: 'Cashew Nuts Futures DEC25',
    price: 2950,
    quantity: 5000,
    type: 'buy',
    executionTime: '2025-04-26T15:30:00Z',
    buyerId: 'user123',
    sellerId: 'mm1',
    status: 'completed'
  },
  {
    id: 't2',
    contractId: 'f2',
    contractName: 'Coffee Arabica Futures SEP25',
    price: 7650,
    quantity: 3000,
    type: 'sell',
    executionTime: '2025-04-26T15:25:00Z',
    buyerId: 'mm2',
    sellerId: 'user456',
    status: 'cleared'
  },
  {
    id: 't3',
    contractId: 'f3',
    contractName: 'Gold Futures JUN25',
    price: 2875000,
    quantity: 2,
    type: 'buy',
    executionTime: '2025-04-26T15:20:00Z',
    buyerId: 'user789',
    sellerId: 'user321',
    status: 'settled'
  }
];

const mockMarketMakers: MarketMaker[] = [
  {
    id: 'mm1',
    name: 'Tanzania Commodity Trading Ltd',
    status: 'active',
    contracts: ['f1', 'f2', 'f3'],
    minimumSpread: 0.8,
    maxPositionSize: 100000,
    lastActive: '2025-04-26T15:40:00Z'
  },
  {
    id: 'mm2',
    name: 'East Africa Commodity Markets',
    status: 'active',
    contracts: ['f1', 'f4', 'f5'],
    minimumSpread: 1.0,
    maxPositionSize: 75000,
    lastActive: '2025-04-26T15:38:00Z'
  }
];

export function CommodityMatchingEngine() {
  // State for order books, trades, and market makers
  const [orderBooks, setOrderBooks] = useState<Record<string, OrderBook>>(mockOrderBooks);
  const [trades, setTrades] = useState<Trade[]>(mockTrades);
  const [marketMakers, setMarketMakers] = useState<MarketMaker[]>(mockMarketMakers);
  
  // UI state
  const [activeTab, setActiveTab] = useState('orderBook');
  const [selectedContractId, setSelectedContractId] = useState<string>('f1');
  const [engineStatus, setEngineStatus] = useState<'running' | 'paused' | 'maintenance'>('running');
  const [matchingRate, setMatchingRate] = useState<number>(85);
  const [latency, setLatency] = useState<number>(18);
  const [activeOrders, setActiveOrders] = useState<number>(156);
  
  // Get the selected order book
  const selectedOrderBook = orderBooks[selectedContractId] || null;
  
  // Filter trades for the selected contract
  const filteredTrades = trades.filter(trade => 
    !selectedContractId || trade.contractId === selectedContractId
  );
  
  // Simulate refreshing the order book data
  const refreshOrderBook = () => {
    // In a real app, this would fetch updated data from an API
    // Here we'll just simulate some changes
    if (selectedOrderBook) {
      const updatedBids = selectedOrderBook.bids.map(bid => ({
        ...bid,
        quantity: Math.max(1000, Math.floor(bid.quantity * (0.95 + Math.random() * 0.1)))
      }));
      
      const updatedAsks = selectedOrderBook.asks.map(ask => ({
        ...ask,
        quantity: Math.max(1000, Math.floor(ask.quantity * (0.95 + Math.random() * 0.1)))
      }));
      
      setOrderBooks({
        ...orderBooks,
        [selectedContractId]: {
          ...selectedOrderBook,
          bids: updatedBids,
          asks: updatedAsks,
          lastUpdated: new Date().toISOString()
        }
      });
      
      // Also update engine stats
      setMatchingRate(Math.floor(70 + Math.random() * 40));
      setLatency(Math.floor(15 + Math.random() * 10));
      setActiveOrders(Math.floor(140 + Math.random() * 50));
    }
  };
  
  // Toggle engine status
  const toggleEngineStatus = () => {
    if (engineStatus === 'running') {
      setEngineStatus('paused');
    } else if (engineStatus === 'paused') {
      setEngineStatus('running');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Engine Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Matching Engine Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-muted-foreground text-sm">Engine Status</div>
              <div className="font-medium flex items-center mt-1">
                <Badge 
                  variant="outline" 
                  className={
                    engineStatus === 'running' ? "bg-green-100 text-green-800" :
                    engineStatus === 'paused' ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }
                >
                  {engineStatus.charAt(0).toUpperCase() + engineStatus.slice(1)}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2"
                  onClick={toggleEngineStatus}
                >
                  {engineStatus === 'running' ? 'Pause' : 'Start'}
                </Button>
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-muted-foreground text-sm">Active Orders</div>
              <div className="font-medium text-xl mt-1">{activeOrders}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-muted-foreground text-sm">Matching Rate</div>
              <div className="font-medium text-xl mt-1">{matchingRate}/s</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-muted-foreground text-sm">Latency</div>
              <div className="font-medium text-xl mt-1">{latency}ms</div>
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
                <div className="font-medium">Enabled (±7% movement)</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Order Book and Trade History */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-medium">Order Book</h3>
            <Select 
              value={selectedContractId} 
              onValueChange={setSelectedContractId}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a contract" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="f1">Cashew Nuts Futures DEC25</SelectItem>
                <SelectItem value="f2">Coffee Arabica Futures SEP25</SelectItem>
                <SelectItem value="f3">Gold Futures JUN25</SelectItem>
                <SelectItem value="f4">Sesame Seeds Futures OCT25</SelectItem>
                <SelectItem value="f5">Coffee Robusta Futures MAR26</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshOrderBook}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {selectedOrderBook ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sell Orders (Asks) */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Sell Orders (Asks)</h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrderBook.asks.map((ask, index) => (
                      <TableRow key={`ask-${index}`} className="bg-red-50">
                        <TableCell className="font-medium text-red-600">{ask.price.toLocaleString()}</TableCell>
                        <TableCell>{ask.quantity.toLocaleString()}</TableCell>
                        <TableCell>{ask.orders}</TableCell>
                        <TableCell>{(ask.price * ask.quantity).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Buy Orders (Bids) */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Buy Orders (Bids)</h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrderBook.bids.map((bid, index) => (
                      <TableRow key={`bid-${index}`} className="bg-green-50">
                        <TableCell className="font-medium text-green-600">{bid.price.toLocaleString()}</TableCell>
                        <TableCell>{bid.quantity.toLocaleString()}</TableCell>
                        <TableCell>{bid.orders}</TableCell>
                        <TableCell>{(bid.price * bid.quantity).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 border rounded-md">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>No order book data available for the selected contract</p>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Trades</h4>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.length > 0 ? (
                  filteredTrades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">{trade.contractName}</TableCell>
                      <TableCell>{trade.price.toLocaleString()}</TableCell>
                      <TableCell>{trade.quantity.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                          {trade.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(trade.executionTime).toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            trade.status === 'completed' ? 'outline' : 
                            trade.status === 'cleared' ? 'default' : 
                            'secondary'
                          }
                        >
                          {trade.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No trades found for the selected contract
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
      
      {/* Market Makers */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Market Makers</h3>
          <Button size="sm">
            Add Market Maker
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Assigned Contracts</TableHead>
                <TableHead>Min. Spread</TableHead>
                <TableHead>Max Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketMakers.map((mm) => (
                <TableRow key={mm.id}>
                  <TableCell className="font-medium">{mm.name}</TableCell>
                  <TableCell>{mm.contracts.length} contracts</TableCell>
                  <TableCell>{mm.minimumSpread}%</TableCell>
                  <TableCell>{mm.maxPositionSize.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={mm.status === 'active' ? 'default' : 'secondary'}
                      className="cursor-pointer"
                    >
                      {mm.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(mm.lastActive).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
