'use client'

import { useState } from 'react'
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
  performance: {
    oneMonth: number
    threeMonths: number
    oneYear: number
  }
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
  const [editFormData, setEditFormData] = useState({
    name: '',
    manager: '',
    nav: 0,
    aum: 0,
    minInvestment: 0
  })
  
  // Mock list of funds
  const [fundsList, setFundsList] = useState([
    { id: 'f1', name: 'Alpha Halal Fund', nav: 1100, aum: 150000000, manager: 'Ahmed Salim', minInvestment: 1000000 },
    { id: 'f2', name: 'Bahari Growth Fund', nav: 1250, aum: 85000000, manager: 'Fatima Hussein', minInvestment: 500000 },
    { id: 'f3', name: 'Amana Income Fund', nav: 1050, aum: 120000000, manager: 'Omar Abdullah', minInvestment: 250000 },
    { id: 'f4', name: 'Takaful Investment Fund', nav: 1320, aum: 95000000, manager: 'Aisha Juma', minInvestment: 1000000 },
    { id: 'f5', name: 'Baraka Dividend Fund', nav: 1180, aum: 110000000, manager: 'Yusuf Ibrahim', minInvestment: 500000 },
  ])
  
  // Mock data for Alpha Halal Fund Record Keeper
  const mockTransactions: Transaction[] = [
    { id: 'T001', date: '2025-03-20', investor: 'Ahmed Mohamed', type: 'Buy', amount: 5000000, units: 4545.45, navPerUnit: 1100, status: 'Completed' },
    { id: 'T002', date: '2025-03-19', investor: 'Fatima Hussein', type: 'Buy', amount: 2000000, units: 1818.18, navPerUnit: 1100, status: 'Completed' },
    { id: 'T003', date: '2025-03-18', investor: 'Omar Abdullah', type: 'Sell', amount: 1100000, units: 1000, navPerUnit: 1100, status: 'Completed' },
    { id: 'T004', date: '2025-03-17', investor: 'Aisha Juma', type: 'Buy', amount: 3300000, units: 3000, navPerUnit: 1100, status: 'Completed' },
    { id: 'T005', date: '2025-03-15', investor: 'Yusuf Ibrahim', type: 'Buy', amount: 5500000, units: 5000, navPerUnit: 1100, status: 'Completed' },
  ]
  
  const mockInvestors: Investor[] = [
    { id: 'I001', name: 'Ahmed Mohamed', accountNumber: 'AHF-00123', email: 'ahmed@example.com', phone: '+255 712 345 678', totalInvestment: 5000000, totalUnits: 4545.45 },
    { id: 'I002', name: 'Fatima Hussein', accountNumber: 'AHF-00124', email: 'fatima@example.com', phone: '+255 723 456 789', totalInvestment: 2000000, totalUnits: 1818.18 },
    { id: 'I003', name: 'Omar Abdullah', accountNumber: 'AHF-00125', email: 'omar@example.com', phone: '+255 734 567 890', totalInvestment: 0, totalUnits: 0 },
    { id: 'I004', name: 'Aisha Juma', accountNumber: 'AHF-00126', email: 'aisha@example.com', phone: '+255 745 678 901', totalInvestment: 3300000, totalUnits: 3000 },
    { id: 'I005', name: 'Yusuf Ibrahim', accountNumber: 'AHF-00127', email: 'yusuf@example.com', phone: '+255 756 789 012', totalInvestment: 5500000, totalUnits: 5000 },
  ]
  
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

      {showNewFund ? (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Add New Mutual Fund</h3>
            <Button variant="ghost" onClick={() => setShowNewFund(false)}>
              Back to List
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Fund Name</Label>
                <Input id="name" placeholder="Enter fund name" />
              </div>
              <div>
                <Label htmlFor="manager">Fund Manager</Label>
                <Input id="manager" placeholder="Enter fund manager" />
              </div>
              <div>
                <Label htmlFor="nav">NAV per Unit (TZS)</Label>
                <Input id="nav" type="number" step="0.01" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="aum">AUM (TZS)</Label>
                <Input id="aum" type="number" />
              </div>
              <div>
                <Label htmlFor="minInvestment">Minimum Investment (TZS)</Label>
                <Input id="minInvestment" type="number" />
              </div>
              <div>
                <Label htmlFor="description">Fund Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter fund description and investment strategy"
                  className="h-24"
                />
              </div>
              <Button className="w-full mt-2">Add Fund</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border rounded-lg p-1">
              <TabsTrigger value="all">All Funds</TabsTrigger>
              <TabsTrigger value="record-keeper">Record Keeper</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {editingFund ? (
                <div className="p-6 space-y-6 border rounded-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Edit Fund</h3>
                    <Button variant="ghost" onClick={() => setEditingFund(null)}>
                      Cancel
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-name">Fund Name</Label>
                        <Input 
                          id="edit-name" 
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-manager">Fund Manager</Label>
                        <Input 
                          id="edit-manager" 
                          value={editFormData.manager}
                          onChange={(e) => setEditFormData({...editFormData, manager: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-nav">NAV per Unit (TZS)</Label>
                        <Input 
                          id="edit-nav" 
                          type="number" 
                          step="0.01"
                          value={editFormData.nav}
                          onChange={(e) => setEditFormData({...editFormData, nav: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-aum">AUM (TZS)</Label>
                        <Input 
                          id="edit-aum" 
                          type="number"
                          value={editFormData.aum}
                          onChange={(e) => setEditFormData({...editFormData, aum: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-minInvestment">Minimum Investment (TZS)</Label>
                        <Input 
                          id="edit-minInvestment" 
                          type="number"
                          value={editFormData.minInvestment}
                          onChange={(e) => setEditFormData({...editFormData, minInvestment: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="flex gap-2 mt-8">
                        <Button 
                          className="flex-1"
                          onClick={() => {
                            setFundsList(fundsList.map(fund => 
                              fund.id === editingFund ? {...fund, ...editFormData} : fund
                            ));
                            setEditingFund(null);
                          }}
                        >
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setEditingFund(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fund Name</TableHead>
                      <TableHead>NAV (TZS)</TableHead>
                      <TableHead>AUM (TZS)</TableHead>
                      <TableHead>1M Return</TableHead>
                      <TableHead>3M Return</TableHead>
                      <TableHead>1Y Return</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fundsList.map(fund => (
                      <TableRow key={fund.id}>
                        <TableCell className="font-medium">{fund.name}</TableCell>
                        <TableCell>{fund.nav.toLocaleString()}</TableCell>
                        <TableCell>{fund.aum.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">+2.5%</TableCell>
                        <TableCell className="text-green-600">+5.8%</TableCell>
                        <TableCell className="text-green-600">+12.3%</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingFund(fund.id);
                              setEditFormData({
                                name: fund.name,
                                manager: fund.manager,
                                nav: fund.nav,
                                aum: fund.aum,
                                minInvestment: fund.minInvestment
                              });
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Record Keeper Tab */}
            <TabsContent value="record-keeper" className="mt-6">
              {!selectedFund ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Select a Fund</h3>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search funds..."
                        className="pl-8 w-[250px]"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {fundsList.map(fund => (
                      <Card 
                        key={fund.id} 
                        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        onClick={() => setSelectedFund(fund.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">{fund.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              NAV: {fund.nav.toLocaleString()} TZS • AUM: {(fund.aum / 1000000).toLocaleString()} M TZS
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedFund(null)}
                      className="mb-2"
                    >
                      ← Back to Funds List
                    </Button>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-4">
                      {fundsList.find(f => f.id === selectedFund)?.name || 'Alpha Halal Fund'} Record Keeper
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current NAV (TZS)</p>
                        <p className="text-2xl font-bold">{fundPerformance.nav.toLocaleString()}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-500 dark:text-gray-400">AUM (TZS)</p>
                        <p className="text-2xl font-bold">{fundPerformance.aum.toLocaleString()}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Investors</p>
                        <p className="text-2xl font-bold">{fundPerformance.totalInvestors}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-500 dark:text-gray-400">YTD Return</p>
                        <p className="text-2xl font-bold text-green-600">+{fundPerformance.ytdReturn}%</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Button variant="outline" className="bg-white dark:bg-gray-800">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      <Button variant="outline" className="bg-white dark:bg-gray-800">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </Button>
                      <Button variant="outline" className="bg-white dark:bg-gray-800">
                        <Calendar className="h-4 w-4 mr-2" />
                        Set NAV Date
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Tabs defaultValue="transactions">
                      <TabsList>
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                        <TabsTrigger value="investors">Investors</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="transactions" className="space-y-4 pt-4">
                        <div className="flex flex-wrap gap-2 justify-between">
                          <div className="flex gap-2">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                              <Input
                                placeholder="Search transactions..."
                                className="pl-8 w-[250px]"
                              />
                            </div>
                            <Select>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Transaction Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="buy">Buy</SelectItem>
                                <SelectItem value="sell">Sell</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon">
                              <Filter className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Transaction
                          </Button>
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[100px]">ID</TableHead>
                              <TableHead>
                                <div className="flex items-center">
                                  Date
                                  <ArrowUpDown className="ml-2 h-4 w-4" />
                                </div>
                              </TableHead>
                              <TableHead>Investor</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-right">Amount (TZS)</TableHead>
                              <TableHead className="text-right">Units</TableHead>
                              <TableHead className="text-right">NAV/Unit</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockTransactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell className="font-medium">{transaction.id}</TableCell>
                                <TableCell>{transaction.date}</TableCell>
                                <TableCell>{transaction.investor}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    transaction.type === 'Buy' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  }`}>
                                    {transaction.type}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">{transaction.amount.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{transaction.units.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{transaction.navPerUnit.toLocaleString()}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    transaction.status === 'Completed' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                      : transaction.status === 'Pending'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  }`}>
                                    {transaction.status}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm">View</Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TabsContent>
                      
                      <TabsContent value="investors" className="space-y-4 pt-4">
                        <div className="flex flex-wrap gap-2 justify-between">
                          <div className="flex gap-2">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                              <Input
                                placeholder="Search investors..."
                                className="pl-8 w-[250px]"
                              />
                            </div>
                            <Button variant="outline" size="icon">
                              <Filter className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Investor
                          </Button>
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[100px]">ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Account Number</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Phone</TableHead>
                              <TableHead className="text-right">Total Investment (TZS)</TableHead>
                              <TableHead className="text-right">Total Units</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockInvestors.map((investor) => (
                              <TableRow key={investor.id}>
                                <TableCell className="font-medium">{investor.id}</TableCell>
                                <TableCell>{investor.name}</TableCell>
                                <TableCell>{investor.accountNumber}</TableCell>
                                <TableCell>{investor.email}</TableCell>
                                <TableCell>{investor.phone}</TableCell>
                                <TableCell className="text-right">{investor.totalInvestment.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{investor.totalUnits.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm">View</Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TabsContent>
                      
                      <TabsContent value="reports" className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="p-4">
                            <h4 className="text-lg font-semibold mb-4">Performance Reports</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                <span>Daily NAV Report</span>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </Button>
                              </div>
                              <div className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                <span>Monthly Performance Report</span>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </Button>
                              </div>
                              <div className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                <span>Quarterly Performance Report</span>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </Button>
                              </div>
                              <div className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                <span>Annual Performance Report</span>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </Button>
                              </div>
                            </div>
                          </Card>
                          
                          <Card className="p-4">
                            <h4 className="text-lg font-semibold mb-4">Investor Reports</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                <span>Investor Holdings Report</span>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </Button>
                              </div>
                              <div className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                <span>Transaction History Report</span>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </Button>
                              </div>
                              <div className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                <span>Investor Statement</span>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </Button>
                              </div>
                              <div className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                <span>Dividend Distribution Report</span>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  )
}
