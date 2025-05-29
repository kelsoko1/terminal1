'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { User, UserRole } from '@/lib/auth/types'
import { AlertCircle, CheckCircle, Search, RefreshCw, UserPlus, Shield, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PasswordInput } from '@/components/ui/password-input'

// Define interface for pagination
interface Pagination {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

// Define interface for user list response
interface UserListResponse {
  users: User[];
  pagination: Pagination;
}

export default function UserManagement() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('create')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 1,
    currentPage: 1,
    limit: 10
  })
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  })
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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

  // Fetch users with pagination and filtering
  const fetchUsers = useCallback(async (page = 1, filters = { role: '', status: '', search: '' }) => {
    if (!token) return
    
    setIsLoadingUsers(true)
    setLoadingError(null)
    
    try {
      // Build query string with pagination and filters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (filters.role) queryParams.append('role', filters.role)
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.search) queryParams.append('search', filters.search)
      
      const response = await fetch(`/api/users?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch users')
      }
      
      const data: UserListResponse = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      setLoadingError(error instanceof Error ? error.message : 'An unexpected error occurred')
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }, [token, pagination.limit, toast])
  
  // Handle page change
  const handlePageChange = (page: number) => {
    fetchUsers(page, filters)
  }
  
  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)
    fetchUsers(1, newFilters) // Reset to first page when filters change
  }
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(1, filters)
  }
  
  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchUsers(1, filters)
    }
  }, [token, fetchUsers])

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

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!newUser.name.trim()) {
      errors.name = 'Name is required'
    } else if (newUser.name.length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    
    if (!newUser.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Invalid email format'
    }
    
    if (!newUser.password.trim()) {
      errors.password = 'Password is required'
    } else if (newUser.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    
    if ((newUser.role === 'broker' || newUser.role === 'trader') && !newUser.department) {
      errors.department = 'Department is required for this role'
    }
    
    if ((newUser.role === 'broker' || newUser.role === 'trader') && !newUser.licenseNumber) {
      errors.licenseNumber = 'License number is required for this role'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  // Create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors in the form',
        variant: 'destructive',
      })
      return
    }
    
    setIsLoading(true)
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          setFormErrors({
            ...formErrors,
            email: 'This email is already in use'
          })
          throw new Error('This email is already in use')
        } else if (response.status === 400 && data.details) {
          // Handle validation errors from the server
          const serverErrors: Record<string, string> = {}
          Object.entries(data.details).forEach(([key, value]: [string, any]) => {
            if (value._errors && value._errors.length > 0) {
              serverErrors[key] = value._errors[0]
            }
          })
          setFormErrors(serverErrors)
          throw new Error('Please correct the errors in the form')
        } else {
          throw new Error(data.message || 'Failed to create user')
        }
      }
      
      toast({
        title: 'Success',
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>{`${newUser.name} has been added as a ${newUser.role}`}</span>
          </div>
        ),
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
      setFormErrors({})
      
      // Refresh user list
      fetchUsers(1, filters)
      
      // Switch to manage tab after successful creation
      setActiveTab('manage')
    } catch (error) {
      toast({
        title: 'Error',
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>{error instanceof Error ? error.message : 'Failed to create user'}</span>
          </div>
        ),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setIsSubmitting(false)
    }
  }

  // Check if user has permission to access this page
  if (!user || (user.role !== 'admin' && user.role !== 'hr' && user.role !== 'broker' && user.role !== 'kelsoko_admin')) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>
                You do not have permission to access this page. Please contact an administrator.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </div>
      </div>
      
      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="create" className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            Create User
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Manage Users
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>
                Add a new user to the system with appropriate role and permissions.
              </CardDescription>
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
                      className={formErrors.name ? 'border-red-500' : ''}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
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
                      className={formErrors.email ? 'border-red-500' : ''}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                      id="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      className={formErrors.password ? 'border-red-500' : ''}
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                    )}
                    {!formErrors.password && (
                      <p className="text-gray-500 text-xs mt-1">Password must be at least 8 characters</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={handleRoleChange}
                    >
                      <SelectTrigger id="role" className={formErrors.role ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investor">Investor</SelectItem>
                        <SelectItem value="broker">Broker</SelectItem>
                        <SelectItem value="trader">Trader</SelectItem>
                        {(user.role === 'admin' || user.role === 'kelsoko_admin') && (
                          <>
                            <SelectItem value="hr">HR</SelectItem>
                            <SelectItem value="accounting">Accounting</SelectItem>
                            {user.role === 'kelsoko_admin' && (
                              <SelectItem value="admin">Administrator</SelectItem>
                            )}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {formErrors.role && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      value={newUser.contactNumber}
                      onChange={handleInputChange}
                      className={formErrors.contactNumber ? 'border-red-500' : ''}
                    />
                    {formErrors.contactNumber && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.contactNumber}</p>
                    )}
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
                          className={formErrors.department ? 'border-red-500' : ''}
                        />
                        {formErrors.department && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber">License Number</Label>
                        <Input
                          id="licenseNumber"
                          name="licenseNumber"
                          value={newUser.licenseNumber}
                          onChange={handleInputChange}
                          required={newUser.role === 'broker' || newUser.role === 'trader'}
                          className={formErrors.licenseNumber ? 'border-red-500' : ''}
                        />
                        {formErrors.licenseNumber && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.licenseNumber}</p>
                        )}
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
                
                <Button 
                  type="submit" 
                  className="mt-6 w-full md:w-auto" 
                  disabled={isLoading || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Manage Users</CardTitle>
                  <CardDescription>
                    View, edit, and manage user accounts and permissions.
                  </CardDescription>
                </div>
                
                {/* Search and filter controls */}
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Input
                      placeholder="Search by name or email"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="pr-8"
                    />
                    <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  
                  <Select
                    value={filters.role}
                    onValueChange={(value) => handleFilterChange('role', value)}
                  >
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Roles</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="broker">Broker</SelectItem>
                      <SelectItem value="trader">Trader</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="accounting">Accounting</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button type="submit" variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardHeader>
            
            <CardContent>
              {loadingError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{loadingError}</AlertDescription>
                </Alert>
              )}
              
              {isLoadingUsers ? (
                // Loading skeleton
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
                        users.map((userItem) => (
                          <tr key={userItem.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{userItem.name}</td>
                            <td className="py-3 px-4">{userItem.email}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="capitalize">
                                {userItem.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`${userItem.status === 'active' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : userItem.status === 'inactive' 
                                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                                {userItem.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    setUserToEdit(userItem)
                                    setShowEditDialog(true)
                                  }}
                                >
                                  Edit
                                </Button>
                                {userItem.status === 'active' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-500 border-red-500 hover:bg-red-50"
                                    onClick={() => {
                                      setUserToDeactivate(userItem)
                                      setShowDeactivateDialog(true)
                                    }}
                                  >
                                    Deactivate
                                  </Button>
                                )}
                                {userItem.status !== 'active' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-green-500 border-green-500 hover:bg-green-50"
                                  >
                                    Activate
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center">
                              <AlertTriangle className="h-8 w-8 text-gray-400 mb-2" />
                              <p>No users found</p>
                              {Object.values(filters).some(v => v !== '') && (
                                <Button 
                                  variant="link" 
                                  onClick={() => {
                                    const resetFilters = { role: '', status: '', search: '' }
                                    setFilters(resetFilters)
                                    fetchUsers(1, resetFilters)
                                  }}
                                >
                                  Clear filters
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            
            {/* Pagination */}
            {!isLoadingUsers && users.length > 0 && (
              <CardFooter className="flex justify-between items-center py-4">
                <div className="text-sm text-gray-500">
                  Showing {users.length} of {pagination.total} users
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {pagination.currentPage} of {pagination.pages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Deactivate User Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this user? They will no longer be able to access the system.
            </DialogDescription>
          </DialogHeader>
          
          {userToDeactivate && (
            <div className="py-4">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium">{userToDeactivate.name}</p>
                  <p className="text-sm text-gray-500">{userToDeactivate.email}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                if (!userToDeactivate || !token) return;
                
                try {
                  setIsSubmitting(true);
                  
                  const response = await fetch('/api/users/status', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      userId: userToDeactivate.id,
                      status: 'inactive',
                      reason: 'Deactivated by administrator'
                    }),
                  });
                  
                  const data = await response.json();
                  
                  if (!response.ok) {
                    throw new Error(data.message || 'Failed to deactivate user');
                  }
                  
                  toast({
                    title: 'Success',
                    description: (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>{`${userToDeactivate.name} has been deactivated`}</span>
                      </div>
                    ),
                    variant: 'default',
                  });
                  
                  // Refresh user list
                  fetchUsers(pagination.currentPage, filters);
                } catch (error) {
                  toast({
                    title: 'Error',
                    description: (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span>{error instanceof Error ? error.message : 'Failed to deactivate user'}</span>
                      </div>
                    ),
                    variant: 'destructive',
                  });
                } finally {
                  setIsSubmitting(false);
                  setShowDeactivateDialog(false);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
