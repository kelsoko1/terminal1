'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { generateMockPriceUpdate } from '@/lib/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function MarketOverview() {
  const { stocks, updateStocks, isSyncing, setSyncStatus, updateLastSyncTimestamp, lastSyncTimestamp, syncStocks } = useStore();

  useEffect(() => {
    // Initial sync
    syncStocks();

    // Regular sync interval
    const interval = setInterval(() => {
      syncStocks();
    }, 5000);

    return () => clearInterval(interval);
  }, [syncStocks]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">DSE Market Cap</h3>
          <p className="text-2xl font-bold">TZS 2.8T</p>
          <p className="text-sm text-green-600">+2.4%</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Trading Volume</h3>
          <p className="text-2xl font-bold">TZS 84.5B</p>
          <p className="text-sm text-red-600">-1.2%</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Market Status</h3>
          <p className="text-2xl font-bold">Open</p>
          <p className="text-sm text-muted-foreground">
            {isSyncing ? 'Syncing with Appwrite...' : lastSyncTimestamp ? `Last sync: ${new Date(lastSyncTimestamp).toLocaleTimeString()}` : 'Not synced yet'}
          </p>
        </Card>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="text-right">Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.map((stock) => (
              <TableRow key={stock.symbol}>
                <TableCell className="font-medium">{stock.symbol}</TableCell>
                <TableCell>{stock.name}</TableCell>
                <TableCell className="text-right">TZS {stock.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={`flex items-center justify-end ${
                      stock.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stock.percentageChange >= 0 ? (
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(stock.percentageChange).toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {stock.volume.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}