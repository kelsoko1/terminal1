import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export interface SubscriptionPlan {
  id: string
  name: string
  description?: string | null
  price: number
  currency: string
  interval: string
  intervalCount: number
  features: string[]
}

export interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
}

export interface Subscription {
  id: string
  status: string
  startDate: string
  endDate?: string | null
  autoRenew: boolean
  nextPaymentDate?: string | null
  plan: SubscriptionPlan
  paymentHistory: Payment[]
}

interface SubscriptionState {
  subscription: Subscription | null
  availablePlans: SubscriptionPlan[]
  isLoading: boolean
  error: string | null
  requiresSubscription: boolean
  showSubscriptionPrompt: boolean
  
  // Actions
  fetchSubscriptionData: () => Promise<void>
  toggleAutoRenew: (subscriptionId: string) => Promise<void>
  cancelSubscription: (subscriptionId: string) => Promise<void>
  upgradeSubscription: (planId: string, currency?: string) => Promise<void>
  hideSubscriptionPrompt: () => void
  showSubscriptionPromptModal: () => void
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: null,
      availablePlans: [],
      isLoading: false,
      error: null,
      requiresSubscription: false,
      showSubscriptionPrompt: false,

      fetchSubscriptionData: async () => {
        try {
          set({ isLoading: true, error: null })
          const response = await axios.get('/api/subscriptions', {
            withCredentials: true
          })
          
          // Check if user requires subscription
          const requiresSubscription = response.data.requiresSubscription || false
          const showPrompt = requiresSubscription && !get().showSubscriptionPrompt
          
          set({ 
            subscription: response.data.subscription,
            availablePlans: response.data.availablePlans,
            requiresSubscription,
            showSubscriptionPrompt: showPrompt,
            isLoading: false 
          })
          
          return response.data
        } catch (error) {
          console.error('Error fetching subscription data:', error)
          const isAuthError = axios.isAxiosError(error) && error.response?.status === 401
          
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch subscription data', 
            isLoading: false,
            requiresSubscription: isAuthError || get().requiresSubscription,
            showSubscriptionPrompt: isAuthError || get().showSubscriptionPrompt
          })
          
          throw error
        }
      },
      
      hideSubscriptionPrompt: () => {
        set({ showSubscriptionPrompt: false })
      },
      
      showSubscriptionPromptModal: () => {
        set({ showSubscriptionPrompt: true })
      },

      toggleAutoRenew: async (subscriptionId: string) => {
        try {
          set({ isLoading: true, error: null })
          const { subscription } = get()
          
          if (!subscription) {
            throw new Error('No active subscription found')
          }
          
          const response = await axios.patch('/api/subscriptions', {
            subscriptionId,
            action: 'toggleAutoRenew'
          }, {
            withCredentials: true
          })
          
          set({ 
            subscription: {
              ...subscription,
              autoRenew: !subscription.autoRenew
            },
            isLoading: false 
          })
          
          return Promise.resolve()
        } catch (error) {
          console.error('Error toggling auto-renew:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to toggle auto-renew', 
            isLoading: false 
          })
          return Promise.reject(error)
        }
      },

      cancelSubscription: async (subscriptionId: string) => {
        try {
          set({ isLoading: true, error: null })
          const response = await axios.patch('/api/subscriptions', {
            subscriptionId,
            action: 'cancel'
          }, {
            withCredentials: true
          })
          
          // Refresh subscription data after cancellation
          await get().fetchSubscriptionData()
          
          return Promise.resolve()
        } catch (error) {
          console.error('Error cancelling subscription:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to cancel subscription', 
            isLoading: false 
          })
          return Promise.reject(error)
        }
      },

      upgradeSubscription: async (planId: string, currency = 'USD') => {
        try {
          set({ isLoading: true, error: null })
          const response = await axios.post('/api/subscriptions', {
            planId,
            currency
          }, {
            withCredentials: true
          })
          
          // Update local state with new subscription
          set({
            subscription: response.data,
            requiresSubscription: false,
            showSubscriptionPrompt: false,
            isLoading: false
          })
          
          return Promise.resolve(response.data)
        } catch (error) {
          console.error('Error upgrading subscription:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to upgrade subscription', 
            isLoading: false 
          })
          return Promise.reject(error)
        }
      }
    }),
    {
      name: 'subscription-storage',
      partialize: (state) => ({
        // Don't persist anything to local storage for security reasons
        // This is just a placeholder
      }),
    }
  )
)
