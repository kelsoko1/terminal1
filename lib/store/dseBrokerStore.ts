import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export interface DSEBroker {
  id: string
  name: string
  code: string
  minimumDeposit: number
  tradingFees: number
  services: string[]
  features: {
    onlineTrading: boolean
    mobileApp: boolean
    research: boolean
    marginTrading: boolean
    advisoryServices: boolean
  }
  ratings: {
    execution: number
    research: number
    platform: number
    support: number
  }
}

interface DSEBrokerState {
  brokers: DSEBroker[]
  selectedBrokerId: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchBrokers: () => Promise<void>
  selectBroker: (brokerId: string) => void
  updateBrokerSettings: (settings: any) => Promise<void>
}

export const useDSEBrokerStore = create<DSEBrokerState>()(
  persist(
    (set, get) => ({
      brokers: [],
      selectedBrokerId: null,
      isLoading: false,
      error: null,

      fetchBrokers: async () => {
        try {
          set({ isLoading: true, error: null })
          const response = await axios.get('/api/dse/brokers')
          set({ brokers: response.data, isLoading: false })
        } catch (error) {
          console.error('Error fetching DSE brokers:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch DSE brokers', 
            isLoading: false 
          })
        }
      },

      selectBroker: (brokerId: string) => {
        set({ selectedBrokerId: brokerId })
      },

      updateBrokerSettings: async (settings: any) => {
        try {
          set({ isLoading: true, error: null })
          // This would typically be a POST or PUT request to update user's broker settings
          // For now, we'll just simulate a successful update
          await new Promise(resolve => setTimeout(resolve, 500))
          set({ isLoading: false })
          return Promise.resolve()
        } catch (error) {
          console.error('Error updating broker settings:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update broker settings', 
            isLoading: false 
          })
          return Promise.reject(error)
        }
      }
    }),
    {
      name: 'dse-broker-storage',
      partialize: (state) => ({ 
        selectedBrokerId: state.selectedBrokerId 
      }),
    }
  )
)
