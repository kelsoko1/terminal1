'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/lib/auth/auth-context'
import { Organization, OrganizationType } from '@/lib/auth/types'
import { Plus, Edit, Trash, UserPlus, Building } from 'lucide-react'

// Mock data - Replace with actual API calls in production
const MOCK_ORGANIZATIONS = [
  {
    id: 'ORG001',
    name: 'Kelsoko',
    type: 'kelsoko' as OrganizationType,
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
  {
    id: 'ORG002',
    name: 'Global Bank',
    type: 'bank' as OrganizationType,
    parentId: 'ORG001',
    licenseNumber: 'BNK-2025-001',
    status: 'active',
    createdAt: '2023-02-01',
    updatedAt: '2023-02-01',
  },
  {
    id: 'ORG003',
    name: 'Capital Brokers',
    type: 'broker' as OrganizationType,
    parentId: 'ORG001',
    licenseNumber: 'BRK-2025-001',
    status: 'active',
    createdAt: '2023-03-01',
    updatedAt: '2023-03-01',
  },
  {
    id: 'ORG004',
    name: 'Hedge Fund Partners',
    type: 'fund' as OrganizationType,
    parentId: 'ORG001',
    licenseNumber: 'FND-2025-001',
    status: 'active',
    createdAt: '2023-04-01',
    updatedAt: '2023-04-01',
  },
]

const MOCK_USERS = [
  {
    id: 'USR001',
    name: 'John Smith',
    email: 'john@globalbank.com',
    role: 'admin',
    organizationId: 'ORG002',
    isOrganizationAdmin: true,
  },
  {
    id: 'USR002',
    name: 'Jane Doe',
    email: 'jane@globalbank.com',
    role: 'hr',
    organizationId: 'ORG002',
    isOrganizationAdmin: false,
  },
  {
    id: 'USR003',
    name: 'Bob Johnson',
    email: 'bob@capitalbrokers.com',
    role: 'broker',
    organizationId: 'ORG003',
    isOrganizationAdmin: true,
  },
]

export function OrganizationManagement() {
  const { user, checkAccess, checkOrgAdminAccess } = useAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [activeTab, setActiveTab] = useState('list')

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    type: 'broker' as OrganizationType,
    licenseNumber: '',
    parentId: '',
  })

  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'broker',
    password: '',
    isOrganizationAdmin: false,
  })

  useEffect(() => {
    // In production, fetch from API
    setOrganizations(MOCK_ORGANIZATIONS)
  }, [])

  const handleCreateOrg = () => {
    // In production, call API to create organization
    const newOrg = {
      id: `ORG${Math.floor(Math.random() * 1000)}`,
      name: formData.name,
      type: formData.type,
      licenseNumber: formData.licenseNumber,
      parentId: formData.parentId,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    setOrganizations([...organizations, newOrg])
    setShowCreateForm(false)
    setFormData({
      name: '',
      type: 'broker',
      licenseNumber: '',
      parentId: '',
    })
  }

  const handleCreateUser = () => {
    // In production, call API to create user
    alert(`User ${userFormData.name} would be created for organization ${selectedOrg?.name}`)
    setShowUserForm(false)
    setUserFormData({
      name: '',
      email: '',
      role: 'broker',
      password: '',
      isOrganizationAdmin: false,
    })
  }

  const isKelsokoAdmin = user?.role === 'kelsoko_admin'
  const canCreateOrg = isKelsokoAdmin || checkOrgAdminAccess()
  const canCreateUser = checkAccess('hr') || checkOrgAdminAccess()

  // Filter organizations based on user role and permissions
  const filteredOrganizations = isKelsokoAdmin 
    ? organizations 
    : organizations.filter(org => org.id === user?.organizationId || org.parentId === user?.organizationId)

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl">Organization Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list">Organizations</TabsTrigger>
            {selectedOrg && <TabsTrigger value="details">Organization Details</TabsTrigger>}
            {selectedOrg && <TabsTrigger value="users">Users</TabsTrigger>}
          </TabsList>

          <TabsContent value="list">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Organizations</h3>
              {canCreateOrg && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Organization
                </Button>
              )}
            </div>

            {showCreateForm ? (
              <Card className="p-4 mb-4">
                <h4 className="font-medium mb-4">Create New Organization</h4>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({...formData, type: value as OrganizationType})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {isKelsokoAdmin && <SelectItem value="kelsoko">Kelsoko</SelectItem>}
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="broker">Broker</SelectItem>
                        <SelectItem value="fund">Fund</SelectItem>
                        <SelectItem value="speculator">Speculator</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="license">License Number</Label>
                    <Input 
                      id="license" 
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="parent">Parent Organization</Label>
                    <Select 
                      value={formData.parentId} 
                      onValueChange={(value) => setFormData({...formData, parentId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                    <Button onClick={handleCreateOrg}>Create Organization</Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>{org.name}</TableCell>
                      <TableCell className="capitalize">{org.type}</TableCell>
                      <TableCell>{org.licenseNumber || 'N/A'}</TableCell>
                      <TableCell className="capitalize">{org.status}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedOrg(org)
                              setActiveTab('details')
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isKelsokoAdmin && (
                            <Button variant="ghost" size="sm">
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {selectedOrg && (
            <TabsContent value="details">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedOrg.name} Details</h3>
                <Button variant="outline" onClick={() => setActiveTab('list')}>Back to List</Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium mb-4">Organization Information</h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Name</Label>
                      <p className="font-medium">{selectedOrg.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Type</Label>
                      <p className="font-medium capitalize">{selectedOrg.type}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">License Number</Label>
                      <p className="font-medium">{selectedOrg.licenseNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <p className="font-medium capitalize">{selectedOrg.status}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Created</Label>
                      <p className="font-medium">{new Date(selectedOrg.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-4">Hierarchy Information</h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Parent Organization</Label>
                      <p className="font-medium">
                        {selectedOrg.parentId 
                          ? organizations.find(org => org.id === selectedOrg.parentId)?.name || 'Unknown'
                          : 'None (Top Level)'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Child Organizations</Label>
                      <div className="mt-2">
                        {organizations.filter(org => org.parentId === selectedOrg.id).length > 0 ? (
                          <ul className="list-disc pl-5">
                            {organizations
                              .filter(org => org.parentId === selectedOrg.id)
                              .map(child => (
                                <li key={child.id}>{child.name} ({child.type})</li>
                              ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">No child organizations</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          )}
          
          {selectedOrg && (
            <TabsContent value="users">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedOrg.name} Users</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setActiveTab('list')}>Back to List</Button>
                  {canCreateUser && (
                    <Button onClick={() => setShowUserForm(true)}>
                      <UserPlus className="h-4 w-4 mr-2" /> Add User
                    </Button>
                  )}
                </div>
              </div>
              
              {showUserForm ? (
                <Card className="p-4 mb-4">
                  <h4 className="font-medium mb-4">Create New User for {selectedOrg.name}</h4>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="userName">Full Name</Label>
                      <Input 
                        id="userName" 
                        value={userFormData.name}
                        onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="userEmail">Email</Label>
                      <Input 
                        id="userEmail" 
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="userRole">Role</Label>
                      <Select 
                        value={userFormData.role} 
                        onValueChange={(value) => setUserFormData({...userFormData, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {checkOrgAdminAccess() && <SelectItem value="admin">Admin</SelectItem>}
                          {checkOrgAdminAccess() && <SelectItem value="hr">HR</SelectItem>}
                          <SelectItem value="broker">Broker</SelectItem>
                          <SelectItem value="trader">Trader</SelectItem>
                          <SelectItem value="accounting">Accounting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="userPassword">Password</Label>
                      <Input 
                        id="userPassword" 
                        type="password"
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isAdmin"
                        checked={userFormData.isOrganizationAdmin}
                        onChange={(e) => setUserFormData({...userFormData, isOrganizationAdmin: e.target.checked})}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="isAdmin">Organization Administrator</Label>
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" onClick={() => setShowUserForm(false)}>Cancel</Button>
                      <Button onClick={handleCreateUser}>Create User</Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_USERS
                      .filter(user => user.organizationId === selectedOrg.id)
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell className="capitalize">{user.role}</TableCell>
                          <TableCell>{user.isOrganizationAdmin ? 'Yes' : 'No'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {checkOrgAdminAccess() && (
                                <Button variant="ghost" size="sm">
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
