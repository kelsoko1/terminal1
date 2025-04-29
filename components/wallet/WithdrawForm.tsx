'use client'

import { useState, useEffect } from 'react'
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
import { useWalletStore } from '@/lib/store/walletStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, AlertCircle, X } from 'lucide-react'

export default function WithdrawForm() {
  const [amount, setAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [reference, setReference] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('withdraw')
  const { 
    balance, 
    initiateUSSDWithdraw, 
    initiateAzamPesaWithdraw,
    withdrawalRequests,
    cancelWithdrawalRequest
  } = useWalletStore()

  const handleWithdraw = async () => {
    if (!withdrawMethod || !accountNumber || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    const withdrawAmount = parseFloat(amount)
    if (withdrawAmount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit more funds to complete this withdrawal",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      let response;
      
      if (withdrawMethod === 'azampesa') {
        // For Azam Pesa withdrawals
        response = await initiateAzamPesaWithdraw(
          accountNumber,
          withdrawAmount,
          reference || undefined
        )
      } else {
        // For other mobile money withdrawals
        response = await initiateUSSDWithdraw(
          withdrawMethod,
          accountNumber,
          withdrawAmount
        )
      }

      if (!response.success) {
        throw new Error(response.message)
      }
      
      toast({
        title: "Withdrawal Request Submitted",
        description: response.message,
      })
      
      // Reset form
      setAmount('')
      setAccountNumber('')
      setReference('')
      
      // Switch to requests tab
      setActiveTab('requests')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process withdrawal",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleCancelRequest = async (requestId: string) => {
    try {
      const result = await cancelWithdrawalRequest(requestId)
      
      if (result.success) {
        toast({
          title: "Request Cancelled",
          description: result.message,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel withdrawal request",
      })
    }
  }
  
  // Get status badge based on status
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }
  
  // Format payment method
  const formatPaymentMethod = (method: string) => {
    switch(method) {
      case 'mpesa':
        return 'M-Pesa'
      case 'tigopesa':
        return 'Tigo Pesa'
      case 'airtelmoney':
        return 'Airtel Money'
      case 'azampesa':
        return 'Azam Pesa'
      case 'bank':
        return 'Bank Transfer'
      default:
        return method
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="withdraw">New Withdrawal</TabsTrigger>
        <TabsTrigger value="requests">Withdrawal Requests</TabsTrigger>
      </TabsList>
      
      <TabsContent value="withdraw">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Withdraw Method</Label>
              <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select withdraw method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="tigopesa">Tigo Pesa</SelectItem>
                  <SelectItem value="airtelmoney">Airtel Money</SelectItem>
                  <SelectItem value="azampesa">Azam Pesa</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Account Number / Mobile Number</Label>
              <Input
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            
            {withdrawMethod === 'azampesa' && (
              <div className="space-y-2">
                <Label>Reference (Optional)</Label>
                <Input
                  placeholder="Enter reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  A reference to identify this transaction
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Amount (TZS)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Available balance: TZS {balance.toLocaleString()}
              </p>
            </div>

            <Button 
              className="w-full" 
              onClick={handleWithdraw}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : `Request Withdrawal via ${withdrawMethod ? formatPaymentMethod(withdrawMethod) : 'Selected Method'}`}
            </Button>
            
            <p className="text-sm text-muted-foreground mt-2">
              Note: Withdrawal requests are processed by brokers during business hours. 
              You can check the status of your requests in the "Withdrawal Requests" tab.
            </p>
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="requests">
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Withdrawal Requests</h3>
            
            {withdrawalRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You don't have any withdrawal requests yet.
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawalRequests.map((request) => (
                  <Card key={request.id} className="p-4 relative">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Request ID</p>
                        <p className="font-medium">{request.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <div>{getStatusBadge(request.status)}</div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Amount</p>
                        <p className="font-medium">TZS {request.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                        <p className="font-medium">{formatPaymentMethod(request.paymentMethod)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                        <p className="font-medium">{request.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Request Date</p>
                        <p className="font-medium">{new Date(request.requestDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}