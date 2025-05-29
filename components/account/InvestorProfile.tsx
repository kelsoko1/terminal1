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

export function InvestorProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    investorBio: '',
    investmentGoals: '',
    riskTolerance: 'moderate',
    joinDate: ''
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
        const profileData = await profileResponse.json()
        
        // Update investment-specific profile data
        setProfileData(prev => ({
          ...prev,
          investorBio: profileData.investorBio || '',
          investmentGoals: profileData.investmentGoals || '',
          riskTolerance: profileData.riskTolerance || 'moderate'
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
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/investors/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          investorBio: profileData.investorBio,
          investmentGoals: profileData.investmentGoals,
          riskTolerance: profileData.riskTolerance
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
      toast({
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Investor Profile</h2>
        <Button 
          variant={isEditing ? "outline" : "default"} 
          onClick={() => setIsEditing(!isEditing)}
          disabled={isLoading}
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{profileData.name}</p>
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
        </div>
      )}
    </Card>
  )
}
