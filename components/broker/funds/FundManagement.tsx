'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Download, Upload, Search, Filter, Calendar, ArrowUpDown, ChevronRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Fund {
  id: string
  name: string
  manager: string
  nav: number
  aum: number
  minInvestment: number
  oneMonthReturn: number
  threeMonthReturn: number
  oneYearReturn: number
  inceptionDate?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

interface Transaction {
  id: string
  date: string
  investor: string
  type: 'Buy' | 'Sell'
  amount: number
  units: number
  navPerUnit: number
  status: 'Pending' | 'Completed' | 'Rejected'
}

interface Investor {
  id: string
  name: string
  accountNumber: string
  email: string
  phone: string
  totalInvestment: number
  totalUnits: number
}

export function FundManagement() {
  const [showNewFund, setShowNewFund] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedDate, setSelectedDate] = useState<string>('2025-03-24')
  const [selectedFund, setSelectedFund] = useState<string | null>(null)
  const [editingFund, setEditingFund] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fundsList, setFundsList] = useState<Fund[]>([])

  useEffect(() => {
    fetchFunds()
  }, [])

  const fetchFunds = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/trading/funds')
      setFundsList(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch funds')
    } finally {
      setLoading(false)
    }
  }

  // Fund performance data
  const fundPerformance = {
    nav: 1100,
    aum: 150000000,
    totalInvestors: 42,
    inceptionDate: '2024-01-01',
    ytdReturn: 10.5,
    oneYearReturn: 12.8,
    threeYearReturn: 0,
    fiveYearReturn: 0
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-semibold">Mutual Fund Management</h2>
        <Button onClick={() => setShowNewFund(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Fund
        </Button>
      </div>
      <div className="p-6">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Funds</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <p className="text-lg">Loading funds...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-500">{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchFunds}>
                  Retry
                </Button>
              </div>
            ) : fundsList.length === 0 ? (
              <div className="text-center p-8 border rounded-lg">
                <p className="text-muted-foreground mb-4">No funds found. Add a fund to get started.</p>
                <Button onClick={() => setShowNewFund(true)}>Add New Fund</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>NAV</TableHead>
                    <TableHead>AUM</TableHead>
                    <TableHead>1Y Return</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fundsList.map((fund) => (
                    <TableRow key={fund.id}>
                      <TableCell>{fund.name}</TableCell>
                      <TableCell>{fund.manager}</TableCell>
                      <TableCell>{fund.nav.toLocaleString()}</TableCell>
                      <TableCell>{fund.aum.toLocaleString()}</TableCell>
                      <TableCell>{fund.oneYearReturn}%</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  )
}
