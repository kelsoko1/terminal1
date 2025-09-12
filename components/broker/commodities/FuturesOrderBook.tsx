import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FuturesOrder {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  price: number
  quantity: number
  clientId: string
  clientName: string
  status: 'pending' | 'matched' | 'cancelled'
  timestamp: string
}

const mockOrders: FuturesOrder[] = [
  {
    id: 'FUT-001', symbol: 'FXUSD', type: 'buy', price: 100, quantity: 10, clientId: 'CLI-001', clientName: 'John Makamba', status: 'pending', timestamp: '2024-04-12T09:00:00Z'
  },
  {
    id: 'FUT-002', symbol: 'FXUSD', type: 'sell', price: 101, quantity: 5, clientId: 'CLI-002', clientName: 'Amina Hussein', status: 'pending', timestamp: '2024-04-12T09:01:00Z'
  },
  {
    id: 'FUT-003', symbol: 'FXEUR', type: 'buy', price: 200, quantity: 8, clientId: 'CLI-003', clientName: 'Global Investments Ltd', status: 'matched', timestamp: '2024-04-12T09:02:00Z'
  }
]

export default function FuturesOrderBook() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOrders = mockOrders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Futures Order Book</h2>
      <Input
        placeholder="Search orders..."
        className="max-w-sm mb-4"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map(order => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.symbol}</TableCell>
              <TableCell>{order.type.toUpperCase()}</TableCell>
              <TableCell>{order.price}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>{order.clientName}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
} 