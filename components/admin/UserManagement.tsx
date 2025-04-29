'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { User, UserRole } from '@/lib/auth/types'

export default function UserManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('create')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'investor' as UserRole,
    department: '',
    contactNumber: '',
    licenseNumber: '',
    permissions: [] as string[],
  })

  // Permission options based on role
  const rolePermissions = {
    broker: [
      'trading',
      'client_management',
      'reports',
      'market_analysis',
      'portfolio_management',
    ],
    trader: [
      'trading',
      'market_analysis',
      'portfolio_view',
      'order_management',
    ],
    investor: [
      'view_portfolio',
      'place_orders',
      'view_reports',
    ],
  }

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }
    
    fetchUsers()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewUser(prev => ({ ...prev, [name]: value }))
  }

  // Handle role change
  const handleRoleChange = (value: string) => {
    setNewUser(prev => ({ 
      ...prev, 
      role: value as UserRole,
      permissions: [] // Reset permissions when role changes
    }))
  }

  // Handle permission toggle
  const handlePermissionToggle = (permission: string) => {
    setNewUser(prev => {
      const permissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
      
      return { ...prev, permissions }
    })
  }

  // Create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user')
      }
      
      toast({
        title: 'User created successfully',
        description: `${newUser.name} has been added as a ${newUser.role}`,
        variant: 'default',
      })
      
      // Reset form
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'investor' as UserRole,
        department: '',
        contactNumber: '',
        licenseNumber: '',
        permissions: [],
      })
      
      // Refresh user list
      const updatedResponse = await fetch('/api/users')
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json()
        setUsers(updatedData)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user has permission to access this page
  if (!user || (user.role !== 'admin' && user.role !== 'hr')) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">
              You do not have permission to access this page. Please contact an administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="create">Create User</TabsTrigger>
          <TabsTrigger value="manage">Manage Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newUser.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={handleRoleChange}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investor">Investor</SelectItem>
                        <SelectItem value="broker">Broker</SelectItem>
                        <SelectItem value="trader">Trader</SelectItem>
                        {user.role === 'admin' && (
                          <>
                            <SelectItem value="hr">HR</SelectItem>
                            <SelectItem value="accounting">Accounting</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      value={newUser.contactNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  {(newUser.role === 'broker' || newUser.role === 'trader') && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          name="department"
                          value={newUser.department}
                          onChange={handleInputChange}
                          required={newUser.role === 'broker' || newUser.role === 'trader'}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber">License Number</Label>
                        <Input
                          id="licenseNumber"
                          name="licenseNumber"
                          value={newUser.licenseNumber}
                          onChange={handleInputChange}
                          required={newUser.role === 'broker' || newUser.role === 'trader'}
                        />
                      </div>
                    </>
                  )}
                </div>
                
                {/* Permissions section */}
                {newUser.role && rolePermissions[newUser.role as keyof typeof rolePermissions] && (
                  <div className="mt-6">
                    <Label className="text-base">Permissions</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {rolePermissions[newUser.role as keyof typeof rolePermissions].map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission-${permission}`}
                            checked={newUser.permissions.includes(permission)}
                            onCheckedChange={() => handlePermissionToggle(permission)}
                          />
                          <label
                            htmlFor={`permission-${permission}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button type="submit" className="mt-6" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4 capitalize">{user.role}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : user.status === 'inactive' 
                                ? 'bg-gray-100 text-gray-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm" className="mr-2">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 border-red-500 hover:bg-red-50">
                              Deactivate
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
