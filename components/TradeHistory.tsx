'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trade } from '@/lib/types';

export function TradeHistory() {
  const { trades: storeTrades, user, syncTrades, fetchTrades } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [trades, setTrades] = useState<Trade[]>(storeTrades);
  
  // Fetch trades when component mounts or user changes
  useEffect(() => {
    async function loadTrades() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch trades directly from the API
        const response = await axios.get(`/api/trading/trades?userId=${user.id}`);
        const fetchedTrades = response.data;
        
        // Update both local state and store
        setTrades(fetchedTrades);
        syncTrades(fetchedTrades);
      } catch (error) {
        console.error('Error fetching trades:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTrades();
  }, [user, syncTrades]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>DSE Trade History</CardTitle>
        <CardDescription>Your recent DSE trading activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trades.map((trade, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {trade.symbol}
                  </h3>
                  <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                    {trade.type === 'buy' ? 'Bought' : 'Sold'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {trade.quantity.toLocaleString()} shares @ TZS {trade.price.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  TZS {(trade.quantity * trade.price).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(trade.timestamp).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    hour12: false
                  })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Loading your trade history...
            </p>
          )}
          {!isLoading && trades.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No DSE trading activity yet. Start trading to see your history here.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
