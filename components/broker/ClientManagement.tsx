'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageSquare, Eye, Edit, Ban, CheckCircle } from 'lucide-react'
import { ClientDetailDialog } from './ClientDetailDialog'
import { ClientMessageDialog } from './ClientMessageDialog'

interface Client {
  id: string
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone: string
  accountType: 'individual' | 'corporate' | 'institutional'
  status: 'active' | 'pending' | 'suspended'
  csd: string // Central Securities Depository number
  joinDate: string
  kycStatus: 'verified' | 'pending' | 'rejected'
  accountNumber?: string
  taxId?: string
  address?: string
  city?: string
  country?: string
  occupation?: string
  employer?: string
  investmentProfile?: {
    riskTolerance: 'low' | 'medium' | 'high'
    investmentGoals: string[]
    investmentExperience: 'beginner' | 'intermediate' | 'advanced'
  }
}

const mockClients: Client[] = [
  {
    id: '1',
    firstName: 'John',
    middleName: 'Kwame',
    lastName: 'Makamba',
    email: 'john.makamba@example.co.tz',
    phone: '+255 755 123 456',
    accountType: 'individual',
    status: 'active',
    csd: 'DSE1234567',
    joinDate: '2024-03-15',
    kycStatus: 'verified',
    accountNumber: 'ACC10023456',
    taxId: 'TIN87654321',
    address: '15 Uhuru Street',
    city: 'Dar es Salaam',
    country: 'Tanzania',
    occupation: 'Business Owner',
    investmentProfile: {
      riskTolerance: 'medium',
      investmentGoals: ['Growth', 'Retirement', 'Income'],
      investmentExperience: 'intermediate'
    }
  },
  {
    id: '2',
    firstName: 'Tanzania',
    lastName: 'Breweries Limited',
    email: 'investments@tbl.co.tz',
    phone: '+255 767 234 567',
    accountType: 'corporate',
    status: 'active',
    csd: 'DSE7654321',
    joinDate: '2024-03-14',
    kycStatus: 'verified',
    accountNumber: 'CORP78901234',
    taxId: 'TIN12345678',
    address: '78 Nyerere Road',
    city: 'Dar es Salaam',
    country: 'Tanzania'
  },
  {
    id: '3',
    firstName: 'NSSF',
    lastName: 'Investment Fund',
    email: 'investments@nssf.go.tz',
    phone: '+255 778 345 678',
    accountType: 'institutional',
    status: 'active',
    csd: 'DSE9876543',
    joinDate: '2024-03-13',
    kycStatus: 'verified',
    accountNumber: 'INST45678901',
    taxId: 'TIN56789012',
    address: '45 Samora Avenue',
    city: 'Dar es Salaam',
    country: 'Tanzania'
  },
  {
    id: '4',
    firstName: 'Grace',
    middleName: 'Neema',
    lastName: 'Mwakio',
    email: 'grace.mwakio@example.co.tz',
    phone: '+255 789 456 789',
    accountType: 'individual',
    status: 'pending',
    csd: 'DSE2468135',
    joinDate: '2024-03-15',
    kycStatus: 'pending',
    accountNumber: 'ACC20034567',
    address: '32 Kariakoo Street',
    city: 'Dar es Salaam',
    country: 'Tanzania',
    occupation: 'Software Engineer'
  },
  {
    id: '5',
    firstName: 'Vodacom',
    lastName: 'Tanzania PLC',
    email: 'corporate@vodacom.co.tz',
    phone: '+255 799 567 890',
    accountType: 'corporate',
    status: 'active',
    csd: 'DSE1357924',
    joinDate: '2024-03-12',
    kycStatus: 'verified',
    accountNumber: 'CORP56789012',
    taxId: 'TIN34567890',
    address: '12 Bagamoyo Road',
    city: 'Dar es Salaam',
    country: 'Tanzania'
  }
]

export default function ClientManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAccountType, setFilterAccountType] = useState('all')
  const [filterKycStatus, setFilterKycStatus] = useState('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  
  // Format full name with all three name parts
  const getFullName = (client: Client) => {
    return `${client.firstName} ${client.middleName ? client.middleName + ' ' : ''}${client.lastName}`
  }
  
  // Filter clients based on search term and filters
  const filteredClients = mockClients.filter(client => {
    const matchesSearch = 
      getFullName(client).toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.csd.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAccountType = 
      filterAccountType === 'all' || client.accountType === filterAccountType
    
    const matchesKycStatus = 
      filterKycStatus === 'all' || client.kycStatus === filterKycStatus
    
    return matchesSearch && matchesAccountType && matchesKycStatus
  })
  
  // Handle view client details
  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setShowDetailDialog(true)
  }
  
  // Handle direct message to client
  const handleMessageClient = (client: Client) => {
    setSelectedClient(client)
    setShowMessageDialog(true)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">DSE Client Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Client</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New DSE Client</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">First Name</Label>
                <Input id="firstName" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="middleName" className="text-right">Middle Name</Label>
                <Input id="middleName" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-right">Last Name</Label>
                <Input id="lastName" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" type="tel" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="accountType" className="text-right">Account Type</Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="institutional">Institutional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="csd" className="text-right">CSD Number</Label>
                <Input id="csd" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Client</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search clients..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select
          value={filterAccountType}
          onValueChange={setFilterAccountType}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Account Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="institutional">Institutional</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterKycStatus}
          onValueChange={setFilterKycStatus}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="KYC Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Account Type</TableHead>
            <TableHead>CSD Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>KYC Status</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{getFullName(client)}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">{client.email}</div>
                  <div className="text-sm text-muted-foreground">{client.phone}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {client.accountType.charAt(0).toUpperCase() + client.accountType.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{client.csd}</TableCell>
              <TableCell>
                <Badge 
                  variant={
                    client.status === 'active' ? 'default' :
                    client.status === 'pending' ? 'secondary' : 'destructive'
                  }
                >
                  {client.status.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={
                    client.kycStatus === 'verified' ? 'default' :
                    client.kycStatus === 'pending' ? 'secondary' : 'destructive'
                  }
                >
                  {client.kycStatus.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>{client.joinDate}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewClient(client)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleMessageClient(client)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                  
                  {client.status === 'active' ? (
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Ban className="h-4 w-4 mr-1" />
                      Suspend
                    </Button>
                  ) : client.status === 'suspended' ? (
                    <Button variant="outline" size="sm" className="text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Activate
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Client Detail Dialog */}
      {selectedClient && showDetailDialog && (
        <ClientDetailDialog
          isOpen={showDetailDialog}
          onClose={() => setShowDetailDialog(false)}
          client={selectedClient}
        />
      )}
      
      {/* Client Message Dialog */}
      {selectedClient && showMessageDialog && (
        <ClientMessageDialog
          isOpen={showMessageDialog}
          onClose={() => setShowMessageDialog(false)}
          client={selectedClient}
        />
      )}
    </div>
  )
}