'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

export default function MarketOverview() {
  const { stocks, isSyncing, lastSyncTimestamp, syncStocks } = useStore();
  const [marketStats, setMarketStats] = useState({
    marketCap: 'TZS 0',
    tradingVolume: 'TZS 0',
    marketStatus: 'Loading...',
    percentChange: '0%'
  });

  const [indices, setIndices] = useState<any[]>([]);
  const [sectorPerformance, setSectorPerformance] = useState<any[]>([]);
  const [marketNews, setMarketNews] = useState<any[]>([]);

  // Fetch comprehensive market data
  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market/market-data');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update market statistics
      setMarketStats({
        marketCap: data.marketCap || 'TZS 0',
        tradingVolume: data.tradingVolume || 'TZS 0',
        marketStatus: data.marketStatus || 'Unknown',
        percentChange: data.percentChange || '0%'
      });
      
      // Update indices, sector performance, and news
      if (Array.isArray(data.indices)) {
        setIndices(data.indices);
      }
      
      if (Array.isArray(data.sectorPerformance)) {
        setSectorPerformance(data.sectorPerformance);
      }
      
      if (Array.isArray(data.marketNews)) {
        setMarketNews(data.marketNews);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  useEffect(() => {
    // Initial data fetch
    syncStocks();
    fetchMarketData();

    // Regular sync interval
    const interval = setInterval(() => {
      syncStocks();
      fetchMarketData();
    }, 30000); // Reduced frequency to every 30 seconds for production

    return () => clearInterval(interval);
  }, [syncStocks]);

  return (
    <div className="space-y-6">
      {/* Market Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">DSE Market Cap</h3>
          <p className="text-2xl font-bold">{marketStats.marketCap}</p>
          <p className={`text-sm ${marketStats.percentChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {marketStats.percentChange}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Trading Volume</h3>
          <p className="text-2xl font-bold">{marketStats.tradingVolume}</p>
          <p className="text-sm text-muted-foreground">Daily volume</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Market Status</h3>
          <p className="text-2xl font-bold">{marketStats.marketStatus}</p>
          <p className="text-sm text-muted-foreground">
            {isSyncing ? 'Syncing data...' : lastSyncTimestamp ? `Last sync: ${new Date(lastSyncTimestamp).toLocaleTimeString()}` : 'Not synced yet'}
          </p>
        </Card>
      </div>
      
      {/* Market Indices */}
      {indices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Market Indices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {indices.map((index, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{index.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Updated: {new Date(index.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{index.value.toLocaleString()}</p>
                    <p className={`text-sm ${Number(index.percentChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(index.percentChange) >= 0 ? '+' : ''}{index.percentChange}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Sector Performance */}
      {sectorPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sector Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sectorPerformance.map((sector, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{sector.sector}</p>
                    <p className="text-sm text-muted-foreground">
                      {sector.stockCount} stocks
                    </p>
                  </div>
                  <div>
                    <p className={`font-bold ${Number(sector.percentChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(sector.percentChange) >= 0 ? '+' : ''}{sector.percentChange}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Market News */}
      {marketNews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Market News</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {marketNews.map((news, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{news.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(news.publishedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">{news.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
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