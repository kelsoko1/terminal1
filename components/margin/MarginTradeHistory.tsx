'use client'

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { marginTradeService } from '@/lib/services/marginTradeService';
import type { TradeHistory } from '@/lib/services/marginTradeService';

export default function MarginTradeHistory() {
  const [history, setHistory] = React.useState<TradeHistory[]>([])

  React.useEffect(() => {
    // In a real app, this would be a live subscription
    const interval = setInterval(() => {
      setHistory(marginTradeService.getHistory())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
      <h2 className="text-lg font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
        Trade History
      </h2>

      <div className="space-y-4">
        {history.map((trade) => (
          <div key={trade.id} className="p-4 border rounded-lg bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{trade.symbol}</h3>
                <Badge 
                  variant={trade.type === 'long' ? 'default' : 'destructive'}
                  className={trade.type === 'long' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}
                >
                  {trade.type === 'long' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {trade.type.toUpperCase()}
                </Badge>
                <Badge 
                  variant="outline"
                  className="border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300"
                >
                  {trade.leverage}x
                </Badge>
                <Badge 
                  variant="outline"
                  className="border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(trade.date).toLocaleDateString()}
                </Badge>
              </div>
              <div className={`text-sm font-medium ${trade.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trade.pnl >= 0 ? '+' : '-'}TZS {Math.abs(trade.pnl).toLocaleString()} ({trade.pnlPercentage}%)
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="text-muted-foreground">Size</div>
                <div className="font-medium">TZS {trade.size.toLocaleString()}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="text-muted-foreground">Entry Price</div>
                <div className="font-medium">TZS {trade.entryPrice.toLocaleString()}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="text-muted-foreground">Exit Price</div>
                <div className="font-medium">TZS {trade.exitPrice.toLocaleString()}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="text-muted-foreground">P/L %</div>
                <div className={`font-medium ${trade.pnlPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {trade.pnlPercentage >= 0 ? '+' : ''}{trade.pnlPercentage}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {history.length === 0 && (
        <div className="text-center text-muted-foreground py-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          No trade history
        </div>
      )}
    </Card>
  );
} 