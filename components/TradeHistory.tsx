'use client';

import { useStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function TradeHistory() {
  const { trades } = useStore();

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
          {trades.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No DSE trading activity yet. Start trading to see your history here.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
