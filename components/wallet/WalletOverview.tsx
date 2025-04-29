'use client'

import { Card } from '@/components/ui/card'
import { useWalletStore } from '@/lib/store/walletStore'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function WalletOverview() {
  const { balance, totalDeposits, totalWithdrawals, lastDepositDate, lastWithdrawalDate } = useWalletStore()

  // Calculate balance history from transactions
  const balanceHistory = useWalletStore((state) => {
    const history: { date: string; balance: number }[] = []
    let runningBalance = 0
    
    // Group transactions by date and calculate running balance
    state.transactions
      .slice()
      .reverse()
      .forEach((tx) => {
        runningBalance += tx.type === 'deposit' ? tx.amount : -tx.amount
        history.push({
          date: new Date(tx.date).toLocaleDateString(),
          balance: runningBalance
        })
      })
    
    return history
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Available Balance</h3>
          <p className="text-2xl font-bold">TZS {balance.toFixed(2)}</p>
          <p className="text-sm text-green-600">
            {balance > 0 ? `+${((balance / totalDeposits) * 100).toFixed(1)}%` : '0%'} total return
          </p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Deposits</h3>
          <p className="text-2xl font-bold">TZS {totalDeposits.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Last: {formatDate(lastDepositDate)}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Withdrawals</h3>
          <p className="text-2xl font-bold">TZS {totalWithdrawals.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Last: {formatDate(lastWithdrawalDate)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Balance History</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={balanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `TZS ${value.toLocaleString()}`} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                }}
                formatter={(value: number) => [`TZS ${value.toLocaleString()}`, 'Balance']}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#8884d8" 
                name="Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
} 