export type UserRole = 'investor' | 'broker' | 'admin' | 'hr' | 'trader' | 'accounting' | 'kelsoko_admin'

export type OrganizationType = 'kelsoko' | 'bank' | 'broker' | 'fund' | 'speculator' | 'other'

export interface Organization {
  id: string
  name: string
  type: OrganizationType
  licenseNumber?: string
  address?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  description?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  updatedAt: string
  parentId?: string
  parent?: Organization
  children?: Organization[]
}

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
  organizationId?: string
  organization?: Organization
  position?: string
  isOrganizationAdmin?: boolean
  createdBy?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  organization: Organization | null
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
  organizationId?: string
  organization?: Organization
  isOrganizationAdmin?: boolean
  certifications: {
    name: string
    issueDate: string
    expiryDate: string
    status: 'active' | 'expired' | 'pending'
  }[]
}
