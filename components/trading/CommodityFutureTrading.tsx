'use client'

import { useState, useEffect } from 'react'
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
import { ArrowUpRight, Info, RefreshCw, Clock, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// Types and interfaces
type CommodityCategory = 'agricultural' | 'metals' | 'energy' | 'specialty'

interface FutureCommodity {
  id: string;
  name: string;
  symbol: string;
  category: CommodityCategory;
  unit: string;
  origin: string;
  grade: string;
  minAmount: number;
  expiryDates: ExpiryDate[];
}

interface ExpiryDate {
  id: string;
  date: string; // Format: YYYY-MM-DD
  displayName: string; // e.g. "DEC 2023"
  spotPrice: number;
  futurePremium: number;
  openInterest: number;
  volume: number;
}

interface Order {
  id: string;
  commodityId: string;
  expiryId: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled';
  timestamp: string;
  filledQuantity: number;
}

interface Trade {
  id: string;
  commodityId: string;
  expiryId: string;
  price: number;
  quantity: number;
  buyerOrderId: string;
  sellerOrderId: string;
  timestamp: string;
}

interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  orders: number;
}

interface MatchingEngineState {
  orderBooks: Record<string, OrderBook>; // key is commodityId + expiryId
  orders: Order[];
  trades: Trade[];
}

// Mock data for commodities
const mockCommodities: FutureCommodity[] = [
  {
    id: 'com1',
    name: 'Cashew Nuts',
    symbol: 'CASH',
    category: 'agricultural',
    unit: 'kg',
    origin: 'Mtwara, Tanzania',
    grade: 'W320',
    minAmount: 100,
    expiryDates: [
      {
        id: 'exp1',
        date: '2023-12-31',
        displayName: 'DEC 2023',
        spotPrice: 2850,
        futurePremium: 120,
        openInterest: 250000,
        volume: 85000
      },
      {
        id: 'exp2',
        date: '2024-03-31',
        displayName: 'MAR 2024',
        spotPrice: 2850,
        futurePremium: 180,
        openInterest: 150000,
        volume: 45000
      },
      {
        id: 'exp3',
        date: '2024-06-30',
        displayName: 'JUN 2024',
        spotPrice: 2850,
        futurePremium: 230,
        openInterest: 80000,
        volume: 25000
      }
    ]
  },
  {
    id: 'com2',
    name: 'Coffee (Arabica)',
    symbol: 'COFA',
    category: 'agricultural',
    unit: 'kg',
    origin: 'Kilimanjaro, Tanzania',
    grade: 'AA',
    minAmount: 50,
    expiryDates: [
      {
        id: 'exp4',
        date: '2023-12-31',
        displayName: 'DEC 2023',
        spotPrice: 7500,
        futurePremium: 350,
        openInterest: 85000,
        volume: 35000
      },
      {
        id: 'exp5',
        date: '2024-03-31',
        displayName: 'MAR 2024',
        spotPrice: 7500,
        futurePremium: 450,
        openInterest: 65000,
        volume: 22000
      }
    ]
  },
  {
    id: 'com3',
    name: 'Cotton',
    symbol: 'COTN',
    category: 'agricultural',
    unit: 'kg',
    origin: 'Shinyanga, Tanzania',
    grade: 'Long Staple',
    minAmount: 100,
    expiryDates: [
      {
        id: 'exp6',
        date: '2023-12-31',
        displayName: 'DEC 2023',
        spotPrice: 2200,
        futurePremium: 110,
        openInterest: 150000,
        volume: 40000
      },
      {
        id: 'exp7',
        date: '2024-03-31',
        displayName: 'MAR 2024',
        spotPrice: 2200,
        futurePremium: 160,
        openInterest: 95000,
        volume: 25000
      }
    ]
  },
  {
    id: 'com4',
    name: 'Gold',
    symbol: 'GOLD',
    category: 'metals',
    unit: 'oz',
    origin: 'Geita, Tanzania',
    grade: '24K',
    minAmount: 1,
    expiryDates: [
      {
        id: 'exp8',
        date: '2023-12-31',
        displayName: 'DEC 2023',
        spotPrice: 2850000,
        futurePremium: 45000,
        openInterest: 250,
        volume: 75
      },
      {
        id: 'exp9',
        date: '2024-03-31',
        displayName: 'MAR 2024',
        spotPrice: 2850000,
        futurePremium: 65000,
        openInterest: 180,
        volume: 45
      }
    ]
  },
  {
    id: 'com5',
    name: 'Natural Gas',
    symbol: 'NGAS',
    category: 'energy',
    unit: 'MMBtu',
    origin: 'Mtwara, Tanzania',
    grade: 'Standard',
    minAmount: 10,
    expiryDates: [
      {
        id: 'exp10',
        date: '2023-12-31',
        displayName: 'DEC 2023',
        spotPrice: 12500,
        futurePremium: 750,
        openInterest: 1500,
        volume: 450
      },
      {
        id: 'exp11',
        date: '2024-03-31',
        displayName: 'MAR 2024',
        spotPrice: 12500,
        futurePremium: 950,
        openInterest: 1200,
        volume: 380
      }
    ]
  }
]; 

// Matching engine implementation
class MatchingEngine {
  private state: MatchingEngineState = {
    orderBooks: {},
    orders: [],
    trades: []
  };
  
  constructor() {
    // Initialize empty order books for each commodity and expiry date
    mockCommodities.forEach(commodity => {
      commodity.expiryDates.forEach(expiry => {
        const key = `${commodity.id}-${expiry.id}`;
        this.state.orderBooks[key] = {
          bids: [],
          asks: []
        };
      });
    });
    
    // Add some initial orders for demonstration
    this.addInitialOrders();
  }
  
  private addInitialOrders() {
    // Add some mock orders to the order books
    const orders: Partial<Order>[] = [
      // Cashew Nuts December 2023
      { commodityId: 'com1', expiryId: 'exp1', side: 'buy', price: 2950, quantity: 5000 },
      { commodityId: 'com1', expiryId: 'exp1', side: 'buy', price: 2940, quantity: 7500 },
      { commodityId: 'com1', expiryId: 'exp1', side: 'buy', price: 2930, quantity: 10000 },
      { commodityId: 'com1', expiryId: 'exp1', side: 'sell', price: 2980, quantity: 6000 },
      { commodityId: 'com1', expiryId: 'exp1', side: 'sell', price: 2990, quantity: 8000 },
      { commodityId: 'com1', expiryId: 'exp1', side: 'sell', price: 3000, quantity: 12000 },
      
      // Coffee (Arabica) December 2023
      { commodityId: 'com2', expiryId: 'exp4', side: 'buy', price: 7800, quantity: 3000 },
      { commodityId: 'com2', expiryId: 'exp4', side: 'buy', price: 7750, quantity: 4500 },
      { commodityId: 'com2', expiryId: 'exp4', side: 'sell', price: 7900, quantity: 2500 },
      { commodityId: 'com2', expiryId: 'exp4', side: 'sell', price: 7950, quantity: 3500 },
    ];
    
    orders.forEach(order => {
      this.placeOrder({
        ...order,
        id: `init-${Math.random().toString(36).substring(2, 9)}`,
        status: 'pending',
        timestamp: new Date().toISOString(),
        filledQuantity: 0
      } as Order);
    });
  }
  
  public getOrderBook(commodityId: string, expiryId: string): OrderBook {
    const key = `${commodityId}-${expiryId}`;
    return this.state.orderBooks[key] || { bids: [], asks: [] };
  }
  
  public getUserOrders(): Order[] {
    // In a real app, this would filter by user ID
    return this.state.orders.filter(order => 
      !order.id.startsWith('init-') && 
      order.status !== 'cancelled'
    );
  }
  
  public getTrades(commodityId?: string, expiryId?: string): Trade[] {
    let trades = this.state.trades;
    
    if (commodityId) {
      trades = trades.filter(trade => trade.commodityId === commodityId);
    }
    
    if (expiryId) {
      trades = trades.filter(trade => trade.expiryId === expiryId);
    }
    
    return trades;
  }
  
  public placeOrder(order: Order): { order: Order, matches: Trade[] } {
    // Add order to our list
    this.state.orders.push(order);
    
    // Add to order book and check for matches
    const key = `${order.commodityId}-${order.expiryId}`;
    const orderBook = this.state.orderBooks[key];
    
    const matches: Trade[] = [];
    
    if (order.side === 'buy') {
      // Try to match with existing sell orders
      // Sort asks by price (ascending)
      const sortedAsks = [...orderBook.asks].sort((a, b) => a.price - b.price);
      
      let remainingQuantity = order.quantity;
      
      for (const ask of sortedAsks) {
        // If we can match (buy price >= sell price)
        if (order.price >= ask.price && remainingQuantity > 0) {
          // Find the sell orders at this price
          const sellOrders = this.state.orders.filter(o => 
            o.commodityId === order.commodityId &&
            o.expiryId === order.expiryId &&
            o.side === 'sell' &&
            o.price === ask.price &&
            o.status !== 'filled' &&
            o.status !== 'cancelled'
          );
          
          for (const sellOrder of sellOrders) {
            const availableSellQuantity = sellOrder.quantity - sellOrder.filledQuantity;
            if (availableSellQuantity <= 0) continue;
            
            // Calculate match quantity
            const matchQuantity = Math.min(remainingQuantity, availableSellQuantity);
            
            // Create a trade
            const trade: Trade = {
              id: `trade-${Math.random().toString(36).substring(2, 9)}`,
              commodityId: order.commodityId,
              expiryId: order.expiryId,
              price: ask.price, // Use the ask price as the trade price
              quantity: matchQuantity,
              buyerOrderId: order.id,
              sellerOrderId: sellOrder.id,
              timestamp: new Date().toISOString()
            };
            
            matches.push(trade);
            this.state.trades.push(trade);
            
            // Update order quantities
            remainingQuantity -= matchQuantity;
            
            // Update buy order
            order.filledQuantity += matchQuantity;
            if (order.filledQuantity === order.quantity) {
              order.status = 'filled';
            } else {
              order.status = 'partially_filled';
            }
            
            // Update sell order
            sellOrder.filledQuantity += matchQuantity;
            if (sellOrder.filledQuantity === sellOrder.quantity) {
              sellOrder.status = 'filled';
            } else {
              sellOrder.status = 'partially_filled';
            }
            
            if (remainingQuantity === 0) break;
          }
          
          if (remainingQuantity === 0) break;
        } else {
          // We've reached sell orders with prices higher than our buy price
          break;
        }
      }
      
      // If we still have remaining quantity, add to the order book
      if (remainingQuantity > 0 && order.status !== 'filled') {
        const existingBidIndex = orderBook.bids.findIndex(bid => bid.price === order.price);
        
        if (existingBidIndex >= 0) {
          // Update existing bid
          orderBook.bids[existingBidIndex].quantity += remainingQuantity;
          orderBook.bids[existingBidIndex].orders += 1;
        } else {
          // Add new bid
          orderBook.bids.push({
            price: order.price,
            quantity: remainingQuantity,
            orders: 1
          });
          
          // Sort bids by price (descending)
          orderBook.bids.sort((a, b) => b.price - a.price);
        }
      }
    } else {
      // Side is 'sell' - try to match with existing buy orders
      // Sort bids by price (descending)
      const sortedBids = [...orderBook.bids].sort((a, b) => b.price - a.price);
      
      let remainingQuantity = order.quantity;
      
      for (const bid of sortedBids) {
        // If we can match (sell price <= buy price)
        if (order.price <= bid.price && remainingQuantity > 0) {
          // Find the buy orders at this price
          const buyOrders = this.state.orders.filter(o => 
            o.commodityId === order.commodityId &&
            o.expiryId === order.expiryId &&
            o.side === 'buy' &&
            o.price === bid.price &&
            o.status !== 'filled' &&
            o.status !== 'cancelled'
          );
          
          for (const buyOrder of buyOrders) {
            const availableBuyQuantity = buyOrder.quantity - buyOrder.filledQuantity;
            if (availableBuyQuantity <= 0) continue;
            
            // Calculate match quantity
            const matchQuantity = Math.min(remainingQuantity, availableBuyQuantity);
            
            // Create a trade
            const trade: Trade = {
              id: `trade-${Math.random().toString(36).substring(2, 9)}`,
              commodityId: order.commodityId,
              expiryId: order.expiryId,
              price: bid.price, // Use the bid price as the trade price
              quantity: matchQuantity,
              buyerOrderId: buyOrder.id,
              sellerOrderId: order.id,
              timestamp: new Date().toISOString()
            };
            
            matches.push(trade);
            this.state.trades.push(trade);
            
            // Update order quantities
            remainingQuantity -= matchQuantity;
            
            // Update sell order
            order.filledQuantity += matchQuantity;
            if (order.filledQuantity === order.quantity) {
              order.status = 'filled';
            } else {
              order.status = 'partially_filled';
            }
            
            // Update buy order
            buyOrder.filledQuantity += matchQuantity;
            if (buyOrder.filledQuantity === buyOrder.quantity) {
              buyOrder.status = 'filled';
            } else {
              buyOrder.status = 'partially_filled';
            }
            
            if (remainingQuantity === 0) break;
          }
          
          if (remainingQuantity === 0) break;
        } else {
          // We've reached buy orders with prices lower than our sell price
          break;
        }
      }
      
      // If we still have remaining quantity, add to the order book
      if (remainingQuantity > 0 && order.status !== 'filled') {
        const existingAskIndex = orderBook.asks.findIndex(ask => ask.price === order.price);
        
        if (existingAskIndex >= 0) {
          // Update existing ask
          orderBook.asks[existingAskIndex].quantity += remainingQuantity;
          orderBook.asks[existingAskIndex].orders += 1;
        } else {
          // Add new ask
          orderBook.asks.push({
            price: order.price,
            quantity: remainingQuantity,
            orders: 1
          });
          
          // Sort asks by price (ascending)
          orderBook.asks.sort((a, b) => a.price - b.price);
        }
      }
    }
    
    // Update order books after matching
    this.updateOrderBooks();
    
    return { order, matches };
  }
  
  public cancelOrder(orderId: string): boolean {
    const order = this.state.orders.find(o => o.id === orderId);
    
    if (!order || order.status === 'filled' || order.status === 'cancelled') {
      return false;
    }
    
    order.status = 'cancelled';
    this.updateOrderBooks();
    
    return true;
  }
  
  private updateOrderBooks() {
    // Reset order books
    mockCommodities.forEach(commodity => {
      commodity.expiryDates.forEach(expiry => {
        const key = `${commodity.id}-${expiry.id}`;
        this.state.orderBooks[key] = {
          bids: [],
          asks: []
        };
      });
    });
    
    // Recalculate order books based on active orders
    this.state.orders.forEach(order => {
      if (order.status === 'filled' || order.status === 'cancelled') {
        return;
      }
      
      const key = `${order.commodityId}-${order.expiryId}`;
      const orderBook = this.state.orderBooks[key];
      
      const remainingQuantity = order.quantity - order.filledQuantity;
      
      if (order.side === 'buy') {
        const existingBidIndex = orderBook.bids.findIndex(bid => bid.price === order.price);
        
        if (existingBidIndex >= 0) {
          orderBook.bids[existingBidIndex].quantity += remainingQuantity;
          orderBook.bids[existingBidIndex].orders += 1;
        } else {
          orderBook.bids.push({
            price: order.price,
            quantity: remainingQuantity,
            orders: 1
          });
          
          // Sort bids by price (descending)
          orderBook.bids.sort((a, b) => b.price - a.price);
        }
      } else {
        const existingAskIndex = orderBook.asks.findIndex(ask => ask.price === order.price);
        
        if (existingAskIndex >= 0) {
          orderBook.asks[existingAskIndex].quantity += remainingQuantity;
          orderBook.asks[existingAskIndex].orders += 1;
        } else {
          orderBook.asks.push({
            price: order.price,
            quantity: remainingQuantity,
            orders: 1
          });
          
          // Sort asks by price (ascending)
          orderBook.asks.sort((a, b) => a.price - b.price);
        }
      }
    });
  }
} 

// Main component
export function CommodityFutureTrading() {
  const [selectedCommodity, setSelectedCommodity] = useState<FutureCommodity | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<ExpiryDate | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommodityCategory | 'all'>('all');
  const { t } = useLanguage();
  
  // Initialize matching engine
  const [matchingEngine] = useState<MatchingEngine>(new MatchingEngine());
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  
  // Update the order book when user selects a commodity and expiry
  useEffect(() => {
    if (selectedCommodity && selectedExpiry) {
      const newOrderBook = matchingEngine.getOrderBook(selectedCommodity.id, selectedExpiry.id);
      setOrderBook(newOrderBook);
      
      // Also update recent trades
      setRecentTrades(matchingEngine.getTrades(selectedCommodity.id, selectedExpiry.id));
    }
  }, [selectedCommodity, selectedExpiry, matchingEngine]);
  
  // Update user orders when needed
  useEffect(() => {
    setUserOrders(matchingEngine.getUserOrders());
  }, [matchingEngine, recentTrades]);
  
  const handleSelectCommodity = (commodity: FutureCommodity) => {
    setSelectedCommodity(commodity);
    // Default to first expiry date
    if (commodity.expiryDates.length > 0) {
      setSelectedExpiry(commodity.expiryDates[0]);
    } else {
      setSelectedExpiry(null);
    }
  };
  
  const handleSelectExpiry = (expiry: ExpiryDate) => {
    setSelectedExpiry(expiry);
  };
  
  const calculateFuturePrice = (spotPrice: number, premium: number) => {
    return spotPrice + premium;
  };
  
  const handlePlaceOrder = () => {
    if (!selectedCommodity || !selectedExpiry) {
      return;
    }
    
    const price = orderType === 'market' 
      ? (orderSide === 'buy' ? orderBook.asks[0]?.price || 0 : orderBook.bids[0]?.price || 0)
      : parseFloat(orderPrice);
      
    const order: Order = {
      id: `order-${Math.random().toString(36).substring(2, 9)}`,
      commodityId: selectedCommodity.id,
      expiryId: selectedExpiry.id,
      side: orderSide,
      price,
      quantity: parseFloat(orderAmount),
      status: 'pending',
      timestamp: new Date().toISOString(),
      filledQuantity: 0
    };
    
    const { matches } = matchingEngine.placeOrder(order);
    
    // Update state after placing order
    setOrderBook(matchingEngine.getOrderBook(selectedCommodity.id, selectedExpiry.id));
    setUserOrders(matchingEngine.getUserOrders());
    setRecentTrades(matchingEngine.getTrades(selectedCommodity.id, selectedExpiry.id));
    
    // Reset form
    setOrderPrice('');
    setOrderAmount('');
    setShowOrderDialog(false);
    
    console.log('Order placed:', order);
    if (matches.length > 0) {
      console.log('Matches:', matches);
    }
  };
  
  const handleCancelOrder = (orderId: string) => {
    const cancelled = matchingEngine.cancelOrder(orderId);
    if (cancelled) {
      // Update state after cancellation
      setOrderBook(matchingEngine.getOrderBook(
        selectedCommodity?.id || '', 
        selectedExpiry?.id || ''
      ));
      setUserOrders(matchingEngine.getUserOrders());
    }
  };
  
  // Filter commodities based on category and search term
  const filteredCommodities = mockCommodities.filter(commodity => {
    const matchesCategory = selectedCategory === 'all' || commodity.category === selectedCategory;
    const matchesSearch = 
      commodity.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      commodity.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
      commodity.origin.toLowerCase().includes(searchFilter.toLowerCase())
    
    return matchesCategory && matchesSearch;
  });
  
  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  return (
    <div className="commodity-future-trading">
      <div className="grid grid-cols-12 gap-4">
        {/* Left sidebar - Commodity selection */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder={t('Search commodities...')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
          
          <div className="mb-4 flex space-x-2">
            <button 
              className={`px-3 py-1 text-sm rounded-md ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedCategory('all')}
            >
              {t('All')}
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${selectedCategory === 'agricultural' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedCategory('agricultural')}
            >
              {t('Agricultural')}
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${selectedCategory === 'metals' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedCategory('metals')}
            >
              {t('Metals')}
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${selectedCategory === 'energy' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedCategory('energy')}
            >
              {t('Energy')}
            </button>
          </div>
          
          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {filteredCommodities.map((commodity) => (
              <div 
                key={commodity.id}
                className={`p-3 rounded-md cursor-pointer ${selectedCommodity?.id === commodity.id ? 'bg-blue-100 border-l-4 border-blue-600' : 'hover:bg-gray-100'}`}
                onClick={() => handleSelectCommodity(commodity)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{commodity.name}</h3>
                    <div className="text-xs text-gray-500">{commodity.symbol} • {commodity.origin}</div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatNumber(commodity.expiryDates[0]?.spotPrice || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main content */}
        <div className="col-span-9 space-y-4">
          {selectedCommodity && selectedExpiry ? (
            <>
              {/* Commodity header */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">{selectedCommodity.name} ({selectedCommodity.symbol})</h2>
                    <div className="text-sm text-gray-500">
                      {t('Grade')}: {selectedCommodity.grade} • {t('Origin')}: {selectedCommodity.origin} • {t('Unit')}: {selectedCommodity.unit}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="px-4 py-2 bg-green-600 text-white rounded-md"
                      onClick={() => {
                        setOrderSide('buy');
                        setShowOrderDialog(true);
                      }}
                    >
                      {t('Buy')}
                    </button>
                    <button 
                      className="px-4 py-2 bg-red-600 text-white rounded-md"
                      onClick={() => {
                        setOrderSide('sell');
                        setShowOrderDialog(true);
                      }}
                    >
                      {t('Sell')}
                    </button>
                  </div>
                </div>
                
                {/* Expiry date tabs */}
                <div className="mt-4 border-b border-gray-200">
                  <div className="flex space-x-4">
                    {selectedCommodity.expiryDates.map((expiry) => (
                      <button
                        key={expiry.id}
                        className={`pb-2 px-1 ${selectedExpiry?.id === expiry.id ? 'border-b-2 border-blue-600 font-medium text-blue-600' : 'text-gray-500'}`}
                        onClick={() => handleSelectExpiry(expiry)}
                      >
                        {expiry.displayName}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Price information */}
                <div className="mt-4 grid grid-cols-5 gap-4 text-center">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">{t('Spot Price')}</div>
                    <div className="font-bold">{formatNumber(selectedExpiry.spotPrice)}</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">{t('Future Premium')}</div>
                    <div className="font-bold">{formatNumber(selectedExpiry.futurePremium)}</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">{t('Future Price')}</div>
                    <div className="font-bold">{formatNumber(calculateFuturePrice(selectedExpiry.spotPrice, selectedExpiry.futurePremium))}</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">{t('Open Interest')}</div>
                    <div className="font-bold">{formatNumber(selectedExpiry.openInterest, 0)}</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">{t('Volume')}</div>
                    <div className="font-bold">{formatNumber(selectedExpiry.volume, 0)}</div>
                  </div>
                </div>
              </div>
              
              {/* Order book and recent trades */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium mb-2">{t('Order Book')}</h3>
                  <div className="grid grid-cols-3 text-sm font-medium text-gray-500 mb-2">
                    <div>{t('Price')}</div>
                    <div className="text-right">{t('Quantity')}</div>
                    <div className="text-right">{t('Total')}</div>
                  </div>
                  
                  {/* Asks (Sell orders) */}
                  <div className="mb-4 max-h-60 overflow-y-auto">
                    {orderBook.asks.map((ask, index) => (
                      <div key={`ask-${index}`} className="grid grid-cols-3 text-sm py-1">
                        <div className="text-red-600">{formatNumber(ask.price)}</div>
                        <div className="text-right">{formatNumber(ask.quantity, 0)}</div>
                        <div className="text-right">{ask.orders}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Current price */}
                  <div className="py-2 text-center font-bold border-y border-gray-200">
                    {formatNumber(calculateFuturePrice(selectedExpiry.spotPrice, selectedExpiry.futurePremium))}
                  </div>
                  
                  {/* Bids (Buy orders) */}
                  <div className="mt-4 max-h-60 overflow-y-auto">
                    {orderBook.bids.map((bid, index) => (
                      <div key={`bid-${index}`} className="grid grid-cols-3 text-sm py-1">
                        <div className="text-green-600">{formatNumber(bid.price)}</div>
                        <div className="text-right">{formatNumber(bid.quantity, 0)}</div>
                        <div className="text-right">{bid.orders}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium mb-2">{t('Recent Trades')}</h3>
                  <div className="grid grid-cols-3 text-sm font-medium text-gray-500 mb-2">
                    <div>{t('Price')}</div>
                    <div className="text-right">{t('Quantity')}</div>
                    <div className="text-right">{t('Time')}</div>
                  </div>
                  
                  <div className="max-h-[25rem] overflow-y-auto">
                    {recentTrades.map((trade) => (
                      <div key={trade.id} className="grid grid-cols-3 text-sm py-1">
                        <div>{formatNumber(trade.price)}</div>
                        <div className="text-right">{formatNumber(trade.quantity, 0)}</div>
                        <div className="text-right">{new Date(trade.timestamp).toLocaleTimeString()}</div>
                      </div>
                    ))}
                    
                    {recentTrades.length === 0 && (
                      <div className="text-center text-gray-500 py-4">{t('No recent trades')}</div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* User orders */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-medium mb-2">{t('Your Orders')}</h3>
                
                {userOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Commodity')}</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Expiry')}</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Side')}</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Price')}</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Quantity')}</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Filled')}</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Status')}</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Action')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {userOrders.map((order) => {
                          const commodity = mockCommodities.find(c => c.id === order.commodityId);
                          const expiry = commodity?.expiryDates.find(e => e.id === order.expiryId);
                          
                          return (
                            <tr key={order.id}>
                              <td className="px-4 py-2">{commodity?.symbol || order.commodityId}</td>
                              <td className="px-4 py-2">{expiry?.displayName || order.expiryId}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 text-xs rounded ${order.side === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {order.side === 'buy' ? t('Buy') : t('Sell')}
                                </span>
                              </td>
                              <td className="px-4 py-2">{formatNumber(order.price)}</td>
                              <td className="px-4 py-2">{formatNumber(order.quantity, 0)}</td>
                              <td className="px-4 py-2">{formatNumber(order.filledQuantity, 0)}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  order.status === 'filled' ? 'bg-green-100 text-green-800' : 
                                  order.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                  order.status === 'partially_filled' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {t(order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' '))}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                {order.status !== 'filled' && order.status !== 'cancelled' && (
                                  <button 
                                    className="text-red-600 hover:text-red-800"
                                    onClick={() => handleCancelOrder(order.id)}
                                  >
                                    {t('Cancel')}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">{t('You have no open orders')}</div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h2 className="text-xl font-medium text-gray-500 mb-2">{t('Select a Commodity')}</h2>
              <p className="text-gray-400">{t('Choose a commodity from the list to view trading information')}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Order placement dialog */}
      {showOrderDialog && selectedCommodity && selectedExpiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {orderSide === 'buy' ? t('Buy') : t('Sell')} {selectedCommodity.name} {selectedExpiry.displayName}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Order Type')}</label>
              <div className="flex space-x-2">
                <button
                  className={`flex-1 py-2 px-4 text-center rounded-md ${orderType === 'limit' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  onClick={() => setOrderType('limit')}
                >
                  {t('Limit')}
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-center rounded-md ${orderType === 'market' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  onClick={() => setOrderType('market')}
                >
                  {t('Market')}
                </button>
              </div>
            </div>
            
            {orderType === 'limit' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Price')}</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={t('Enter price')}
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(e.target.value)}
                />
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Amount')} ({selectedCommodity.unit})</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder={t('Enter amount')}
                min={selectedCommodity.minAmount}
                step={selectedCommodity.minAmount}
                value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-1">
                {t('Minimum')} {selectedCommodity.minAmount} {selectedCommodity.unit}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md"
                onClick={() => setShowOrderDialog(false)}
              >
                {t('Cancel')}
              </button>
              <button
                className={`px-4 py-2 text-white rounded-md ${
                  orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } ${
                  (!orderAmount || (orderType === 'limit' && !orderPrice)) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handlePlaceOrder}
                disabled={!orderAmount || (orderType === 'limit' && !orderPrice)}
              >
                {orderSide === 'buy' ? t('Buy') : t('Sell')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 