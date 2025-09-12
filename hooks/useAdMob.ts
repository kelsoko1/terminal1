import { useState, useEffect, useCallback } from 'react'
import { adMobService, ADMOB_CONFIG, AdMobAd, AdMobAnalytics, AdMobSettings } from '@/lib/services/adMobService'

export function useAdMob() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ads, setAds] = useState<AdMobAd[]>([])
  const [analytics, setAnalytics] = useState<AdMobAnalytics | null>(null)
  const [settings, setSettings] = useState<AdMobSettings | null>(null)

  // Initialize AdMob
  const initialize = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const success = await adMobService.initializeAdMob()
      setIsInitialized(success)
      
      if (success) {
        // Load initial data
        await Promise.all([
          loadAds(),
          loadAnalytics(),
          loadSettings()
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize AdMob')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load ads
  const loadAds = useCallback(async () => {
    try {
      const adCampaigns = await adMobService.getAdCampaigns()
      setAds(adCampaigns)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ads')
    }
  }, [])

  // Load analytics
  const loadAnalytics = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      const analyticsData = await adMobService.getAnalytics(startDate, endDate)
      setAnalytics(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    }
  }, [])

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      const settingsData = await adMobService.getSettings()
      setSettings(settingsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    }
  }, [])

  // Create ad campaign
  const createAd = useCallback(async (adData: Omit<AdMobAd, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const newAd = await adMobService.createAdCampaign(adData)
      setAds(prev => [...prev, newAd])
      return newAd
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ad campaign')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update ad campaign
  const updateAd = useCallback(async (id: string, updates: Partial<AdMobAd>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await adMobService.updateAdCampaign(id, updates)
      setAds(prev => prev.map(ad => ad.id === id ? { ...ad, ...updates } : ad))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ad campaign')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Delete ad campaign
  const deleteAd = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await adMobService.deleteAdCampaign(id)
      setAds(prev => prev.filter(ad => ad.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ad campaign')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<AdMobSettings>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await adMobService.updateSettings(newSettings)
      setSettings(prev => prev ? { ...prev, ...newSettings } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load banner ad
  const loadBannerAd = useCallback(async () => {
    try {
      await adMobService.loadBannerAd()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load banner ad')
    }
  }, [])

  // Load interstitial ad
  const loadInterstitialAd = useCallback(async () => {
    try {
      await adMobService.loadInterstitialAd()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interstitial ad')
    }
  }, [])

  // Load rewarded ad
  const loadRewardedAd = useCallback(async () => {
    try {
      await adMobService.loadRewardedAd()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rewarded ad')
    }
  }, [])

  // Track impression
  const trackImpression = useCallback(async (adId: string) => {
    try {
      await adMobService.trackImpression(adId)
      // Refresh analytics after tracking
      await loadAnalytics()
    } catch (err) {
      console.error('Failed to track impression:', err)
    }
  }, [loadAnalytics])

  // Track click
  const trackClick = useCallback(async (adId: string) => {
    try {
      await adMobService.trackClick(adId)
      // Refresh analytics after tracking
      await loadAnalytics()
    } catch (err) {
      console.error('Failed to track click:', err)
    }
  }, [loadAnalytics])

  // Initialize on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  return {
    // State
    isInitialized,
    isLoading,
    error,
    ads,
    analytics,
    settings,
    config: ADMOB_CONFIG,
    
    // Actions
    initialize,
    loadAds,
    loadAnalytics,
    loadSettings,
    createAd,
    updateAd,
    deleteAd,
    updateSettings,
    loadBannerAd,
    loadInterstitialAd,
    loadRewardedAd,
    trackImpression,
    trackClick,
    
    // Utilities
    clearError: () => setError(null)
  }
} 