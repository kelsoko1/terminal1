import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BrokerDeposit {
  id: string
  amount: number
  method: string
  reference: string
  status: 'completed' | 'pending' | 'failed'
  date: string
}

interface BrokerDisbursement {
  id: string
  userId: string
  userName: string
  amount: number
  status: 'completed' | 'pending' | 'processing' | 'failed'
  date: string
  notes?: string
}

interface WithdrawalRequest {
  id: string
  userId: string
  userName: string
  amount: number
  requestDate: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  paymentMethod: string
  accountNumber: string
  walletId: string
  notes?: string
  processedDate?: string
  processedBy?: string
}

interface BrokerWalletStore {
  balance: number
  totalDeposits: number
  totalDisbursements: number
  deposits: BrokerDeposit[]
  disbursements: BrokerDisbursement[]
  withdrawalRequests: WithdrawalRequest[]
  lastDepositDate: string | null
  lastDisbursementDate: string | null
  
  // Actions
  deposit: (amount: number, method: string, reference: string) => void
  disburseToUserWallet: (userId: string, userName: string, amount: number, notes?: string) => Promise<{ success: boolean; message: string; disbursementId?: string }>
  updateDisbursementStatus: (disbursementId: string, status: 'completed' | 'pending' | 'processing' | 'failed') => void
  getWithdrawalRequests: () => WithdrawalRequest[]
  processWithdrawalRequest: (requestId: string, paymentMethod: string, notes?: string) => Promise<{ success: boolean; message: string; disbursementId?: string }>
  addWithdrawalRequest: (request: Omit<WithdrawalRequest, 'id' | 'status' | 'requestDate'>) => string
}

// Mock withdrawal requests data for initial state
const initialWithdrawalRequests: WithdrawalRequest[] = [
  {
    id: 'W1001',
    userId: 'U1001',
    userName: 'John Makamba',
    amount: 120000,
    requestDate: '2025-04-25T14:30:00Z',
    status: 'pending',
    paymentMethod: 'mpesa',
    accountNumber: '255712345678',
    walletId: 'W1001'
  },
  {
    id: 'W1002',
    userId: 'U1002',
    userName: 'Amina Hussein',
    amount: 500000,
    requestDate: '2025-04-26T09:15:00Z',
    status: 'pending',
    paymentMethod: 'azampesa',
    accountNumber: '255787654321',
    walletId: 'W1002'
  },
  {
    id: 'W1003',
    userId: 'U1003',
    userName: 'Global Investments Ltd',
    amount: 1500000,
    requestDate: '2025-04-26T16:45:00Z',
    status: 'pending',
    paymentMethod: 'bank',
    accountNumber: '12345678901',
    walletId: 'W1003'
  },
  {
    id: 'W1004',
    userId: 'U1005',
    userName: 'Robert Mbeki',
    amount: 75000,
    requestDate: '2025-04-24T11:20:00Z',
    status: 'completed',
    paymentMethod: 'tigopesa',
    accountNumber: '255762345678',
    walletId: 'W1005',
    processedDate: '2025-04-24T14:35:00Z',
    processedBy: 'Broker Admin'
  },
  {
    id: 'W1005',
    userId: 'U1004',
    userName: 'Tanzanite Capital',
    amount: 950000,
    requestDate: '2025-04-23T13:10:00Z',
    status: 'completed',
    paymentMethod: 'bank',
    accountNumber: '98765432109',
    walletId: 'W1004',
    processedDate: '2025-04-23T16:20:00Z',
    processedBy: 'Broker Admin'
  }
]

export const useBrokerWalletStore = create<BrokerWalletStore>()(
  persist(
    (set, get) => ({
      balance: 5000000, // Starting with 5M TZS for demo purposes
      totalDeposits: 5000000,
      totalDisbursements: 0,
      deposits: [
        {
          id: 'DEP1001',
          amount: 5000000,
          method: 'bank',
          reference: 'INIT-DEPOSIT',
          status: 'completed',
          date: new Date('2025-04-20T10:00:00Z').toISOString(),
        }
      ],
      disbursements: [],
      withdrawalRequests: initialWithdrawalRequests,
      lastDepositDate: new Date('2025-04-20T10:00:00Z').toISOString(),
      lastDisbursementDate: null,

      deposit: (amount: number, method: string, reference: string) => {
        const newDeposit: BrokerDeposit = {
          id: crypto.randomUUID(),
          amount,
          method,
          reference,
          status: 'completed',
          date: new Date().toISOString(),
        }

        set((state) => ({
          balance: state.balance + amount,
          totalDeposits: state.totalDeposits + amount,
          lastDepositDate: new Date().toISOString(),
          deposits: [newDeposit, ...state.deposits],
        }))
      },

      disburseToUserWallet: async (userId: string, userName: string, amount: number, notes?: string) => {
        const state = get()
        
        // Check if broker has sufficient funds
        if (state.balance < amount) {
          return {
            success: false,
            message: 'Insufficient funds in broker wallet. Please deposit more funds.'
          }
        }

        // Create disbursement record
        const disbursementId = crypto.randomUUID()
        const newDisbursement: BrokerDisbursement = {
          id: disbursementId,
          userId,
          userName,
          amount,
          status: 'pending',
          date: new Date().toISOString(),
          notes
        }

        // Update broker wallet
        set((state) => ({
          balance: state.balance - amount,
          totalDisbursements: state.totalDisbursements + amount,
          lastDisbursementDate: new Date().toISOString(),
          disbursements: [newDisbursement, ...state.disbursements],
        }))

        // In a real application, this would call an API to update the user's wallet
        // For now, we'll simulate a successful disbursement
        setTimeout(() => {
          get().updateDisbursementStatus(disbursementId, 'completed')
        }, 2000)

        return {
          success: true,
          message: `Successfully disbursed ${amount} TZS to ${userName}'s wallet`,
          disbursementId
        }
      },

      updateDisbursementStatus: (disbursementId: string, status: 'completed' | 'pending' | 'processing' | 'failed') => {
        set((state) => ({
          disbursements: state.disbursements.map(d => 
            d.id === disbursementId ? { ...d, status } : d
          )
        }))
      },
      
      getWithdrawalRequests: () => {
        return get().withdrawalRequests
      },
      
      processWithdrawalRequest: async (requestId: string, paymentMethod: string, notes?: string) => {
        const state = get()
        
        // Find the withdrawal request
        const request = state.withdrawalRequests.find(r => r.id === requestId)
        if (!request) {
          return {
            success: false,
            message: 'Withdrawal request not found'
          }
        }
        
        // Check if request is already processed
        if (request.status !== 'pending') {
          return {
            success: false,
            message: `This request is already ${request.status}`
          }
        }
        
        // Check if broker has sufficient funds
        if (state.balance < request.amount) {
          return {
            success: false,
            message: 'Insufficient funds in broker wallet. Please deposit more funds.'
          }
        }
        
        // Process the withdrawal by creating a disbursement
        const result = await get().disburseToUserWallet(
          request.userId,
          request.userName,
          request.amount,
          `Withdrawal request ${requestId} processed via ${paymentMethod}. ${notes || ''}`
        )
        
        if (result.success) {
          // Update the withdrawal request status
          set((state) => ({
            withdrawalRequests: state.withdrawalRequests.map(r => 
              r.id === requestId 
                ? { 
                    ...r, 
                    status: 'completed', 
                    paymentMethod, 
                    processedDate: new Date().toISOString(),
                    processedBy: 'Broker Admin', // In a real app, this would be the current user
                    notes: notes || r.notes
                  } 
                : r
            )
          }))
          
          return result
        }
        
        return result
      },
      
      addWithdrawalRequest: (request) => {
        const newRequest: WithdrawalRequest = {
          ...request,
          id: 'W' + Math.floor(1000 + Math.random() * 9000), // Simple ID generation
          status: 'pending',
          requestDate: new Date().toISOString()
        }
        
        set((state) => ({
          withdrawalRequests: [newRequest, ...state.withdrawalRequests]
        }))
        
        return newRequest.id
      }
    }),
    {
      name: 'broker-wallet-storage',
    }
  )
)
