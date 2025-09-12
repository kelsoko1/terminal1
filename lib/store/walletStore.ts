import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
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
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchWalletData: () => Promise<void>
  deposit: (amount: number, method: string) => Promise<void>
  withdraw: (amount: number, method: string, accountDetails?: string) => Promise<void>
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void
  initiateUSSDDeposit: (provider: string, phoneNumber: string, amount: number) => Promise<USSDResponse>
  initiateUSSDWithdraw: (provider: string, phoneNumber: string, amount: number) => Promise<USSDResponse>
  initiateAzamPesaDeposit: (phoneNumber: string, amount: number, email?: string) => Promise<AzamPesaResponse>
  checkAzamPesaTransactionStatus: (transactionId: string) => Promise<{success: boolean, status: string, message: string}>
  requestWithdrawal: (userId: string, userName: string, amount: number, paymentMethod: string, accountNumber: string, notes?: string) => Promise<{success: boolean, message: string, withdrawalId?: string}>
  getWithdrawalRequests: () => WithdrawalRequest[]
  cancelWithdrawalRequest: (requestId: string) => Promise<void>
  initiateCardDeposit: (cardDetails: any, amount: number, email: string) => Promise<{success: boolean, message: string, transactionId: string}>
}

function formatPhoneNumberForClickPesa(phone: string): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '255' + digits.slice(1);
  }
  if (digits.startsWith('255') && digits.length === 12) {
    return digits;
  }
  // Optionally, handle other country codes or show error
  return null;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      balance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      transactions: [],
      withdrawalRequests: [],
      lastDepositDate: null,
      lastWithdrawalDate: null,
      isLoading: false,
      error: null,
      
      fetchWalletData: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Fetch wallet data from API
          const response = await axios.get('/api/wallet/transactions');
          
          if (response.status === 200) {
            const { balance, totalDeposits, totalWithdrawals, transactions, withdrawalRequests, lastDepositDate, lastWithdrawalDate } = response.data;
            
            set({
              balance,
              totalDeposits,
              totalWithdrawals,
              transactions: transactions || [],
              withdrawalRequests: withdrawalRequests || [],
              lastDepositDate,
              lastWithdrawalDate,
              isLoading: false
            });
          } else {
            throw new Error('Failed to fetch wallet data');
          }
        } catch (error) {
          console.error('Error fetching wallet data:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      },
      
      deposit: async (amount, method) => {
        try {
          set({ isLoading: true, error: null });
          
          // Send deposit request to API
          const response = await axios.post('/api/wallet/transactions', {
            type: 'deposit',
            amount,
            method,
            reference: `${method.toUpperCase()}-${Math.floor(Math.random() * 1000000)}`
          });
          
          if (response.status === 201) {
            // Refresh wallet data after successful deposit
            await get().fetchWalletData();
          } else {
            throw new Error('Failed to process deposit');
          }
        } catch (error) {
          console.error('Error processing deposit:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      },
      
      withdraw: async (amount, method, accountDetails) => {
        try {
          if (amount > get().balance) {
            throw new Error('Insufficient funds');
          }
          
          set({ isLoading: true, error: null });
          
          // Send withdrawal request to API
          const response = await axios.post('/api/wallet/transactions', {
            type: 'withdrawal',
            amount,
            method,
            accountDetails
          });
          
          if (response.status === 201) {
            // Refresh wallet data after successful withdrawal request
            await get().fetchWalletData();
          } else {
            throw new Error('Failed to process withdrawal');
          }
        } catch (error) {
          console.error('Error processing withdrawal:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      },
      
      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: uuidv4(),
          date: new Date().toISOString(),
        }

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }))
      },
      
      initiateUSSDDeposit: async (provider, phoneNumber, amount) => {
        const formattedPhone = formatPhoneNumberForClickPesa(phoneNumber);
        if (!formattedPhone) {
          return {
            success: false,
            message: 'Invalid phone number. Please enter in format 255XXXXXXXXX',
            transactionId: ''
          };
        }
        try {
          const response = await axios.post('/api/payments/clickpesa/ussd', {
            provider,
            phoneNumber: formattedPhone,
            amount
          });
          if (response.data && response.data.success) {
            return {
              success: true,
              message: response.data.message,
              transactionId: response.data.transactionId
            };
          } else {
            return {
              success: false,
              message: response.data?.message || 'Failed to initiate deposit',
              transactionId: ''
            };
          }
        } catch (error) {
          console.error('ClickPesa USSD deposit error:', error);
          return {
            success: false,
            message: 'Failed to initiate deposit. Please try again.',
            transactionId: ''
          };
        }
      },
      
      initiateUSSDWithdraw: async (provider, phoneNumber, amount) => {
        // In a production environment, this would create a withdrawal request
        // that would be processed by a broker
        
        // Create a withdrawal request
        const result = await get().requestWithdrawal(
          MOCK_USER_ID,
          MOCK_USER_NAME,
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
      
      requestWithdrawal: async (userId, userName, amount, paymentMethod, accountNumber, notes) => {
        const state = get();
        if (state.balance < amount) {
          return {
            success: false,
            message: 'Insufficient funds in your wallet.'
          }
        }

        let payoutType = 'mobile';
        let payoutApi = '/api/payments/clickpesa/payout-mobile';
        let payoutData: any = {
          amount,
          phoneNumber: accountNumber,
          payoutType: 'preview',
        };
        if (paymentMethod === 'bank') {
          payoutType = 'bank';
          payoutApi = '/api/payments/clickpesa/payout-bank';
          payoutData = {
            amount,
            accountNumber,
            bic: notes || '', // Assume BIC is passed in notes for now
            transferType: 'OWN', // Or get from UI
            payoutType: 'preview',
          };
        }

        let formattedPhone = null;
        if (payoutType === 'mobile') {
          formattedPhone = formatPhoneNumberForClickPesa(accountNumber);
          if (!formattedPhone) {
            return { success: false, message: 'Invalid phone number. Please enter in format 255XXXXXXXXX' };
          }
          payoutData.phoneNumber = formattedPhone;
        }

        try {
          // 1. Preview payout
          const previewResp = await axios.post(payoutApi, payoutData);
          if (!previewResp.data.success) {
            return { success: false, message: previewResp.data.message };
          }

          // 2. Create payout
          payoutData.payoutType = 'create';
          if (payoutType === 'mobile') {
            payoutData.phoneNumber = formattedPhone;
          }
          if (payoutType === 'bank') {
            payoutData.accountNumber = accountNumber;
          }
          payoutData.orderReference = previewResp.data.orderReference;
          const createResp = await axios.post(payoutApi, payoutData);
          if (!createResp.data.success) {
            return { success: false, message: createResp.data.message };
          }

          const withdrawalId = createResp.data.data.id || 'W' + Math.floor(1000 + Math.random() * 9000);
          const orderReference = createResp.data.orderReference;

          // Add to local withdrawal requests
          const newRequest: WithdrawalRequest = {
            id: withdrawalId,
            userId: userId,
            userName: userName,
            amount: amount,
            requestDate: new Date().toISOString(),
            status: 'pending',
            paymentMethod: paymentMethod,
            accountNumber: accountNumber,
            walletId: userId, // Use userId as walletId for now
            notes: notes
          };
          set((state) => ({
            withdrawalRequests: [newRequest, ...state.withdrawalRequests]
          }));

          // Deduct from balance and add transaction
          set((state) => ({
            balance: state.balance - amount,
            totalWithdrawals: state.totalWithdrawals + amount,
            lastWithdrawalDate: new Date().toISOString(),
          }));
          get().addTransaction({
            type: 'withdrawal',
            method: paymentMethod,
            amount: amount,
            status: 'pending'
          });

          // 3. Poll payout status
          const pollStatus = async (attempts = 0) => {
            if (attempts > 12) return; // Stop after 1 minute
            let statusApi = payoutType === 'bank' ? '/api/payments/clickpesa/payout-bank-status' : '/api/payments/clickpesa/payout-mobile-status';
            try {
              const statusResp = await axios.get(statusApi, { params: { orderReference } });
              const payoutStatus = statusResp.data?.data?.status || statusResp.data?.data?.order?.status;
              if (payoutStatus === 'AUTHORIZED' || payoutStatus === 'COMPLETED' || payoutStatus === 'SUCCESS') {
                // Update request and transaction status to completed
                set((state) => ({
                  withdrawalRequests: state.withdrawalRequests.map(r => r.id === withdrawalId ? { ...r, status: 'completed' } : r),
                  transactions: state.transactions.map(t => t.type === 'withdrawal' && t.amount === amount && t.status === 'pending' ? { ...t, status: 'completed' } : t)
                }));
                return;
              } else if (payoutStatus === 'FAILED' || payoutStatus === 'REJECTED') {
                // Update request and transaction status to failed, refund
                set((state) => ({
                  withdrawalRequests: state.withdrawalRequests.map(r => r.id === withdrawalId ? { ...r, status: 'failed' } : r),
                  transactions: state.transactions.map(t => t.type === 'withdrawal' && t.amount === amount && t.status === 'pending' ? { ...t, status: 'failed' } : t),
                  balance: state.balance + amount,
                  totalWithdrawals: state.totalWithdrawals - amount
                }));
                get().addTransaction({
                  type: 'deposit',
                  method: 'refund',
                  amount: amount,
                  status: 'completed'
                });
                return;
              } else {
                setTimeout(() => pollStatus(attempts + 1), 5000);
              }
            } catch (err) {
              setTimeout(() => pollStatus(attempts + 1), 5000);
            }
          };
          pollStatus();

          return {
            success: true,
            message: 'Withdrawal request submitted and is being processed.',
            withdrawalId: withdrawalId
          };
        } catch (error) {
          console.error('Error submitting withdrawal request:', error);
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
        if (!request) return;
        if (request.status !== 'pending') return;
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
      },
      
      initiateCardDeposit: async (cardDetails, amount, email) => {
        try {
          const response = await axios.post('/api/payments/clickpesa/card', {
            ...cardDetails,
            amount,
            email
          });
          if (response.data && response.data.success) {
            return {
              success: true,
              message: response.data.message,
              transactionId: response.data.transactionId
            };
          } else {
            return {
              success: false,
              message: response.data?.message || 'Failed to initiate card deposit',
              transactionId: ''
            };
          }
        } catch (error) {
          console.error('ClickPesa card deposit error:', error);
          return {
            success: false,
            message: 'Failed to initiate card deposit. Please try again.',
            transactionId: ''
          };
        }
      }
    }),
    {
      name: 'wallet-storage',
    }
  )
)