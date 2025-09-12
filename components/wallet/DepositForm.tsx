'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWalletStore } from '@/lib/store/walletStore'
import { AlertCircle } from 'lucide-react'

interface USSDCodes {
  [key: string]: {
    depositCode: string
    checkBalanceCode: string
  }
}

const ussdCodes: USSDCodes = {
  mpesa: {
    depositCode: '*150*00#',
    checkBalanceCode: '*150*00#'
  },
  tigopesa: {
    depositCode: '*150*01#',
    checkBalanceCode: '*150*01#'
  },
  airtelmoney: {
    depositCode: '*150*60#',
    checkBalanceCode: '*150*60#'
  },
  azampesa: {
    depositCode: '*150*88#',
    checkBalanceCode: '*150*88#'
  }
}

export default function DepositForm() {
  const [amount, setAmount] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [provider, setProvider] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [email, setEmail] = useState('')
  const { 
    deposit, 
    addTransaction, 
    initiateUSSDDeposit, 
    initiateAzamPesaDeposit,
    checkAzamPesaTransactionStatus
  } = useWalletStore()
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [azamPesaRedirectUrl, setAzamPesaRedirectUrl] = useState<string | null>(null)

  const handleMobileMoneyDeposit = async () => {
    if (!provider || !mobileNumber || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      if (provider === 'azampesa') {
        // Handle Azam Pesa deposit
        const response = await initiateAzamPesaDeposit(
          mobileNumber,
          parseFloat(amount),
          email || undefined
        )

        if (response.success) {
          setTransactionId(response.transactionId)
          if (response.redirectUrl) {
            setAzamPesaRedirectUrl(response.redirectUrl)
          }
          
          toast({
            title: "Azam Pesa Payment Initiated",
            description: response.message,
          })

          // Start checking for payment confirmation
          startAzamPesaPaymentStatusCheck(response.transactionId)
        } else {
          throw new Error(response.message)
        }
      } else {
        // Handle other mobile money providers
        const response = await initiateUSSDDeposit(
          provider,
          mobileNumber,
          parseFloat(amount)
        )

        if (response.success) {
          setTransactionId(response.transactionId)
          
          toast({
            title: "Payment Initiated",
            description: response.message,
          })

          // Start checking for payment confirmation
          startPaymentStatusCheck(response.transactionId)
        } else {
          throw new Error(response.message)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate deposit",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const startPaymentStatusCheck = async (txnId: string) => {
    let attempts = 0
    const maxAttempts = 10
    const checkInterval = 5000 // 5 seconds

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        toast({
          title: "Payment Timeout",
          description: "Please try again or contact support if amount was deducted",
          variant: "destructive"
        })
        return
      }
      attempts++

      try {
        // In production, this would check your backend API
        // Simulating successful payment after 2 attempts
        if (attempts === 2) {
          const depositAmount = parseFloat(amount)
          
          // Update wallet balance
          deposit(depositAmount, provider)
          
          // Record transaction
          addTransaction({
            type: 'deposit',
            method: provider,
            amount: depositAmount,
            status: 'completed'
          })

          toast({
            title: "Deposit Successful",
            description: `${amount} TZS has been added to your wallet`,
          })

          // Reset form
          setAmount('')
          setMobileNumber('')
          setTransactionId(null)
          return
        }

        // Continue checking
        setTimeout(checkStatus, checkInterval)
      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }

    checkStatus()
  }

  const startAzamPesaPaymentStatusCheck = async (txnId: string) => {
    let attempts = 0
    const maxAttempts = 10
    const checkInterval = 5000 // 5 seconds

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        toast({
          title: "Payment Timeout",
          description: "Please try again or contact support if amount was deducted",
          variant: "destructive"
        })
        return
      }
      attempts++

      try {
        // Check Azam Pesa transaction status
        const statusResponse = await checkAzamPesaTransactionStatus(txnId)
        
        if (statusResponse.success && statusResponse.status === 'completed') {
          const depositAmount = parseFloat(amount)
          
          // Update wallet balance
          deposit(depositAmount, 'azampesa')
          
          // Record transaction
          addTransaction({
            type: 'deposit',
            method: 'azampesa',
            amount: depositAmount,
            status: 'completed'
          })

          toast({
            title: "Deposit Successful",
            description: `${amount} TZS has been added to your wallet`,
          })

          // Reset form
          setAmount('')
          setMobileNumber('')
          setEmail('')
          setTransactionId(null)
          setAzamPesaRedirectUrl(null)
          return
        }

        // Continue checking
        setTimeout(checkStatus, checkInterval)
      } catch (error) {
        console.error('Error checking Azam Pesa payment status:', error)
      }
    }

    checkStatus()
  }

  const handleAzamPesaRedirect = () => {
    if (azamPesaRedirectUrl) {
      window.open(azamPesaRedirectUrl, '_blank')
    }
  }

  return (
    <div className="grid gap-4 sm:gap-6">
      <Card className="p-4 sm:p-6 mobile-card">
        {transactionId && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <h4 className="mobile-heading">Transaction In Progress</h4>
            <p className="mobile-text text-muted-foreground">
              Transaction ID: {transactionId}
            </p>
            <p className="mobile-text text-muted-foreground">
              Please confirm the payment on your phone
            </p>
            {azamPesaRedirectUrl && (
              <Button 
                variant="outline" 
                className="mt-3 w-full sm:w-auto h-12 mobile-button" 
                onClick={handleAzamPesaRedirect}
              >
                Complete Payment on Azam Pesa
              </Button>
            )}
          </div>
        )}

        <Tabs defaultValue="mobile-money" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 sm:h-10">
            <TabsTrigger value="mobile-money" className="text-base sm:text-sm">Mobile Money</TabsTrigger>
            <TabsTrigger value="card" className="text-base sm:text-sm">Credit Card</TabsTrigger>
          </TabsList>

          <TabsContent value="mobile-money" className="space-y-4">
            <div className="space-y-2">
              <Label className="mobile-text">Mobile Money Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="tigopesa">Tigo Pesa</SelectItem>
                  <SelectItem value="airtelmoney">Airtel Money</SelectItem>
                  <SelectItem value="azampesa">Azam Pesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="mobile-text">Mobile Number</Label>
              <Input
                placeholder="Enter mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>

            {provider === 'azampesa' && (
              <div className="space-y-2">
                <Label className="mobile-text">Email (Optional)</Label>
                <Input
                  type="email"
                  placeholder="Enter email for receipt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 sm:h-10 text-base sm:text-sm"
                />
                <p className="text-xs text-muted-foreground mobile-text">
                  Your email will be used to send payment confirmation
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="mobile-text">Amount (TZS)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>

            <Button 
              className="w-full h-12 sm:h-10 mobile-button" 
              onClick={handleMobileMoneyDeposit}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : `Deposit via ${provider ? (provider === 'azampesa' ? 'Azam Pesa' : 'Mobile Money') : 'Mobile Money'}`}
            </Button>
          </TabsContent>

          <TabsContent value="card" className="space-y-4">
            <div className="space-y-2">
              <Label className="mobile-text">Card Number</Label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="mobile-text">Expiry Date</Label>
                <Input
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="h-12 sm:h-10 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="mobile-text">CVV</Label>
                <Input
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="h-12 sm:h-10 text-base sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="mobile-text">Amount (TZS)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>

            <Button className="w-full h-12 sm:h-10 mobile-button" disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Pay with Card"}
            </Button>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}