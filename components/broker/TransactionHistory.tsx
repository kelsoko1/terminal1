'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Transaction {
  id: string
  clientName: string
  symbol: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  status: 'pending' | 'executed' | 'rejected' | 'cancelled'
  date: string
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    clientName: 'John Makamba',
    symbol: 'CRDB',
    type: 'buy',
    quantity: 1000,
    price: 400,
    status: 'executed',
    date: '2024-03-15'
  },
  {
    id: '2',
    clientName: 'Sarah Kimaro',
    symbol: 'NMB',
    type: 'buy',
    quantity: 500,
    price: 3900,
    status: 'pending',
    date: '2024-03-15'
  },
  {
    id: '3',
    clientName: 'Michael Shirima',
    symbol: 'TBL',
    type: 'sell',
    quantity: 200,
    price: 10900,
    status: 'executed',
    date: '2024-03-15'
  },
  {
    id: '4',
    clientName: 'Grace Mwakio',
    symbol: 'TPCC',
    type: 'buy',
    quantity: 300,
    price: 4200,
    status: 'pending',
    date: '2024-03-15'
  },
  {
    id: '5',
    clientName: 'Peter Masawe',
    symbol: 'TOL',
    type: 'sell',
    quantity: 1500,
    price: 500,
    status: 'executed',
    date: '2024-03-15'
  }
]

export default function TransactionHistory() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">DSE Order Management</h2>
        <Button variant="outline">Export Orders</Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by client or symbol..."
          className="max-w-sm"
        />
        
        <Select
          value={filterType}
          onValueChange={setFilterType}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Order Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="buy">Buy Orders</SelectItem>
            <SelectItem value="sell">Sell Orders</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterStatus}
          onValueChange={setFilterStatus}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="executed">Executed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price (TZS)</TableHead>
            <TableHead>Total (TZS)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.date}</TableCell>
              <TableCell>{transaction.clientName}</TableCell>
              <TableCell>{transaction.symbol}</TableCell>
              <TableCell>
                <Badge variant={transaction.type === 'buy' ? 'default' : 'secondary'}>
                  {transaction.type.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>{transaction.quantity.toLocaleString()}</TableCell>
              <TableCell>{transaction.price.toLocaleString()}</TableCell>
              <TableCell>{(transaction.quantity * transaction.price).toLocaleString()}</TableCell>
              <TableCell>
                <Badge 
                  variant={
                    transaction.status === 'executed' ? 'default' :
                    transaction.status === 'pending' ? 'secondary' :
                    transaction.status === 'rejected' ? 'destructive' :
                    'outline'
                  }
                >
                  {transaction.status.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">View</Button>
                  {transaction.status === 'pending' && (
                    <>
                      <Button variant="outline" size="sm" className="text-red-600">Cancel</Button>
                      <Button size="sm">Execute</Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 