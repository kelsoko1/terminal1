'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Download, Upload, Search, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BondRecord {
  id: string
  bondNumber: string
  investorId: string
  investorName: string
  accountNumber: string
  purchaseDate: string
  maturityDate: string
  faceValue: number
  purchasePrice: number
  interestRate: number
  interestPaymentFrequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual'
  nextInterestPayment: string
  totalInterestPaid: number
  status: 'Active' | 'Matured' | 'Redeemed'
}

export function BondRecordKeeper() {
  const [showNewRecord, setShowNewRecord] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Sample bond records
  const [bondRecords, setBondRecords] = useState<BondRecord[]>([
    {
      id: 'r1',
      bondNumber: 'TZB001',
      investorId: 'INV001',
      investorName: 'Ahmed Mohamed',
      accountNumber: 'ACC001234',
      purchaseDate: '2025-01-15',
      maturityDate: '2030-01-15',
      faceValue: 1000000,
      purchasePrice: 980000,
      interestRate: 12.5,
      interestPaymentFrequency: 'Semi-Annual',
      nextInterestPayment: '2025-07-15',
      totalInterestPaid: 0,
      status: 'Active'
    },
    {
      id: 'r2',
      bondNumber: 'TZB002',
      investorId: 'INV002',
      investorName: 'Fatima Hussein',
      accountNumber: 'ACC005678',
      purchaseDate: '2024-12-01',
      maturityDate: '2029-12-01',
      faceValue: 500000,
      purchasePrice: 495000,
      interestRate: 11.8,
      interestPaymentFrequency: 'Quarterly',
      nextInterestPayment: '2025-03-01',
      totalInterestPaid: 14750,
      status: 'Active'
    }
  ])

  // Filter records based on search query
  const filteredRecords = bondRecords.filter(record =>
    record.bondNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.investorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.investorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-semibold">Investor Bond Records</h2>
        <Button onClick={() => setShowNewRecord(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Record
        </Button>
      </div>

      {showNewRecord ? (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Add New Investor Bond Record</h3>
            <Button variant="ghost" onClick={() => setShowNewRecord(false)}>
              Back to List
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="bondNumber">Bond Number</Label>
                <Input id="bondNumber" placeholder="Enter bond number" />
              </div>
              <div>
                <Label htmlFor="investorId">Investor ID</Label>
                <Input id="investorId" placeholder="Enter investor ID" />
              </div>
              <div>
                <Label htmlFor="investorName">Investor Name</Label>
                <Input id="investorName" placeholder="Enter investor name" />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" placeholder="Enter account number" />
              </div>
              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input id="purchaseDate" type="date" />
              </div>
              <div>
                <Label htmlFor="maturityDate">Maturity Date</Label>
                <Input id="maturityDate" type="date" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="faceValue">Face Value (TZS)</Label>
                <Input id="faceValue" type="number" />
              </div>
              <div>
                <Label htmlFor="purchasePrice">Purchase Price (TZS)</Label>
                <Input id="purchasePrice" type="number" />
              </div>
              <div>
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input id="interestRate" type="number" step="0.1" />
              </div>
              <div>
                <Label htmlFor="interestPaymentFrequency">Interest Payment Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nextInterestPayment">Next Interest Payment</Label>
                <Input id="nextInterestPayment" type="date" />
              </div>
              <Button className="w-full mt-8">Add Record</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by bond number, investor..."
                  className="pl-8 w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Records
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Records
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bond Number</TableHead>
                <TableHead>Investor ID</TableHead>
                <TableHead>Investor Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Maturity Date</TableHead>
                <TableHead>Face Value</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Next Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map(record => (
                <TableRow key={record.id}>
                  <TableCell>{record.bondNumber}</TableCell>
                  <TableCell>{record.investorId}</TableCell>
                  <TableCell>{record.investorName}</TableCell>
                  <TableCell>{record.accountNumber}</TableCell>
                  <TableCell>{record.purchaseDate}</TableCell>
                  <TableCell>{record.maturityDate}</TableCell>
                  <TableCell>{record.faceValue.toLocaleString()} TZS</TableCell>
                  <TableCell>{record.interestRate}%</TableCell>
                  <TableCell>{record.nextInterestPayment}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : record.status === 'Matured'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  )
}
