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
interface FutureCurrencyPair {
  id: string;
  name: string;
  baseCurrency: string;
  quoteCurrency: string;
  expiryDates: ExpiryDate[];
  minAmount: number;
}

interface ExpiryDate {
  id: string;
  date: string; // Format: YYYY-MM-DD
  displayName: string; // e.g. "JUN 2023"
  spotPrice: number;
  futurePremium: number;
  openInterest: number;
  volume: number;
}

interface Order {
  id: string;
  pairId: string;
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
  pairId: string;
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
  orderBooks: Record<string, OrderBook>; // key is pairId + expiryId
  orders: Order[];
  trades: Trade[];
}

// Mock data for currency pairs
const mockCurrencyPairs: FutureCurrencyPair[] = [
  {
    id: 'fxf1',
    name: 'TZS/USD',
    baseCurrency: 'TZS',
    quoteCurrency: 'USD',
    minAmount: 100000,
    expiryDates: [
      {
        id: 'exp1',
        date: '2023-12-31',
        displayName: 'DEC 2023',
        spotPrice: 2500,
        futurePremium: 25,
        openInterest: 1500000,
        volume: 500000
      },
      {
        id: 'exp2',
        date: '2024-03-31',
        displayName: 'MAR 2024',
        spotPrice: 2500,
        futurePremium: 45,
        openInterest: 1200000,
        volume: 350000
      },
      {
        id: 'exp3',
        date: '2024-06-30',
        displayName: 'JUN 2024',
        spotPrice: 2500,
        futurePremium: 70,
        openInterest: 800000,
        volume: 200000
      }
    ]
  },
  {
    id: 'fxf2',
    name: 'TZS/EUR',
    baseCurrency: 'TZS',
    quoteCurrency: 'EUR',
    minAmount: 100000,
    expiryDates: [
      {
        id: 'exp4',
        date: '2023-12-31',
        displayName: 'DEC 2023',
        spotPrice: 2700,
        futurePremium: 30,
        openInterest: 1200000,
        volume: 400000
      },
      {
        id: 'exp5',
        date: '2024-03-31',
        displayName: 'MAR 2024',
        spotPrice: 2700,
        futurePremium: 55,
        openInterest: 900000,
        volume: 250000
      }
    ]
  },
  {
    id: 'fxf3',
    name: 'TZS/GBP',
    baseCurrency: 'TZS',
    quoteCurrency: 'GBP',
    minAmount: 100000,
    expiryDates: [
      {
        id: 'exp6',
        date: '2023-12-31',
        displayName: 'DEC 2023',
        spotPrice: 3100,
        futurePremium: 35,
        openInterest: 1000000,
        volume: 350000
      },
      {
        id: 'exp7',
        date: '2024-03-31',
        displayName: 'MAR 2024',
        spotPrice: 3100,
        futurePremium: 65,
        openInterest: 750000,
        volume: 200000
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
    // Initialize empty order books for each pair and expiry date
    mockCurrencyPairs.forEach(pair => {
      pair.expiryDates.forEach(expiry => {
        const key = `${pair.id}-${expiry.id}`;
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
      // TZS/USD December 2023
      { pairId: 'fxf1', expiryId: 'exp1', side: 'buy', price: 2510, quantity: 50000 },
      { pairId: 'fxf1', expiryId: 'exp1', side: 'buy', price: 2505, quantity: 75000 },
      { pairId: 'fxf1', expiryId: 'exp1', side: 'buy', price: 2500, quantity: 100000 },
      { pairId: 'fxf1', expiryId: 'exp1', side: 'sell', price: 2530, quantity: 50000 },
      { pairId: 'fxf1', expiryId: 'exp1', side: 'sell', price: 2535, quantity: 75000 },
      { pairId: 'fxf1', expiryId: 'exp1', side: 'sell', price: 2540, quantity: 100000 },
      
      // TZS/USD March 2024
      { pairId: 'fxf1', expiryId: 'exp2', side: 'buy', price: 2530, quantity: 40000 },
      { pairId: 'fxf1', expiryId: 'exp2', side: 'buy', price: 2525, quantity: 60000 },
      { pairId: 'fxf1', expiryId: 'exp2', side: 'sell', price: 2550, quantity: 40000 },
      { pairId: 'fxf1', expiryId: 'exp2', side: 'sell', price: 2555, quantity: 60000 },
      
      // TZS/EUR December 2023
      { pairId: 'fxf2', expiryId: 'exp4', side: 'buy', price: 2710, quantity: 40000 },
      { pairId: 'fxf2', expiryId: 'exp4', side: 'buy', price: 2705, quantity: 60000 },
      { pairId: 'fxf2', expiryId: 'exp4', side: 'sell', price: 2730, quantity: 40000 },
      { pairId: 'fxf2', expiryId: 'exp4', side: 'sell', price: 2735, quantity: 60000 },
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
  
  public getOrderBook(pairId: string, expiryId: string): OrderBook {
    const key = `${pairId}-${expiryId}`;
    return this.state.orderBooks[key] || { bids: [], asks: [] };
  }
  
  public getUserOrders(): Order[] {
    // In a real app, this would filter by user ID
    return this.state.orders.filter(order => 
      !order.id.startsWith('init-') && 
      order.status !== 'cancelled'
    );
  }
  
  public getTrades(pairId?: string, expiryId?: string): Trade[] {
    let trades = this.state.trades;
    
    if (pairId) {
      trades = trades.filter(trade => trade.pairId === pairId);
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
    const key = `${order.pairId}-${order.expiryId}`;
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
            o.pairId === order.pairId &&
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
              pairId: order.pairId,
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
            o.pairId === order.pairId &&
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
              pairId: order.pairId,
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
    mockCurrencyPairs.forEach(pair => {
      pair.expiryDates.forEach(expiry => {
        const key = `${pair.id}-${expiry.id}`;
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
      
      const key = `${order.pairId}-${order.expiryId}`;
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
export function FxFutureTrading() {
  const [selectedPair, setSelectedPair] = useState<FutureCurrencyPair | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<ExpiryDate | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const { t } = useLanguage();
  
  // Initialize matching engine
  const [matchingEngine] = useState<MatchingEngine>(new MatchingEngine());
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  
  // Update the order book when user selects a pair and expiry
  useEffect(() => {
    if (selectedPair && selectedExpiry) {
      const newOrderBook = matchingEngine.getOrderBook(selectedPair.id, selectedExpiry.id);
      setOrderBook(newOrderBook);
      
      // Also update recent trades
      setRecentTrades(matchingEngine.getTrades(selectedPair.id, selectedExpiry.id));
    }
  }, [selectedPair, selectedExpiry, matchingEngine]);
  
  // Update user orders when needed
  useEffect(() => {
    setUserOrders(matchingEngine.getUserOrders());
  }, [matchingEngine, recentTrades]);
  
  const handleSelectPair = (pair: FutureCurrencyPair) => {
    setSelectedPair(pair);
    // Default to first expiry date
    if (pair.expiryDates.length > 0) {
      setSelectedExpiry(pair.expiryDates[0]);
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
    if (!selectedPair || !selectedExpiry) {
      return;
    }
    
    const price = orderType === 'market' 
      ? (orderSide === 'buy' ? orderBook.asks[0]?.price || 0 : orderBook.bids[0]?.price || 0)
      : parseFloat(orderPrice);
      
    const order: Order = {
      id: `order-${Math.random().toString(36).substring(2, 9)}`,
      pairId: selectedPair.id,
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
    setOrderBook(matchingEngine.getOrderBook(selectedPair.id, selectedExpiry.id));
    setUserOrders(matchingEngine.getUserOrders());
    setRecentTrades(matchingEngine.getTrades(selectedPair.id, selectedExpiry.id));
    
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
        selectedPair?.id || '', 
        selectedExpiry?.id || ''
      ));
      setUserOrders(matchingEngine.getUserOrders());
    }
  };
  
  const filteredPairs = mockCurrencyPairs.filter(pair => 
    pair.name.toLowerCase().includes(searchFilter.toLowerCase())
  );
  
  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">{t('fxFutureTrading') || 'FX Future Trading'}</h2>
            <p className="text-muted-foreground">
              {t('tradeFutureCurrencies') || 'Trade currency futures with our matching engine'}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t('refreshRates') || 'Refresh Rates'}
          </Button>
        </div>

        <div className="mb-4">
          <Label htmlFor="search">{t('search') || 'Search Currency Pairs'}</Label>
          <Input
            id="search"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search by currency pair..."
            className="max-w-sm"
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList className="bg-transparent border rounded-lg p-1 mb-6">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('allPairs') || 'All Pairs'}
            </TabsTrigger>
            <TabsTrigger 
              value="tzs-base"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('tzsBase') || 'TZS Base'}
            </TabsTrigger>
            <TabsTrigger 
              value="my-orders"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('myOrders') || 'My Orders'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pair') || 'Currency Pair'}</TableHead>
                  <TableHead>{t('expiry') || 'Expiry'}</TableHead>
                  <TableHead>{t('spotPrice') || 'Spot Price'}</TableHead>
                  <TableHead>{t('premium') || 'Premium'}</TableHead>
                  <TableHead>{t('futurePrice') || 'Future Price'}</TableHead>
                  <TableHead>{t('openInterest') || 'Open Interest'}</TableHead>
                  <TableHead>{t('actions') || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPairs.map(pair => (
                  pair.expiryDates.map(expiry => {
                    const futurePrice = calculateFuturePrice(expiry.spotPrice, expiry.futurePremium);
                    return (
                      <TableRow 
                        key={`${pair.id}-${expiry.id}`}
                        className={
                          selectedPair?.id === pair.id && selectedExpiry?.id === expiry.id 
                            ? 'bg-muted/50' 
                            : ''
                        }
                      >
                        <TableCell className="font-medium">{pair.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {expiry.displayName}
                          </div>
                        </TableCell>
                        <TableCell>{formatNumber(expiry.spotPrice, 2)}</TableCell>
                        <TableCell>+{formatNumber(expiry.futurePremium, 2)}</TableCell>
                        <TableCell className="font-semibold">{formatNumber(futurePrice, 2)}</TableCell>
                        <TableCell>{formatNumber(expiry.openInterest)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                handleSelectPair(pair);
                                handleSelectExpiry(expiry);
                                setOrderSide('buy');
                                setShowOrderDialog(true);
                              }}
                            >
                              {t('buy') || 'Buy'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                handleSelectPair(pair);
                                handleSelectExpiry(expiry);
                                setOrderSide('sell');
                                setShowOrderDialog(true);
                              }}
                            >
                              {t('sell') || 'Sell'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="tzs-base">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pair') || 'Currency Pair'}</TableHead>
                  <TableHead>{t('expiry') || 'Expiry'}</TableHead>
                  <TableHead>{t('spotPrice') || 'Spot Price'}</TableHead>
                  <TableHead>{t('premium') || 'Premium'}</TableHead>
                  <TableHead>{t('futurePrice') || 'Future Price'}</TableHead>
                  <TableHead>{t('openInterest') || 'Open Interest'}</TableHead>
                  <TableHead>{t('actions') || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPairs
                  .filter(pair => pair.baseCurrency === 'TZS')
                  .map(pair => (
                    pair.expiryDates.map(expiry => {
                      const futurePrice = calculateFuturePrice(expiry.spotPrice, expiry.futurePremium);
                      return (
                        <TableRow 
                          key={`${pair.id}-${expiry.id}`}
                          className={
                            selectedPair?.id === pair.id && selectedExpiry?.id === expiry.id 
                              ? 'bg-muted/50' 
                              : ''
                          }
                        >
                          <TableCell className="font-medium">{pair.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {expiry.displayName}
                            </div>
                          </TableCell>
                          <TableCell>{formatNumber(expiry.spotPrice, 2)}</TableCell>
                          <TableCell>+{formatNumber(expiry.futurePremium, 2)}</TableCell>
                          <TableCell className="font-semibold">{formatNumber(futurePrice, 2)}</TableCell>
                          <TableCell>{formatNumber(expiry.openInterest)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  handleSelectPair(pair);
                                  handleSelectExpiry(expiry);
                                  setOrderSide('buy');
                                  setShowOrderDialog(true);
                                }}
                              >
                                {t('buy') || 'Buy'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  handleSelectPair(pair);
                                  handleSelectExpiry(expiry);
                                  setOrderSide('sell');
                                  setShowOrderDialog(true);
                                }}
                              >
                                {t('sell') || 'Sell'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="my-orders">
            {userOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('pair') || 'Pair'}</TableHead>
                    <TableHead>{t('expiry') || 'Expiry'}</TableHead>
                    <TableHead>{t('side') || 'Side'}</TableHead>
                    <TableHead>{t('price') || 'Price'}</TableHead>
                    <TableHead>{t('quantity') || 'Quantity'}</TableHead>
                    <TableHead>{t('filled') || 'Filled'}</TableHead>
                    <TableHead>{t('status') || 'Status'}</TableHead>
                    <TableHead>{t('actions') || 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userOrders.map(order => {
                    const pair = mockCurrencyPairs.find(p => p.id === order.pairId);
                    const expiry = pair?.expiryDates.find(e => e.id === order.expiryId);
                    return (
                      <TableRow key={order.id}>
                        <TableCell>{pair?.name || order.pairId}</TableCell>
                        <TableCell>{expiry?.displayName || order.expiryId}</TableCell>
                        <TableCell>
                          <Badge variant={order.side === 'buy' ? 'default' : 'destructive'}>
                            {order.side === 'buy' ? t('buy') || 'Buy' : t('sell') || 'Sell'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatNumber(order.price, 2)}</TableCell>
                        <TableCell>{formatNumber(order.quantity)}</TableCell>
                        <TableCell>{formatNumber(order.filledQuantity)} ({Math.round(order.filledQuantity / order.quantity * 100)}%)</TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'filled' ? 'outline' : 
                            order.status === 'partially_filled' ? 'secondary' : 'default'
                          }>
                            {t(order.status === 'filled' ? 'filledStatus' : order.status) || order.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.status !== 'filled' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              {t('cancel') || 'Cancel'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {t('noOrdersYet') || 'No orders yet. Start trading to see your orders here.'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {orderSide === 'buy' ? t('confirmBuy') || 'Confirm Buy' : t('confirmSell') || 'Confirm Sell'}
            </DialogTitle>
            <DialogDescription>
              {t('enterOrderDetails') || 'Enter your order details'}
            </DialogDescription>
          </DialogHeader>

          {selectedPair && selectedExpiry && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between mb-4">
                <div>
                  <span className="font-medium">{selectedPair.name} {selectedExpiry.displayName}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Current Price: {formatNumber(calculateFuturePrice(selectedExpiry.spotPrice, selectedExpiry.futurePremium), 2)}
                  </span>
                </div>
                <Badge variant="outline">Cash Settled</Badge>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderType">{t('orderType') || 'Order Type'}</Label>
                    <Select 
                      value={orderType} 
                      onValueChange={(value) => setOrderType(value as 'market' | 'limit')}
                    >
                      <SelectTrigger id="orderType">
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="limit">{t('limitOrder') || 'Limit Order'}</SelectItem>
                        <SelectItem value="market">{t('marketOrder') || 'Market Order'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="side">{t('side') || 'Side'}</Label>
                    <Select 
                      value={orderSide}
                      onValueChange={(value) => setOrderSide(value as 'buy' | 'sell')}
                    >
                      <SelectTrigger id="side">
                        <SelectValue placeholder="Select side" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">
                          {t('buy') || 'Buy'}
                        </SelectItem>
                        <SelectItem value="sell">
                          {t('sell') || 'Sell'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {orderType === 'limit' && (
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      {t('price') || 'Price'} ({selectedPair.quoteCurrency})
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(e.target.value)}
                      placeholder={formatNumber(calculateFuturePrice(selectedExpiry.spotPrice, selectedExpiry.futurePremium), 2)}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {t('amount') || 'Amount'} ({selectedPair.baseCurrency})
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    placeholder={`Min: ${selectedPair.minAmount}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('minimumAmount') || 'Minimum amount'}: {formatNumber(selectedPair.minAmount)} {selectedPair.baseCurrency}
                  </p>
                </div>
                
                {orderPrice && orderAmount && (
                  <div className="py-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('total') || 'Total Value'}</span>
                      <span className="font-medium">
                        {formatNumber(
                          parseFloat(orderAmount) * (
                            orderType === 'limit' 
                              ? parseFloat(orderPrice) 
                              : calculateFuturePrice(selectedExpiry.spotPrice, selectedExpiry.futurePremium)
                          ), 
                          2
                        )} {selectedPair.quoteCurrency}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-sm space-y-2">
                <TooltipProvider>
                  <div className="flex gap-2 items-center">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {t('futuresWarning') || 'Futures trading involves risk. Make sure you understand the contract specifications.'}
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          {t('futuresInfo') || 'Currency futures are standardized contracts that allow you to buy or sell currency at a future date at a price agreed upon today.'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button 
              onClick={handlePlaceOrder}
              variant={orderSide === 'buy' ? 'default' : 'destructive'}
              disabled={
                (orderType === 'limit' && (!orderPrice || parseFloat(orderPrice) <= 0)) || 
                !orderAmount || 
                parseFloat(orderAmount) < (selectedPair?.minAmount || 0)
              }
            >
              {t('placeOrder') || 'Place Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 