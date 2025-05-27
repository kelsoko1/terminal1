'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal'
  method: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  date: string
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    method: 'M-Pesa',
    amount: 1000,
    status: 'completed',
    date: '2024-03-15',
  },
  {
    id: '2',
    type: 'withdrawal',
    method: 'Bank Transfer',
    amount: 500,
    status: 'pending',
    date: '2024-03-14',
  },
  {
    id: '3',
    type: 'deposit',
    method: 'Credit Card',
    amount: 2000,
    status: 'completed',
    date: '2024-03-13',
  },
]

export default function TransactionHistory() {
  const [filterType, setFilterType] = useState('all')
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Input
          placeholder="Search transactions..."
          className="w-full sm:max-w-sm"
        />
        
        <Select
          value={filterType}
          onValueChange={setFilterType}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Desktop Table - Hidden on Mobile */}
      <div className="hidden sm:block overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>
                  <Badge variant={transaction.type === 'deposit' ? 'secondary' : 'outline'}>
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.method}</TableCell>
                <TableCell className={transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                  {transaction.type === 'deposit' ? '+' : '-'}TZS {transaction.amount}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      transaction.status === 'completed' ? 'secondary' :
                      transaction.status === 'pending' ? 'outline' : 'destructive'
                    }
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile Card Layout - Shown only on Mobile */}
      <div className="sm:hidden space-y-3">
        {mockTransactions.map((transaction) => (
          <div key={transaction.id} className="border rounded-lg p-4 mobile-card space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">{transaction.date}</p>
              <Badge 
                variant={
                  transaction.status === 'completed' ? 'secondary' :
                  transaction.status === 'pending' ? 'outline' : 'destructive'
                }
              >
                {transaction.status}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <Badge variant={transaction.type === 'deposit' ? 'secondary' : 'outline'}>
                {transaction.type}
              </Badge>
              <p className={`font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'deposit' ? '+' : '-'}TZS {transaction.amount}
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground">Method: {transaction.method}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 