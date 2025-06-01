'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth/auth-context'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { formatCurrency, usdToTzs } from '@/lib/utils/currency'

export function InvestorProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    investorBio: '',
    investmentGoals: '',
    riskTolerance: 'moderate',
    joinDate: '',
    tradingExperience: '',
    preferredMarkets: [] as string[],
    preferredAssets: [] as string[],
    portfolioValue: 0,
    performanceYTD: 0
  })

  // Fetch investor profile data when component mounts
  useEffect(() => {
    if (user) {
      // Autofill from user login data
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
        joinDate: user.joinDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }))

      // Fetch additional investor profile data if available
      fetchInvestorProfile()
    }
  }, [user])

  const fetchInvestorProfile = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      // Fetch user account data from our new API endpoint
      const accountResponse = await fetch(`/api/users/account?userId=${user.id}`)
      
      if (accountResponse.ok) {
        const accountData = await accountResponse.json()
        
        // Update basic profile data
        setProfileData(prev => ({
          ...prev,
          name: accountData.user.name || '',
          email: accountData.user.email || '',
          contactNumber: accountData.user.contactNumber || '',
          joinDate: new Date(accountData.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }))
      }
      
      // Fetch additional investor profile data
      const profileResponse = await fetch(`/api/users/portfolio?userId=${user.id}`)
      
      if (profileResponse.ok) {
        const portfolioData = await profileResponse.json()
        
        // Update investment-specific profile data
        setProfileData(prev => ({
          ...prev,
          investorBio: portfolioData.investorBio || '',
          investmentGoals: portfolioData.investmentGoals || '',
          riskTolerance: portfolioData.riskTolerance || 'moderate',
          tradingExperience: portfolioData.tradingExperience || '',
          preferredMarkets: portfolioData.preferredMarkets || [],
          preferredAssets: portfolioData.preferredAssets || [],
          // Store the original value (API returns USD values)
          portfolioValue: portfolioData.totalValue || 0,
          performanceYTD: portfolioData.performanceYTD || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching investor profile:', error)
      toast({
        title: 'Error loading profile',
        description: 'Could not load your profile data. Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/users/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          investorBio: profileData.investorBio,
          investmentGoals: profileData.investmentGoals,
          riskTolerance: profileData.riskTolerance,
          tradingExperience: profileData.tradingExperience,
          preferredMarkets: profileData.preferredMarkets,
          preferredAssets: profileData.preferredAssets
        }),
      })

      if (response.ok) {
        toast({
          title: 'Profile updated',
          description: 'Your investor profile has been updated successfully',
          variant: 'default',
        })
        setIsEditing(false)
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="p-6">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading profile data...</span>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Investor Profile</h2>
            <Button 
              variant={isEditing ? "outline" : "default"} 
              onClick={() => setIsEditing(!isEditing)}
              disabled={isLoading || isSaving}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="investorBio">About You</Label>
                <Textarea
                  id="investorBio"
                  placeholder="Tell us about yourself as an investor"
                  value={profileData.investorBio}
                  onChange={(e) => setProfileData({...profileData, investorBio: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentGoals">Investment Goals</Label>
                <Textarea
                  id="investmentGoals"
                  placeholder="What are your investment goals? (e.g., Retirement, Education, Wealth Building)"
                  value={profileData.investmentGoals}
                  onChange={(e) => setProfileData({...profileData, investmentGoals: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                <select 
                  id="riskTolerance"
                  className="w-full p-2 border rounded"
                  value={profileData.riskTolerance}
                  onChange={(e) => setProfileData({...profileData, riskTolerance: e.target.value})}
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tradingExperience">Trading Experience</Label>
                <select 
                  id="tradingExperience"
                  className="w-full p-2 border rounded"
                  value={profileData.tradingExperience}
                  onChange={(e) => setProfileData({...profileData, tradingExperience: e.target.value})}
                >
                  <option value="beginner">Beginner (&lt; 1 year)</option>
                  <option value="intermediate">Intermediate (1-3 years)</option>
                  <option value="advanced">Advanced (3-7 years)</option>
                  <option value="expert">Expert (7+ years)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredMarkets">Preferred Markets</Label>
                <div className="flex flex-wrap gap-2">
                  {['US', 'Europe', 'Asia', 'Emerging Markets', 'Global'].map(market => (
                    <Badge 
                      key={market}
                      variant={profileData.preferredMarkets.includes(market) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const updated = profileData.preferredMarkets.includes(market)
                          ? profileData.preferredMarkets.filter(m => m !== market)
                          : [...profileData.preferredMarkets, market];
                        setProfileData({...profileData, preferredMarkets: updated});
                      }}
                    >
                      {market}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredAssets">Preferred Assets</Label>
                <div className="flex flex-wrap gap-2">
                  {['Stocks', 'Bonds', 'ETFs', 'Crypto', 'Forex', 'Commodities'].map(asset => (
                    <Badge 
                      key={asset}
                      variant={profileData.preferredAssets.includes(asset) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const updated = profileData.preferredAssets.includes(asset)
                          ? profileData.preferredAssets.filter(a => a !== asset)
                          : [...profileData.preferredAssets, asset];
                        setProfileData({...profileData, preferredAssets: updated});
                      }}
                    >
                      {asset}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2 bg-muted/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Portfolio Summary</h3>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {new Date().toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500">Total Value</h4>
                      <p className="text-2xl font-bold">${profileData.portfolioValue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500">YTD Performance</h4>
                      <p className={`text-2xl font-bold ${profileData.performanceYTD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profileData.performanceYTD >= 0 ? '+' : ''}{profileData.performanceYTD.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 font-medium">{profileData.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{profileData.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                  <p className="mt-1">{profileData.contactNumber || 'Not provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                  <p className="mt-1">{profileData.joinDate}</p>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-sm font-medium text-gray-500">About</h3>
                <p className="mt-1">{profileData.investorBio || 'No information provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Investment Goals</h3>
                <p className="mt-1">{profileData.investmentGoals || 'No goals specified'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Risk Tolerance</h3>
                  <div className="mt-2">
                    <Badge 
                      variant="outline" 
                      className={`
                        ${profileData.riskTolerance === 'conservative' ? 'bg-blue-50 text-blue-700' : 
                          profileData.riskTolerance === 'moderate' ? 'bg-green-50 text-green-700' : 
                          'bg-orange-50 text-orange-700'}
                      `}
                    >
                      {profileData.riskTolerance.charAt(0).toUpperCase() + profileData.riskTolerance.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Trading Experience</h3>
                  <div className="mt-2">
                    <Badge 
                      variant="outline" 
                      className={`
                        ${profileData.tradingExperience === 'beginner' ? 'bg-blue-50 text-blue-700' : 
                          profileData.tradingExperience === 'intermediate' ? 'bg-green-50 text-green-700' : 
                          profileData.tradingExperience === 'advanced' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-purple-50 text-purple-700'}
                      `}
                    >
                      {profileData.tradingExperience ? profileData.tradingExperience.charAt(0).toUpperCase() + profileData.tradingExperience.slice(1) : 'Not specified'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Preferred Markets</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profileData.preferredMarkets && profileData.preferredMarkets.length > 0 ? (
                    profileData.preferredMarkets.map(market => (
                      <Badge key={market} variant="secondary">{market}</Badge>
                    ))
                  ) : (
                    <span className="text-gray-400">No preferred markets specified</span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Preferred Assets</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profileData.preferredAssets && profileData.preferredAssets.length > 0 ? (
                    profileData.preferredAssets.map(asset => (
                      <Badge key={asset} variant="secondary">{asset}</Badge>
                    ))
                  ) : (
                    <span className="text-gray-400">No preferred assets specified</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Portfolio Value</h3>
                  <p className="mt-1 text-lg font-semibold">
                    {formatCurrency(usdToTzs(profileData.portfolioValue))}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Performance YTD</h3>
                  <p className={`mt-1 text-lg font-semibold ${profileData.performanceYTD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profileData.performanceYTD >= 0 ? '+' : ''}{profileData.performanceYTD}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
