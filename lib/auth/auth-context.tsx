'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthState, User, UserRole, OrganizationType } from './types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAccess: (requiredRole: UserRole) => boolean
  checkOrgAccess: (organizationId: string) => boolean
  checkOrgAdminAccess: () => boolean
}

interface MockUser extends Omit<User, 'status'> {
  password: string
  status?: 'active' | 'inactive' | 'suspended'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Common permission sets
const PERMISSIONS = {
  KELSOKO_ADMIN: [
    'all_access',
    'system_config',
    'user_management',
    'organization_management',
    'broker_management',
    'trader_management',
    'financial_reports',
    'client_management',
    'trading',
    'market_analysis',
  ],
  ADMIN: [
    'all_access',
    'system_config',
    'user_management',
    'broker_management',
    'trader_management',
    'financial_reports',
    'client_management',
    'trading',
    'market_analysis',
  ],
  HR: [
    'user_management',
    'broker_management',
    'trader_management',
    'hiring',
    'department_management',
    'performance_review',
  ],
  ACCOUNTING: [
    'financial_reports',
    'broker_accounts',
    'settlements',
    'audit_logs',
    'transaction_history',
  ],
  BROKER: [
    'trading',
    'client_management',
    'reports',
    'market_analysis',
    'portfolio_management',
  ],
  TRADER: [
    'trading',
    'market_analysis',
    'portfolio_view',
    'order_management',
  ],
  INVESTOR: [
    'view_portfolio',
    'place_orders',
    'view_reports',
  ],
}

// Mock organizations data
const MOCK_ORGANIZATIONS = [
  {
    id: 'ORG001',
    name: 'Kelsoko',
    type: 'kelsoko' as OrganizationType,
    status: 'active' as 'active' | 'inactive' | 'suspended',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
  {
    id: 'ORG002',
    name: 'Global Bank',
    type: 'bank' as OrganizationType,
    parentId: 'ORG001',
    licenseNumber: 'BNK-2025-001',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    createdAt: '2023-02-01',
    updatedAt: '2023-02-01',
  },
  {
    id: 'ORG003',
    name: 'Capital Brokers',
    type: 'broker' as OrganizationType,
    parentId: 'ORG001',
    licenseNumber: 'BRK-2025-001',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    createdAt: '2023-03-01',
    updatedAt: '2023-03-01',
  },
  {
    id: 'ORG004',
    name: 'Hedge Fund Partners',
    type: 'fund' as OrganizationType,
    parentId: 'ORG001',
    licenseNumber: 'FND-2025-001',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    createdAt: '2023-04-01',
    updatedAt: '2023-04-01',
  },
]

// Mock user data - Replace with actual API calls in production
const MOCK_USERS: MockUser[] = [
  {
    id: 'KELSOKO001',
    name: 'Elvina Senga',
    email: 'elvinasenga@gmail.com',
    password: 'KelgloKargav1',
    role: 'kelsoko_admin' as UserRole,
    department: 'executive',
    status: 'active',
    permissions: PERMISSIONS.KELSOKO_ADMIN,
    hireDate: '2023-01-01',
    employeeId: 'EMP000',
    contactNumber: '+1-555-0000',
    organizationId: 'ORG001',
    isOrganizationAdmin: true,
  }
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    organization: null,
  })

  useEffect(() => {
    // Check for stored auth token and validate session
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        const organization = user.organizationId 
          ? MOCK_ORGANIZATIONS.find(org => org.id === user.organizationId) || null
          : null
        
        setState({
          user,
          organization,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login - Replace with actual API call
    const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (!mockUser) {
      throw new Error('Invalid credentials')
    }

    // Convert MockUser to User
    const { password: _, ...userWithoutPassword } = mockUser
    const user: User = {
      ...userWithoutPassword,
      status: userWithoutPassword.status || 'active' // Ensure status is set
    }

    // Get organization if applicable
    const organization = user.organizationId 
      ? MOCK_ORGANIZATIONS.find(org => org.id === user.organizationId) || null
      : null

    localStorage.setItem('user', JSON.stringify(user))
    setState({
      user,
      organization,
      isAuthenticated: true,
      isLoading: false,
    })
  }

  const logout = async () => {
    localStorage.removeItem('user')
    setState({
      user: null,
      organization: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  const checkAccess = (requiredRole: UserRole): boolean => {
    if (!state.user) return false

    // Kelsoko admin has access to everything
    if (state.user.role === 'kelsoko_admin') return true

    // Organization admins have access to their organization's roles
    if (state.user.isOrganizationAdmin && requiredRole !== 'kelsoko_admin') return true

    // Check specific role access
    if (requiredRole === 'admin') {
      return state.user.role === 'admin'
    }

    // HR can manage users within their organization
    if (requiredRole === 'hr') {
      return state.user.role === 'hr' || state.user.role === 'admin'
    }

    // Other role checks
    if (requiredRole === state.user.role) return true

    return false
  }

  const checkOrgAccess = (organizationId: string): boolean => {
    if (!state.user) return false
    
    // Kelsoko admin has access to all organizations
    if (state.user.role === 'kelsoko_admin') return true
    
    // Users can only access their own organization
    return state.user.organizationId === organizationId
  }

  const checkOrgAdminAccess = (): boolean => {
    if (!state.user) return false
    return !!state.user.isOrganizationAdmin
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        checkAccess,
        checkOrgAccess,
        checkOrgAdminAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
