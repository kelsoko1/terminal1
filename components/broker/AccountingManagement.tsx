'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DisbursementManagement, BrokerWalletManagement, WithdrawalRequestsManagement } from './accounting'

export default function AccountingManagement() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="broker-wallet">Broker Wallet</TabsTrigger>
          <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Commission Revenue</h3>
              <div className="text-3xl font-bold">TZS 425.8M</div>
              <p className="text-sm text-green-600">+15.2% from last month</p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Trading Volume</h3>
              <div className="text-3xl font-bold">TZS 8.2B</div>
              <p className="text-sm text-green-600">+8.5% from last month</p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Outstanding Fees</h3>
              <div className="text-3xl font-bold">TZS 52.3M</div>
              <p className="text-sm text-yellow-600">12 clients pending</p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Operating Expenses</h3>
              <div className="text-3xl font-bold">TZS 185.6M</div>
              <p className="text-sm text-muted-foreground">This month</p>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Commission Statements</h3>
                <div className="flex gap-2">
                  <Select defaultValue="march2025">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="march2025">March 2025</SelectItem>
                      <SelectItem value="february2025">February 2025</SelectItem>
                      <SelectItem value="january2025">January 2025</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>Generate Report</Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Trading Volume</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>ABC Investments</TableCell>
                    <TableCell>TZS 1.2B</TableCell>
                    <TableCell>TZS 12.5M</TableCell>
                    <TableCell><span className="text-green-600">Paid</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>XYZ Capital</TableCell>
                    <TableCell>TZS 850M</TableCell>
                    <TableCell>TZS 8.9M</TableCell>
                    <TableCell><span className="text-yellow-600">Pending</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Global Trade Ltd</TableCell>
                    <TableCell>TZS 2.1B</TableCell>
                    <TableCell>TZS 22.3M</TableCell>
                    <TableCell><span className="text-green-600">Paid</span></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Settlement Summary</h3>
                  <Button variant="outline">View Details</Button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Settlements Today</span>
                    <span className="font-semibold">TZS 3.5B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending Settlements</span>
                    <span className="font-semibold text-yellow-600">TZS 850M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Failed Settlements</span>
                    <span className="font-semibold text-red-600">TZS 125M</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Regulatory Fees</h3>
                  <Button variant="outline">Pay Fees</Button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Exchange Fees (Monthly)</span>
                    <span className="font-semibold text-yellow-600">Due in 5 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CMA Annual License Fee</span>
                    <span className="font-semibold text-green-600">Paid</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CSDR Contribution</span>
                    <span className="font-semibold text-green-600">Paid</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="broker-wallet" className="mt-6">
          <BrokerWalletManagement />
        </TabsContent>

        <TabsContent value="disbursements" className="mt-6">
          <DisbursementManagement />
        </TabsContent>
        
        <TabsContent value="withdrawals" className="mt-6">
          <WithdrawalRequestsManagement />
        </TabsContent>

        <TabsContent value="commissions" className="mt-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Commission Management</h3>
              <div className="flex gap-2">
                <Select defaultValue="march2025">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="march2025">March 2025</SelectItem>
                    <SelectItem value="february2025">February 2025</SelectItem>
                    <SelectItem value="january2025">January 2025</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Generate Report</Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Trading Volume</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>ABC Investments</TableCell>
                  <TableCell>TZS 1.2B</TableCell>
                  <TableCell>TZS 12.5M</TableCell>
                  <TableCell><span className="text-green-600">Paid</span></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>XYZ Capital</TableCell>
                  <TableCell>TZS 850M</TableCell>
                  <TableCell>TZS 8.9M</TableCell>
                  <TableCell><span className="text-yellow-600">Pending</span></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="outline" size="sm" className="ml-2">Remind</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Global Trade Ltd</TableCell>
                  <TableCell>TZS 2.1B</TableCell>
                  <TableCell>TZS 22.3M</TableCell>
                  <TableCell><span className="text-green-600">Paid</span></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="settlements" className="mt-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Settlement Management</h3>
              <div className="flex gap-2">
                <Select defaultValue="today">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="thisweek">This Week</SelectItem>
                    <SelectItem value="lastweek">Last Week</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Export</Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Settlement ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>STL-12345</TableCell>
                  <TableCell>ABC Investments</TableCell>
                  <TableCell>Buy</TableCell>
                  <TableCell>TZS 450M</TableCell>
                  <TableCell><span className="text-green-600">Completed</span></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>STL-12346</TableCell>
                  <TableCell>XYZ Capital</TableCell>
                  <TableCell>Sell</TableCell>
                  <TableCell>TZS 320M</TableCell>
                  <TableCell><span className="text-yellow-600">Pending</span></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="outline" size="sm" className="ml-2">Process</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>STL-12347</TableCell>
                  <TableCell>Global Trade Ltd</TableCell>
                  <TableCell>Buy</TableCell>
                  <TableCell>TZS 780M</TableCell>
                  <TableCell><span className="text-red-600">Failed</span></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="outline" size="sm" className="ml-2">Retry</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="regulatory" className="mt-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Regulatory Compliance</h3>
              <Button>Generate Report</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Authority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Monthly Trading Report</TableCell>
                  <TableCell>CMA</TableCell>
                  <TableCell>30 Apr 2025</TableCell>
                  <TableCell><span className="text-yellow-600">Pending</span></TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Submit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Quarterly Financial Statement</TableCell>
                  <TableCell>DSE</TableCell>
                  <TableCell>15 May 2025</TableCell>
                  <TableCell><span className="text-yellow-600">In Progress</span></TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Continue</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Annual License Fee</TableCell>
                  <TableCell>CMA</TableCell>
                  <TableCell>31 Mar 2025</TableCell>
                  <TableCell><span className="text-green-600">Completed</span></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View Receipt</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
