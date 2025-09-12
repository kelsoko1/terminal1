'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TradeModal } from '@/components/TradeModal';
import { Stock } from '@/lib/types';
import { Portfolio } from '@/components/Portfolio';
import { TradeHistory } from '@/components/TradeHistory';
import axios from 'axios';

export default function TradingDashboard() {
  const { user } = useStore();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/trading/stocks');
        setStocks(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch stocks:', err);
        setError('Failed to fetch stocks');
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  const handleTrade = (stock: Stock, type: 'buy' | 'sell') => {
    setSelectedStock(stock);
    setTradeType(type);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DSE Trading Dashboard</CardTitle>
          <CardDescription>Please log in to start trading DSE stocks</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>DSE Trading Dashboard</CardTitle>
          <CardDescription>Balance: {formatCurrency(user.balance)}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading stocks...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="space-y-4">
              {stocks.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{stock.symbol}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(stock.price)}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleTrade(stock, 'buy')}
                  >
                    Buy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTrade(stock, 'sell')}
                  >
                    Sell
                  </Button>
                </div>
              </div>
            ))}
            </div>
          )
        </CardContent>
      </Card>
      <div className="mt-4">
        <Portfolio />
      </div>
      <div className="mt-4">
        <TradeHistory />
      </div>
      {selectedStock && (
        <TradeModal
          stock={selectedStock}
          type={tradeType}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </>
  );
}
