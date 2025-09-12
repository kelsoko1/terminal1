'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useWalletStore } from '@/lib/store/walletStore'
import { formatCurrency } from '@/lib/utils/currency'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function WalletOverview() {
  const { 
    balance, 
    totalDeposits, 
    totalWithdrawals, 
    lastDepositDate, 
    lastWithdrawalDate,
    isLoading,
    error,
    fetchWalletData 
  } = useWalletStore()
  
  // Fetch wallet data when component mounts
  useEffect(() => {
    fetchWalletData()
  }, [])

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

  // Show error if there is one
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading wallet data: {error}
          <button 
            onClick={() => fetchWalletData()} 
            className="ml-2 underline"
          >
            Retry
          </button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4 mobile-card">
          <h3 className="text-sm font-medium text-muted-foreground mobile-text">Available Balance</h3>
          {isLoading ? (
            <Skeleton className="h-8 w-24 my-1" />
          ) : (
            <p className="text-xl sm:text-2xl font-bold">{formatCurrency(balance)}</p>
          )}
          {isLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <p className="text-xs sm:text-sm text-green-600">
              {balance > 0 && totalDeposits > 0 ? `+${((balance / totalDeposits) * 100).toFixed(1)}%` : '0%'} total return
            </p>
          )}
        </Card>
        
        <Card className="p-4 mobile-card">
          <h3 className="text-sm font-medium text-muted-foreground mobile-text">Total Deposits</h3>
          {isLoading ? (
            <Skeleton className="h-8 w-24 my-1" />
          ) : (
            <p className="text-xl sm:text-2xl font-bold">{formatCurrency(totalDeposits)}</p>
          )}
          {isLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground">Last: {formatDate(lastDepositDate)}</p>
          )}
        </Card>
        
        <Card className="p-4 mobile-card">
          <h3 className="text-sm font-medium text-muted-foreground mobile-text">Total Withdrawals</h3>
          {isLoading ? (
            <Skeleton className="h-8 w-24 my-1" />
          ) : (
            <p className="text-xl sm:text-2xl font-bold">{formatCurrency(totalWithdrawals)}</p>
          )}
          {isLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground">Last: {formatDate(lastWithdrawalDate)}</p>
          )}
        </Card>
      </div>

      <Card className="p-4 sm:p-6 mobile-card">
        <h3 className="mobile-heading mb-3 sm:mb-4">Balance History</h3>
        <div className="h-[250px] sm:h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ) : balanceHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No transaction history available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Balance']}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#8884d8" 
                  name="Balance"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  )
} 