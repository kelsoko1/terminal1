import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, BarChart2, Activity } from 'lucide-react';

interface MarketSentiment {
  symbol: string;
  name: string;
  buyPercentage: number;
  totalTraders: number;
  priceChange: number;
}

const popularInstruments: MarketSentiment[] = [
  {
    symbol: 'CRDB',
    name: 'CRDB Bank Plc',
    buyPercentage: 75,
    totalTraders: 1245,
    priceChange: 2.5,
  },
  {
    symbol: 'TBL',
    name: 'Tanzania Breweries',
    buyPercentage: 62,
    totalTraders: 890,
    priceChange: -1.2,
  },
  {
    symbol: 'WHREIT',
    name: 'Watumishi Housing REIT',
    buyPercentage: 82,
    totalTraders: 567,
    priceChange: 1.5,
  },
];

export function TradingStats() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Market Sentiment</h2>
      </div>

      <div className="space-y-6">
        {popularInstruments.map((instrument) => (
          <div key={instrument.symbol} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{instrument.symbol}</div>
                <div className="text-sm text-muted-foreground">{instrument.name}</div>
              </div>
              <div className={`text-sm font-semibold ${
                instrument.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {instrument.priceChange >= 0 ? '+' : ''}{instrument.priceChange}%
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Progress value={instrument.buyPercentage} className="flex-1" />
              <span className="text-sm font-medium">{instrument.buyPercentage}%</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{instrument.totalTraders.toLocaleString()} traders</span>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Market sentiment shows the percentage of traders who are buying vs. selling each instrument
          </div>
        </div>
      </div>
    </Card>
  );
} 