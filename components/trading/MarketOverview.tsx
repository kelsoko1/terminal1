'use client'

import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const marketData = [
  { market: 'US Market', status: 'Open', mainIndex: 'S&P 500', value: '4,783.45', change: '+0.8%' },
  { market: 'European Market', status: 'Open', mainIndex: 'STOXX 600', value: '478.50', change: '-0.3%' },
  { market: 'Asian Market', status: 'Closed', mainIndex: 'Nikkei 225', value: '33,450.30', change: '+1.2%' },
]

export default function MarketOverview() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Market Overview</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Market Cap</h3>
          <p className="text-2xl font-bold">TZS 2.8T</p>
          <p className="text-sm text-green-600">+2.4%</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">24h Volume</h3>
          <p className="text-2xl font-bold">TZS 84.5B</p>
          <p className="text-sm text-red-600">-1.2%</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">BTC Dominance</h3>
          <p className="text-2xl font-bold">42.3%</p>
          <p className="text-sm text-green-600">+0.5%</p>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Market</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Main Index</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>24h Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {marketData.map((item) => (
            <TableRow key={item.market}>
              <TableCell className="font-medium">{item.market}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              </TableCell>
              <TableCell>{item.mainIndex}</TableCell>
              <TableCell>{item.value}</TableCell>
              <TableCell className={item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                {item.change}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 