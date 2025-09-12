'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthState, User, UserRole, OrganizationType } from './types'
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth'
import { app } from '../firebase' // Will create this file

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string) => Promise<void>
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
    // Check for mock user session in localStorage first
    const mockUserSession = localStorage.getItem('mockUserSession')
    if (mockUserSession) {
      const parsed = JSON.parse(mockUserSession)
      setState({
        user: parsed.user,
        organization: parsed.organization,
        isAuthenticated: true,
        isLoading: false,
      })
      return
    }
    // Fallback to Firebase auth
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // You may want to fetch additional user info from Firestore here
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || '',
          role: 'investor', // Default or fetch from Firestore
          status: 'active', // Add required status property
        }
        setState({
          user,
          organization: null,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        setState({
          user: null,
          organization: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    })
    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    // First check if this is a superadmin user
    const mockUser = MOCK_USERS.find(user => user.email === email);
    
    if (mockUser && mockUser.password === password) {
      // Superadmin authentication - bypass Firebase
      const user: User = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        permissions: mockUser.permissions,
        department: mockUser.department,
        status: mockUser.status || 'active',
        hireDate: mockUser.hireDate,
        employeeId: mockUser.employeeId,
        contactNumber: mockUser.contactNumber,
        organizationId: mockUser.organizationId,
        isOrganizationAdmin: mockUser.isOrganizationAdmin,
      };
      const organization = MOCK_ORGANIZATIONS.find(org => org.id === mockUser.organizationId) || null;
      setState({
        user,
        organization,
        isAuthenticated: true,
        isLoading: false,
      });
      // Persist mock user session
      localStorage.setItem('mockUserSession', JSON.stringify({ user, organization }))
      return;
    }
    // Fall back to Firebase authentication for regular users
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // If Firebase fails, check if it's a superadmin with wrong password
      if (mockUser) {
        throw new Error('Invalid password for superadmin account');
      }
      throw error;
    }
  }

  const register = async (email: string, password: string) => {
    const auth = getAuth(app)
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    // Clear mock user session if present
    localStorage.removeItem('mockUserSession')
    const auth = getAuth(app)
    await signOut(auth)
  }

  // These can be expanded to use Firestore for roles/orgs
  const checkAccess = (requiredRole: UserRole): boolean => {
    if (!state.user) return false
    // Allow if user has the required role or is a super admin
    return state.user.role === requiredRole || state.user.role === 'kelsoko_admin'
  }

  const checkOrgAccess = (organizationId: string): boolean => {
    return true // Implement as needed
  }

  const checkOrgAdminAccess = (): boolean => {
    return false // Implement as needed
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
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
