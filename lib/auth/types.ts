export type UserRole = 'investor' | 'broker' | 'admin' | 'hr' | 'trader' | 'accounting'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  licenseNumber?: string
  permissions?: string[]
  department?: string
  tradingLimit?: number
  supervisor?: string
  hireDate?: string
  status: 'active' | 'inactive' | 'suspended'
  employeeId?: string
  contactNumber?: string
  accountNumber?: string
  joinDate?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface BrokerAccount {
  id: string
  name: string
  email: string
  role: 'broker' | 'trader'
  licenseNumber?: string
  department: string
  tradingLimit: number
  supervisor: string
  hireDate: string
  status: 'active' | 'inactive' | 'suspended'
  permissions: string[]
  lastLogin?: string
  certifications: {
    name: string
    issueDate: string
    expiryDate: string
    status: 'active' | 'expired' | 'pending'
  }[]
}
