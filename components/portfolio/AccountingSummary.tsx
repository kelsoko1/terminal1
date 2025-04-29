'use client'

import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface Transaction {
  date: string
  type: string
  description: string
  amount: number
  balance: number
  fees: number
  tax: number
}

interface AccountingSummaryProps {
  accountingData: {
    cashBalance: number
    totalAssets: number
    unrealizedGains: number
    realizedGains: number
    dividendIncome: number
    totalFees: number
    totalTax: number
    roi: number
    transactions: Transaction[]
    monthlyPnL: {
      month: string
      realized: number
      unrealized: number
      dividends: number
      fees: number
      tax: number
    }[]
    taxMetrics: {
      name: string
      amount: number
      rate: number
    }[]
    financialRatios: {
      name: string
      value: number
      description: string
    }[]
  }
}

export function AccountingSummary({ accountingData }: AccountingSummaryProps) {
  // Provide default values for all accountingData properties
  const cashBalance = accountingData?.cashBalance || 0
  const totalAssets = accountingData?.totalAssets || 0
  const unrealizedGains = accountingData?.unrealizedGains || 0
  const realizedGains = accountingData?.realizedGains || 0
  const dividendIncome = accountingData?.dividendIncome || 0
  const totalFees = accountingData?.totalFees || 0
  const totalTax = accountingData?.totalTax || 0
  const roi = accountingData?.roi || 0
  const transactions = accountingData?.transactions || []
  const monthlyPnL = accountingData?.monthlyPnL || []
  const taxMetrics = accountingData?.taxMetrics || []
  const financialRatios = accountingData?.financialRatios || []

  const calculateTotalPnL = () => {
    return realizedGains + unrealizedGains + dividendIncome
  }

  const calculateNetPnL = () => {
    return calculateTotalPnL() - totalFees - totalTax
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="pnl">P&L Statement</TabsTrigger>
          <TabsTrigger value="tax">Tax Analysis</TabsTrigger>
          <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Cash Balance</h4>
              <p className="text-2xl font-bold">TZS {cashBalance.toLocaleString()}</p>
            </Card>
            <Card className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Total Assets</h4>
              <p className="text-2xl font-bold">TZS {totalAssets.toLocaleString()}</p>
            </Card>
            <Card className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Return on Investment</h4>
              <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {roi.toFixed(2)}%
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Gross P&L</h4>
              <p className={`text-2xl font-bold ${calculateTotalPnL() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                TZS {calculateTotalPnL().toLocaleString()}
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Net P&L</h4>
              <p className={`text-2xl font-bold ${calculateNetPnL() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                TZS {calculateNetPnL().toLocaleString()}
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Total Costs</h4>
              <p className="text-2xl font-bold text-red-600">
                TZS {(totalFees + totalTax).toLocaleString()}
              </p>
            </Card>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Performance Breakdown</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPnL}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `TZS ${value.toLocaleString()}`} />
                  <Tooltip formatter={(value) => [`TZS ${value.toLocaleString()}`]} />
                  <Legend />
                  <Line type="monotone" dataKey="realized" name="Realized" stroke="#8884d8" />
                  <Line type="monotone" dataKey="unrealized" name="Unrealized" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="dividends" name="Dividends" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Fees</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Net Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, index) => {
                  const netAmount = transaction.amount - transaction.fees - transaction.tax
                  return (
                    <TableRow key={index}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={`text-right ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        TZS {transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        TZS {transaction.fees.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        TZS {transaction.tax.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        TZS {netAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        TZS {transaction.balance.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="pnl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Realized P&L</TableHead>
                  <TableHead className="text-right">Unrealized P&L</TableHead>
                  <TableHead className="text-right">Dividends</TableHead>
                  <TableHead className="text-right">Fees</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Net P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyPnL.map((month, index) => {
                  const netPnL = month.realized + month.unrealized + month.dividends - month.fees - month.tax
                  return (
                    <TableRow key={index}>
                      <TableCell>{month.month}</TableCell>
                      <TableCell className={`text-right ${month.realized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        TZS {month.realized.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right ${month.unrealized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        TZS {month.unrealized.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        TZS {month.dividends.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        TZS {month.fees.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        TZS {month.tax.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        TZS {netPnL.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="tax">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Tax Summary</h3>
              <div className="space-y-4">
                {taxMetrics.map((metric, index) => (
                  <Card key={index} className="p-4">
                    <h4 className="text-sm font-medium text-muted-foreground">{metric.name}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xl font-bold">TZS {metric.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Rate: {metric.rate}%</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <div className="h-[300px]">
              <h3 className="text-lg font-semibold mb-4">Tax Trend</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPnL}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `TZS ${value.toLocaleString()}`} />
                  <Tooltip formatter={(value) => [`TZS ${value.toLocaleString()}`]} />
                  <Legend />
                  <Line type="monotone" dataKey="tax" name="Tax" stroke="#ff7300" />
                  <Line type="monotone" dataKey="fees" name="Fees" stroke="#ff0000" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ratios">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {financialRatios.map((ratio, index) => (
              <Card key={index} className="p-4">
                <h4 className="text-sm font-medium text-muted-foreground">{ratio.name}</h4>
                <p className="text-2xl font-bold">{ratio.value.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2">{ratio.description}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}