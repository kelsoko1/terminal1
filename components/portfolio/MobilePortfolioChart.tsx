'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MobilePortfolioChartProps {
  data: any[];
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  formatCurrency: (value: number) => string;
}

export function MobilePortfolioChart({
  data,
  timeframe,
  setTimeframe,
  formatCurrency
}: MobilePortfolioChartProps) {
  return (
    <div className="border rounded-lg p-3 md:p-4 h-[250px] md:h-[300px]">
      <h3 className="text-sm font-medium mb-2">Portfolio Value</h3>
      <div className="flex space-x-1 md:space-x-2 mb-3 md:mb-4 overflow-x-auto pb-1">
        {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
          <Button 
            key={tf} 
            variant={timeframe === tf ? "default" : "outline"}
            size="sm"
            className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
            onClick={() => setTimeframe(tf)}
          >
            {tf}
          </Button>
        ))}
      </div>
      <div className="h-[150px] md:h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                // Format based on timeframe
                if (timeframe === '1D') {
                  return value.split(' ')[1]; // Return only time
                } else if (timeframe === '1W' || timeframe === '1M') {
                  return value.split(' ')[0]; // Return only date
                } else {
                  return value.split(' ')[0].split('-').slice(1).join('/'); // MM/DD format
                }
              }}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => formatCurrency(value)}
              width={50}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Value']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{ fontSize: '12px' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
