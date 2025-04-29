'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthState, User, UserRole } from './types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAccess: (requiredRole: UserRole) => boolean
}

interface MockUser extends Omit<User, 'status'> {
  password: string
  status?: 'active' | 'inactive' | 'suspended'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Common permission sets
const PERMISSIONS = {
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
    'all_access',
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

// Mock user data - Replace with actual API calls in production
const MOCK_USERS: MockUser[] = [
  {
    id: 'ADM001',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin' as UserRole,
    department: 'management',
    status: 'active',
    permissions: PERMISSIONS.ADMIN,
    hireDate: '2023-01-01',
    employeeId: 'EMP001',
    contactNumber: '+1-555-0001',
  },
  {
    id: 'HR001',
    name: 'HR Manager',
    email: 'hr@example.com',
    password: 'hr123',
    role: 'hr' as UserRole,
    department: 'human_resources',
    status: 'active',
    permissions: PERMISSIONS.HR,
    hireDate: '2023-02-01',
    employeeId: 'EMP002',
    contactNumber: '+1-555-0002',
  },
  {
    id: 'ACC001',
    name: 'Account Manager',
    email: 'accounting@example.com',
    password: 'accounting123',
    role: 'accounting' as UserRole,
    department: 'finance',
    status: 'active',
    permissions: PERMISSIONS.ACCOUNTING,
    hireDate: '2023-03-01',
    employeeId: 'EMP003',
    contactNumber: '+1-555-0003',
  },
  {
    id: 'BRK001',
    name: 'John Broker',
    email: 'broker@example.com',
    password: 'broker123',
    role: 'broker' as UserRole,
    licenseNumber: 'BRK-2025-001',
    department: 'equities',
    tradingLimit: 1000000,
    supervisor: 'HR Manager',
    hireDate: '2024-01-15',
    status: 'active',
    permissions: PERMISSIONS.BROKER,
    employeeId: 'EMP004',
    contactNumber: '+1-555-0004',
  },
  {
    id: 'TRD001',
    name: 'Tom Trader',
    email: 'trader@example.com',
    password: 'trader123',
    role: 'trader' as UserRole,
    licenseNumber: 'TRD-2025-001',
    department: 'trading',
    tradingLimit: 500000,
    supervisor: 'John Broker',
    hireDate: '2024-02-01',
    status: 'active',
    permissions: PERMISSIONS.TRADER,
    employeeId: 'EMP005',
    contactNumber: '+1-555-0005',
  },
  {
    id: 'INV001',
    name: 'Jane Investor',
    email: 'investor@example.com',
    password: 'investor123',
    role: 'investor' as UserRole,
    status: 'active',
    permissions: PERMISSIONS.INVESTOR,
    accountNumber: 'ACC001',
    joinDate: '2024-03-01',
    contactNumber: '+1-555-0006',
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Check for stored auth token and validate session
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setState({
          user: JSON.parse(storedUser),
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

    localStorage.setItem('user', JSON.stringify(user))
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    })
  }

  const logout = async () => {
    localStorage.removeItem('user')
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  const checkAccess = (requiredRole: UserRole): boolean => {
    if (!state.user) return false
    
    // Updated role hierarchy to give HR admin-like access
    const roleHierarchy: Record<UserRole, UserRole[]> = {
      admin: ['admin', 'hr', 'accounting', 'broker', 'trader', 'investor'],
      hr: ['hr', 'admin', 'accounting', 'broker', 'trader', 'investor'], // HR now has admin-like access
      accounting: ['accounting', 'broker'],
      broker: ['broker', 'trader', 'investor'],
      trader: ['trader', 'investor'],
      investor: ['investor']
    }

    return roleHierarchy[state.user.role]?.includes(requiredRole) || false
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, checkAccess }}>
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
