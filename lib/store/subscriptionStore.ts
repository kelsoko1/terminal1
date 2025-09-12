import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import { Subscription, SubscriptionPlan, SubscriptionPlanDetails } from '@/types/subscription'

interface SubscriptionState {
  subscription: Subscription | null
  availablePlans: SubscriptionPlanDetails[]
  isLoading: boolean
  error: string | null
  requiresSubscription: boolean
  showSubscriptionPrompt: boolean
  
  // Actions
  fetchSubscriptionData: () => Promise<void>
  toggleAutoRenew: (subscriptionId: string) => Promise<void>
  cancelSubscription: (subscriptionId: string) => Promise<void>
  upgradeSubscription: (planId: string, paymentMethod: string) => Promise<Subscription | null>
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
          const response = await axios.get('/api/subscriptions')
          
          set({ 
            subscription: response.data.currentSubscription || null,
            availablePlans: response.data.plans || [],
            requiresSubscription: !response.data.currentSubscription,
            isLoading: false
          })
          
          // Only show prompt if user needs to subscribe and we're not already showing it
          // But don't show prompt immediately after a successful subscription
          const currentState = get()
          if (!response.data.currentSubscription && !currentState.showSubscriptionPrompt && !currentState.subscription) {
            set({ showSubscriptionPrompt: true })
          }
          
          return response.data
        } catch (error) {
          console.error('Error fetching subscription data:', error)
          const errorMessage = axios.isAxiosError(error) 
            ? error.response?.data?.error || error.message 
            : 'Failed to fetch subscription data'
          
          set({ 
            error: errorMessage,
            isLoading: false
          })
          
          throw new Error(errorMessage)
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
            action: 'update',
            autoRenew: !subscription.autoRenew
          })
          
          set({ 
            subscription: response.data.subscription,
            isLoading: false
            // Don't show subscription prompt for auto-renew toggle
          })
          
          return response.data.subscription
        } catch (error) {
          console.error('Error toggling auto-renew:', error)
          const errorMessage = axios.isAxiosError(error) 
            ? error.response?.data?.error || error.message 
            : 'Failed to update subscription'
          
          set({ 
            error: errorMessage,
            isLoading: false
          })
          
          throw new Error(errorMessage)
        }
      },

      cancelSubscription: async (subscriptionId: string) => {
        try {
          set({ isLoading: true, error: null })
          
          // Use PATCH with cancel action instead of DELETE
          const response = await axios.patch('/api/subscriptions', {
            subscriptionId,
            action: 'cancel'
          })
          
          set({ 
            subscription: response.data.subscription,
            requiresSubscription: true,
            isLoading: false,
            showSubscriptionPrompt: true // Show subscription prompt after cancellation
          })
          
          return response.data.subscription
        } catch (error) {
          console.error('Error cancelling subscription:', error)
          const errorMessage = axios.isAxiosError(error) 
            ? error.response?.data?.error || error.message 
            : 'Failed to cancel subscription'
          
          set({ 
            error: errorMessage,
            isLoading: false
          })
          
          throw new Error(errorMessage)
        }
      },
      
      upgradeSubscription: async (planId: string, paymentMethod: string) => {
        try {
          set({ isLoading: true, error: null })
          const response = await axios.post('/api/subscriptions', {
            planId,
            paymentMethod,
            billingCycle: 'monthly' // Default to monthly, can be made configurable
          })
          
          const updatedSubscription = response.data.subscription
          
          set({
            subscription: updatedSubscription,
            requiresSubscription: false,
            showSubscriptionPrompt: false,
            isLoading: false
          })
          
          return updatedSubscription
        } catch (error) {
          console.error('Error upgrading subscription:', error)
          const errorMessage = axios.isAxiosError(error) 
            ? error.response?.data?.error || error.message 
            : 'Failed to upgrade subscription'
          
          set({ 
            error: errorMessage,
            isLoading: false 
          })
          throw new Error(errorMessage)
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
