import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'

interface MatchedTrade {
  id: string
  buyOrderId: string
  sellOrderId: string
  symbol: string
  price: number
  quantity: number
  buyer: string
  seller: string
  timestamp: string
}

const initialMatchedTrades: MatchedTrade[] = [
  {
    id: 'MT-001', buyOrderId: 'FUT-001', sellOrderId: 'FUT-002', symbol: 'FXUSD', price: 100.5, quantity: 5, buyer: 'John Makamba', seller: 'Amina Hussein', timestamp: '2024-04-12T09:05:00Z'
  }
]

const mockNewTrades: MatchedTrade[] = [
  {
    id: 'MT-002', buyOrderId: 'FUT-004', sellOrderId: 'FUT-005', symbol: 'FXEUR', price: 200, quantity: 8, buyer: 'Global Investments Ltd', seller: 'Vodacom Tanzania PLC', timestamp: new Date().toISOString()
  },
  {
    id: 'MT-003', buyOrderId: 'FUT-006', sellOrderId: 'FUT-007', symbol: 'BTC-USD-SEP24', price: 65000, quantity: 2, buyer: 'Grace Neema', seller: 'NSSF Investment Fund', timestamp: new Date().toISOString()
  }
]

export default function FuturesMatchingEngine() {
  const [matchedTrades, setMatchedTrades] = useState(initialMatchedTrades)
  const [tradeIndex, setTradeIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMatchedTrades(trades => {
        if (tradeIndex < mockNewTrades.length) {
          const newTrade = {
            ...mockNewTrades[tradeIndex],
            timestamp: new Date().toISOString()
          }
          setTradeIndex(idx => idx + 1)
          return [...trades, newTrade]
        }
        return trades
      })
    }, 4000) // Add a new matched trade every 4 seconds
    return () => clearInterval(interval)
  }, [tradeIndex])

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Futures Matching Engine (Automatic)</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trade ID</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matchedTrades.map(trade => (
            <TableRow key={trade.id}>
              <TableCell>{trade.id}</TableCell>
              <TableCell>{trade.symbol}</TableCell>
              <TableCell>{trade.price}</TableCell>
              <TableCell>{trade.quantity}</TableCell>
              <TableCell>{trade.buyer}</TableCell>
              <TableCell>{trade.seller}</TableCell>
              <TableCell>{trade.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
} 