'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/lib/auth/auth-context'
import { useStore } from '@/lib/store'

export default function InvestorSignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    agreeToTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const { setUser } = useStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, agreeToTerms: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions')
      setIsLoading(false)
      return
    }

    try {
      // 1. Register the user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          contactNumber: formData.contactNumber,
          role: 'investor'
        }),
      })

      const registerData = await registerResponse.json()

      if (!registerResponse.ok) {
        throw new Error(registerData.message || 'Registration failed')
      }

      // 2. Direct login - store token and user data
      if (registerData.token && registerData.user) {
        // Store token in localStorage
        localStorage.setItem('token', registerData.token)
        
        // Store user in local state
        localStorage.setItem('user', JSON.stringify(registerData.user))
        
        // Update global store
        setUser(registerData.user)
      }
      
      // 3. Use auth context login as fallback
      try {
        await login(formData.email, formData.password)
      } catch (loginError) {
        console.log('Context login unnecessary, already handled by direct login')
      }
      
      // Show success message  
      toast({
        title: 'Account created successfully',
        description: 'Welcome to the platform!',
        variant: 'default',
      })
      
      // Force page reload to ensure auth state is updated
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Create an Investor Account</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              name="contactNumber"
              type="tel"
              value={formData.contactNumber}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox 
              id="agreeToTerms" 
              checked={formData.agreeToTerms}
              onCheckedChange={handleCheckboxChange}
              required
            />
            <label
              htmlFor="agreeToTerms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the terms and conditions and privacy policy
            </label>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up as Investor'}
          </Button>
          
          <div className="text-center text-sm mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </div>
        </form>
      </Card>
    </div>
  )
}
