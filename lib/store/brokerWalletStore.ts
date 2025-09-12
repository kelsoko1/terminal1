import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

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
  isLoading: boolean
  error: string | null
  fetchBrokerWalletData: () => Promise<void>
  deposit: (amount: number, method: string, reference: string, notes?: string) => Promise<void>
  disburseToUserWallet: (userId: string, userName: string, amount: number, notes?: string) => Promise<void>
  requestWithdrawal: (amount: number, method: string, accountDetails: string) => Promise<void>
  approveWithdrawalRequest: (requestId: string) => Promise<void>
  rejectWithdrawalRequest: (requestId: string) => Promise<void>
}

export const useBrokerWalletStore = create<BrokerWalletStore>()(
  persist(
    (set, get) => ({
      balance: 0,
      totalDeposits: 0,
      totalDisbursements: 0,
      deposits: [],
      disbursements: [],
      withdrawalRequests: [],
      lastDepositDate: null,
      lastDisbursementDate: null,
      isLoading: false,
      error: null,
      
      fetchBrokerWalletData: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Fetch broker wallet data from API
          const response = await axios.get('/api/broker/wallet/transactions');
          
          if (response.status === 200) {
            const { 
              balance, 
              totalDeposits, 
              totalDisbursements, 
              deposits, 
              disbursements, 
              withdrawalRequests,
              lastDepositDate, 
              lastDisbursementDate 
            } = response.data;
            
            set({
              balance,
              totalDeposits,
              totalDisbursements,
              deposits: deposits || [],
              disbursements: disbursements || [],
              withdrawalRequests: withdrawalRequests || [],
              lastDepositDate,
              lastDisbursementDate,
              isLoading: false
            });
          } else {
            throw new Error('Failed to fetch broker wallet data');
          }
        } catch (error) {
          console.error('Error fetching broker wallet data:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      },
      
      deposit: async (amount, method, reference, notes) => {
        try {
          set({ isLoading: true, error: null });
          
          // Send deposit request to API
          const response = await axios.post('/api/broker/wallet/transactions', {
            type: 'DEPOSIT',
            amount,
            method,
            reference,
            notes
          });
          
          if (response.status === 201) {
            // Refresh broker wallet data after successful deposit
            await get().fetchBrokerWalletData();
          } else {
            throw new Error('Failed to process broker deposit');
          }
        } catch (error) {
          console.error('Error processing broker deposit:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      },
      
      disburseToUserWallet: async (userId, userName, amount, notes) => {
        try {
          if (amount > get().balance) {
            throw new Error('Insufficient funds in broker wallet');
          }
          
          set({ isLoading: true, error: null });
          
          // Send disbursement request to API
          const response = await axios.post('/api/broker/wallet/transactions', {
            type: 'DISBURSEMENT',
            amount,
            userId,
            userName,
            notes
          });
          
          if (response.status === 201) {
            // Refresh broker wallet data after successful disbursement
            await get().fetchBrokerWalletData();
          } else {
            throw new Error('Failed to process disbursement');
          }
        } catch (error) {
          console.error('Error processing disbursement:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      },
      
      requestWithdrawal: async (amount, method, accountDetails) => {
        try {
          if (amount > get().balance) {
            throw new Error('Insufficient funds in broker wallet');
          }
          
          set({ isLoading: true, error: null });
          
          // Send withdrawal request to API
          const response = await axios.post('/api/broker/wallet/transactions', {
            type: 'WITHDRAWAL',
            amount,
            method,
            accountDetails
          });
          
          if (response.status === 201) {
            // Refresh broker wallet data after successful withdrawal request
            await get().fetchBrokerWalletData();
          } else {
            throw new Error('Failed to process withdrawal request');
          }
        } catch (error) {
          console.error('Error processing withdrawal request:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      },
      
      approveWithdrawalRequest: async (requestId) => {
        try {
          set({ isLoading: true, error: null });
          
          // Send approve request to API
          const response = await axios.patch('/api/broker/wallet/transactions', {
            requestId,
            action: 'approve'
          });
          
          if (response.status === 200) {
            // Refresh broker wallet data after successful approval
            await get().fetchBrokerWalletData();
          } else {
            throw new Error('Failed to approve withdrawal request');
          }
        } catch (error) {
          console.error('Error approving withdrawal request:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      },
      
      rejectWithdrawalRequest: async (requestId) => {
        try {
          set({ isLoading: true, error: null });
          
          // Send reject request to API
          const response = await axios.patch('/api/broker/wallet/transactions', {
            requestId,
            action: 'reject'
          });
          
          if (response.status === 200) {
            // Refresh broker wallet data after successful rejection
            await get().fetchBrokerWalletData();
          } else {
            throw new Error('Failed to reject withdrawal request');
          }
        } catch (error) {
          console.error('Error rejecting withdrawal request:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      }
    }),
    {
      name: 'broker-wallet-storage',
    }
  )
)
