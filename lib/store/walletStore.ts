import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useBrokerWalletStore } from './brokerWalletStore'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal'
  method: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  date: string
}

interface USSDResponse {
  success: boolean
  message: string
  transactionId: string
}

interface AzamPesaResponse {
  success: boolean
  message: string
  transactionId: string
  redirectUrl?: string
  reference?: string
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
}

interface WalletStore {
  balance: number
  totalDeposits: number
  totalWithdrawals: number
  transactions: Transaction[]
  withdrawalRequests: WithdrawalRequest[]
  lastDepositDate: string | null
  lastWithdrawalDate: string | null
  
  // Actions
  deposit: (amount: number, method: string) => void
  withdraw: (amount: number, method: string) => void
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void
  initiateUSSDDeposit: (provider: string, phoneNumber: string, amount: number) => Promise<USSDResponse>
  initiateUSSDWithdraw: (provider: string, phoneNumber: string, amount: number) => Promise<USSDResponse>
  initiateAzamPesaDeposit: (phoneNumber: string, amount: number, email?: string) => Promise<AzamPesaResponse>
  initiateAzamPesaWithdraw: (phoneNumber: string, amount: number, reference?: string) => Promise<AzamPesaResponse>
  checkAzamPesaTransactionStatus: (transactionId: string) => Promise<{success: boolean, status: string, message: string}>
  requestWithdrawal: (amount: number, paymentMethod: string, accountNumber: string, notes?: string) => Promise<{success: boolean, message: string, withdrawalId?: string}>
  getWithdrawalRequests: () => WithdrawalRequest[]
  cancelWithdrawalRequest: (requestId: string) => Promise<{success: boolean, message: string}>
}

// Mock user data
const MOCK_USER_ID = 'U1001';
const MOCK_USER_NAME = 'John Makamba';
const MOCK_WALLET_ID = 'W1001';

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      balance: 250000,
      totalDeposits: 500000,
      totalWithdrawals: 250000,
      transactions: [
        {
          id: 'TX1001',
          type: 'deposit',
          method: 'mpesa',
          amount: 500000,
          status: 'completed',
          date: new Date('2025-04-15T10:30:00Z').toISOString()
        },
        {
          id: 'TX1002',
          type: 'withdrawal',
          method: 'mpesa',
          amount: 250000,
          status: 'completed',
          date: new Date('2025-04-20T14:15:00Z').toISOString()
        }
      ],
      withdrawalRequests: [],
      lastDepositDate: new Date('2025-04-15T10:30:00Z').toISOString(),
      lastWithdrawalDate: new Date('2025-04-20T14:15:00Z').toISOString(),

      deposit: (amount: number, method: string) => {
        set((state) => ({
          balance: state.balance + amount,
          totalDeposits: state.totalDeposits + amount,
          lastDepositDate: new Date().toISOString(),
        }))
      },

      withdraw: (amount: number, method: string) => {
        set((state) => ({
          balance: state.balance - amount,
          totalWithdrawals: state.totalWithdrawals + amount,
          lastWithdrawalDate: new Date().toISOString(),
        }))
      },

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
        }

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }))
      },

      initiateUSSDDeposit: async (provider, phoneNumber, amount) => {
        // This would connect to your backend API in production
        const ussdCodes = {
          mpesa: {
            code: '*150*00#',
            businessNumber: '123456'
          },
          tigopesa: {
            code: '*150*01#',
            businessNumber: '654321'
          },
          airtelmoney: {
            code: '*150*60#',
            businessNumber: '789012'
          }
        }

        return {
          success: true,
          message: `Please confirm the ${provider} push notification to complete your deposit of ${amount} TZS`,
          transactionId: 'TXN' + Date.now()
        }
      },

      initiateUSSDWithdraw: async (provider, phoneNumber, amount) => {
        // In a production environment, this would create a withdrawal request
        // that would be processed by a broker
        
        // Create a withdrawal request
        const result = await get().requestWithdrawal(
          amount,
          provider,
          phoneNumber
        );
        
        if (result.success) {
          return {
            success: true,
            message: `Withdrawal request of ${amount} TZS has been submitted and will be processed by a broker soon.`,
            transactionId: result.withdrawalId || ('WTH' + Date.now())
          }
        } else {
          return {
            success: false,
            message: result.message,
            transactionId: ''
          }
        }
      },
      
      initiateAzamPesaDeposit: async (phoneNumber, amount, email) => {
        // This would connect to your backend API in production
        // In a real implementation, this would make an API call to Azam Pesa's collection endpoint
        
        try {
          // Simulate API call to Azam Pesa collection endpoint
          // In production, this would be an actual API call with proper authentication
          
          const transactionId = 'AZAM' + Date.now();
          const reference = 'WEB' + Math.floor(Math.random() * 1000000);
          
          // Simulate successful response
          return {
            success: true,
            message: `Please confirm the Azam Pesa payment request sent to ${phoneNumber} for ${amount} TZS`,
            transactionId: transactionId,
            reference: reference,
            redirectUrl: `https://azampesa.co.tz/pay?ref=${reference}&phone=${phoneNumber}&amount=${amount}`
          }
        } catch (error) {
          console.error('Azam Pesa deposit error:', error);
          return {
            success: false,
            message: 'Failed to initiate Azam Pesa deposit. Please try again.',
            transactionId: ''
          }
        }
      },
      
      initiateAzamPesaWithdraw: async (phoneNumber, amount, reference) => {
        // In a production environment, this would create a withdrawal request
        // that would be processed by a broker
        
        // Create a withdrawal request
        const result = await get().requestWithdrawal(
          amount,
          'azampesa',
          phoneNumber,
          reference
        );
        
        if (result.success) {
          return {
            success: true,
            message: `Withdrawal request of ${amount} TZS has been submitted and will be processed by a broker soon.`,
            transactionId: result.withdrawalId || ('AZAM-W' + Date.now()),
            reference: reference || 'WEBW' + Math.floor(Math.random() * 1000000)
          }
        } else {
          return {
            success: false,
            message: result.message,
            transactionId: ''
          }
        }
      },
      
      checkAzamPesaTransactionStatus: async (transactionId: string) => {
        // This would connect to your backend API in production
        // In a real implementation, this would make an API call to check transaction status
        
        try {
          // Simulate API call to check transaction status
          // In production, this would be an actual API call with proper authentication
          
          // For demo purposes, we'll simulate a successful transaction
          return {
            success: true,
            status: 'completed',
            message: 'Transaction completed successfully'
          }
        } catch (error) {
          console.error('Azam Pesa status check error:', error);
          return {
            success: false,
            status: 'failed',
            message: 'Failed to check transaction status'
          }
        }
      },
      
      requestWithdrawal: async (amount, paymentMethod, accountNumber, notes) => {
        const state = get();
        
        // Check if user has sufficient funds
        if (state.balance < amount) {
          return {
            success: false,
            message: 'Insufficient funds in your wallet.'
          }
        }
        
        // Create a new withdrawal request
        const withdrawalId = 'W' + Math.floor(1000 + Math.random() * 9000);
        
        const newRequest: WithdrawalRequest = {
          id: withdrawalId,
          userId: MOCK_USER_ID,
          userName: MOCK_USER_NAME,
          amount: amount,
          requestDate: new Date().toISOString(),
          status: 'pending',
          paymentMethod: paymentMethod,
          accountNumber: accountNumber,
          walletId: MOCK_WALLET_ID,
          notes: notes
        };
        
        // Add to local withdrawal requests
        set((state) => ({
          withdrawalRequests: [newRequest, ...state.withdrawalRequests]
        }));
        
        // Add to broker's withdrawal requests system
        try {
          // In a real app, this would be an API call to the backend
          // For now, we'll directly add it to the broker wallet store
          const addToBrokerSystem = useBrokerWalletStore.getState().addWithdrawalRequest;
          
          addToBrokerSystem({
            userId: MOCK_USER_ID,
            userName: MOCK_USER_NAME,
            amount: amount,
            paymentMethod: paymentMethod,
            accountNumber: accountNumber,
            walletId: MOCK_WALLET_ID,
            notes: notes
          });
          
          // Deduct from balance and add transaction
          set((state) => ({
            balance: state.balance - amount,
            totalWithdrawals: state.totalWithdrawals + amount,
            lastWithdrawalDate: new Date().toISOString(),
          }));
          
          // Add transaction record
          get().addTransaction({
            type: 'withdrawal',
            method: paymentMethod,
            amount: amount,
            status: 'pending'
          });
          
          return {
            success: true,
            message: 'Withdrawal request submitted successfully. A broker will process your request shortly.',
            withdrawalId: withdrawalId
          };
        } catch (error) {
          console.error('Error submitting withdrawal request:', error);
          
          // Remove from local withdrawal requests on error
          set((state) => ({
            withdrawalRequests: state.withdrawalRequests.filter(r => r.id !== withdrawalId)
          }));
          
          return {
            success: false,
            message: 'Failed to submit withdrawal request. Please try again later.'
          };
        }
      },
      
      getWithdrawalRequests: () => {
        return get().withdrawalRequests;
      },
      
      cancelWithdrawalRequest: async (requestId: string) => {
        const state = get();
        const request = state.withdrawalRequests.find(r => r.id === requestId);
        
        if (!request) {
          return {
            success: false,
            message: 'Withdrawal request not found.'
          };
        }
        
        if (request.status !== 'pending') {
          return {
            success: false,
            message: `Cannot cancel a request that is already ${request.status}.`
          };
        }
        
        // Update request status
        set((state) => ({
          withdrawalRequests: state.withdrawalRequests.map(r => 
            r.id === requestId ? { ...r, status: 'failed' } : r
          )
        }));
        
        // Refund the amount to user's balance
        set((state) => ({
          balance: state.balance + request.amount,
          totalWithdrawals: state.totalWithdrawals - request.amount
        }));
        
        // Add transaction record for the refund
        get().addTransaction({
          type: 'deposit',
          method: 'refund',
          amount: request.amount,
          status: 'completed'
        });
        
        return {
          success: true,
          message: 'Withdrawal request cancelled successfully. The amount has been refunded to your wallet.'
        };
      }
    }),
    {
      name: 'wallet-storage',
    }
  )
)