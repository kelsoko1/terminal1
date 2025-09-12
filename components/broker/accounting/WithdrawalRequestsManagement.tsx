'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Search, CheckCircle, AlertCircle, Clock, Wallet, ArrowUpRight, Filter, PieChart, BarChart, ArrowDown } from 'lucide-react'
import { useBrokerWalletStore } from '@/lib/store/brokerWalletStore'
import { toast } from '@/components/ui/use-toast'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Form schema for processing withdrawal
const withdrawalProcessFormSchema = z.object({
  paymentMethod: z.string({
    required_error: "Please select a payment method",
  }),
  notes: z.string().optional(),
})

export function WithdrawalRequestsManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [showProcessDialog, setShowProcessDialog] = useState(false)
  const [withdrawalStats, setWithdrawalStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    processing: 0,
    failed: 0,
    totalAmount: 0,
    pendingAmount: 0
  })
  
  const { 
    balance,
    withdrawalRequests,
    processWithdrawalRequest
  } = useBrokerWalletStore()
  
  // Calculate withdrawal statistics
  useEffect(() => {
    const stats = {
      total: withdrawalRequests.length,
      pending: 0,
      completed: 0,
      processing: 0,
      failed: 0,
      totalAmount: 0,
      pendingAmount: 0
    }
    
    withdrawalRequests.forEach(request => {
      stats.totalAmount += request.amount
      
      switch(request.status) {
        case 'pending':
          stats.pending++
          stats.pendingAmount += request.amount
          break
        case 'completed':
          stats.completed++
          break
        case 'processing':
          stats.processing++
          break
        case 'failed':
          stats.failed++
          break
      }
    })
    
    setWithdrawalStats(stats)
  }, [withdrawalRequests])
  
  // Form for processing withdrawal
  const form = useForm<z.infer<typeof withdrawalProcessFormSchema>>({
    resolver: zodResolver(withdrawalProcessFormSchema),
    defaultValues: {
      notes: "",
    },
  })

  // Reset form when selected request changes
  useEffect(() => {
    if (selectedRequest) {
      form.setValue('paymentMethod', selectedRequest.paymentMethod)
    }
  }, [selectedRequest, form])

  // Filter withdrawal requests based on search query and status filter
  const filteredRequests = withdrawalRequests.filter(request => {
    const matchesSearch = 
      request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.accountNumber.includes(searchQuery)
    
    const matchesStatus = statusFilter ? request.status === statusFilter : true
    
    return matchesSearch && matchesStatus
  })

  // Process withdrawal request
  async function processWithdrawal(values: z.infer<typeof withdrawalProcessFormSchema>) {
    if (!selectedRequest) return
    
    try {
      const result = await processWithdrawalRequest(
        selectedRequest.id,
        values.paymentMethod,
        values.notes
      )
      
      if (result.success) {
        toast({
          title: "Withdrawal Processed",
          description: `Successfully processed withdrawal request for ${selectedRequest.userName}`,
        })
        
        setShowProcessDialog(false)
        setSelectedRequest(null)
        form.reset()
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
        description: "Failed to process withdrawal request",
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
        return <Badge className="bg-blue-100 text-blue-800"><ArrowUpRight className="h-3 w-3 mr-1" /> Processing</Badge>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Investor Withdrawal Requests</h2>
        <Card className="p-2 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Broker Balance:</span>
          <span className="text-sm font-bold">TZS {balance.toLocaleString()}</span>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <ArrowDown className="h-5 w-5 text-blue-500" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Requests</h3>
              <p className="text-2xl font-bold">{withdrawalStats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
              <p className="text-2xl font-bold">{withdrawalStats.pending}</p>
              <p className="text-xs text-muted-foreground">TZS {withdrawalStats.pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
              <p className="text-2xl font-bold">{withdrawalStats.completed}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-purple-500" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
              <p className="text-2xl font-bold">TZS {withdrawalStats.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 w-full max-w-sm">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by name, ID, or account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Filter className="h-4 w-4 mr-2" />
              {statusFilter ? `Status: ${statusFilter}` : 'Filter by Status'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('processing')}>
              Processing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('failed')}>
              Failed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Investor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.userName}</TableCell>
                  <TableCell>TZS {request.amount.toLocaleString()}</TableCell>
                  <TableCell>{formatPaymentMethod(request.paymentMethod)}</TableCell>
                  <TableCell>{request.accountNumber}</TableCell>
                  <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    {request.status === 'pending' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowProcessDialog(true)
                        }}
                      >
                        Process
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowProcessDialog(true)
                        }}
                      >
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No withdrawal requests found. {searchQuery || statusFilter ? 'Try different filters.' : ''}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Process Withdrawal Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === 'pending' 
                ? 'Process Withdrawal Request' 
                : 'Withdrawal Request Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.status === 'pending'
                ? 'Review and process this withdrawal request from the investor.'
                : 'View details of this processed withdrawal request.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Investor</p>
                  <p className="font-medium">{selectedRequest.userName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="font-medium">TZS {selectedRequest.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{formatPaymentMethod(selectedRequest.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                  <p className="font-medium">{selectedRequest.accountNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Request Date</p>
                  <p className="font-medium">{new Date(selectedRequest.requestDate).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                
                {selectedRequest.processedDate && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Processed Date</p>
                      <p className="font-medium">{new Date(selectedRequest.processedDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Processed By</p>
                      <p className="font-medium">{selectedRequest.processedBy || 'System'}</p>
                    </div>
                  </>
                )}
                
                {selectedRequest.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                    <p className="font-medium">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>
              
              {selectedRequest.status === 'pending' ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(processWithdrawal)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mpesa">M-Pesa</SelectItem>
                              <SelectItem value="tigopesa">Tigo Pesa</SelectItem>
                              <SelectItem value="airtelmoney">Airtel Money</SelectItem>
                              <SelectItem value="azampesa">Azam Pesa</SelectItem>
                              <SelectItem value="bank">Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add any additional information about this withdrawal"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowProcessDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={balance < (selectedRequest?.amount || 0)}
                      >
                        Process Withdrawal
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              ) : (
                <DialogFooter>
                  <Button onClick={() => setShowProcessDialog(false)}>
                    Close
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
