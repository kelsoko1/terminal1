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
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import CreateBrokerAccount from './CreateBrokerAccount'
import { BrokerAccount } from '@/lib/auth/types'

// Mock data - Replace with API calls in production
const MOCK_BROKERS: BrokerAccount[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'broker',
    licenseNumber: 'BRK-2025-001',
    department: 'equities',
    tradingLimit: 1000000,
    supervisor: 'Sarah Johnson',
    hireDate: '2024-01-15',
    status: 'active',
    permissions: ['trading', 'client_management', 'reports'],
    lastLogin: '2025-03-23T14:30:00',
    certifications: [
      {
        name: 'Advanced Trading Certification',
        issueDate: '2024-02-01',
        expiryDate: '2026-02-01',
        status: 'active',
      }
    ]
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'trader',
    department: 'derivatives',
    tradingLimit: 500000,
    supervisor: 'John Smith',
    hireDate: '2024-06-01',
    status: 'active',
    permissions: ['trading', 'reports'],
    lastLogin: '2025-03-23T16:45:00',
    certifications: [
      {
        name: 'Derivatives Trading Certification',
        issueDate: '2024-05-15',
        expiryDate: '2026-05-15',
        status: 'active',
      }
    ]
  }
]

export default function HRManagement() {
  const [brokers, setBrokers] = useState<BrokerAccount[]>(MOCK_BROKERS)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleCreateBroker = (newBroker: BrokerAccount) => {
    setBrokers([...brokers, newBroker])
    setShowCreateForm(false)
  }

  const filteredBrokers = brokers.filter(broker => 
    broker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.licenseNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (showCreateForm) {
    return (
      <CreateBrokerAccount
        onSubmit={handleCreateBroker}
        onCancel={() => setShowCreateForm(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Total Brokers</h3>
          <div className="text-3xl font-bold">{brokers.filter(b => b.role === 'broker').length}</div>
          <p className="text-sm text-muted-foreground">Licensed brokers</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Total Traders</h3>
          <div className="text-3xl font-bold">{brokers.filter(b => b.role === 'trader').length}</div>
          <p className="text-sm text-muted-foreground">Active traders</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Pending Reviews</h3>
          <div className="text-3xl font-bold text-yellow-600">3</div>
          <p className="text-sm text-muted-foreground">Performance reviews</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Compliance Training</h3>
          <div className="text-3xl font-bold text-green-600">95%</div>
          <p className="text-sm text-muted-foreground">Completion rate</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Broker Directory</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brokers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowCreateForm(true)}>Add Broker</Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrokers.map((broker) => (
              <TableRow key={broker.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{broker.name}</div>
                    <div className="text-sm text-muted-foreground">{broker.email}</div>
                  </div>
                </TableCell>
                <TableCell>{broker.role}</TableCell>
                <TableCell>{broker.department}</TableCell>
                <TableCell>{broker.licenseNumber || 'N/A'}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      broker.status === 'active'
                        ? 'default'
                        : broker.status === 'inactive'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {broker.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
