'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils/currency'
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
  DialogTrigger,
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
import { Search, Plus, FileText, ArrowUpRight, CheckCircle, AlertCircle, Clock, Wallet, Upload, RefreshCw } from 'lucide-react'
import { useBrokerWalletStore } from '@/lib/store/brokerWalletStore'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Form schema for new deposit
const depositFormSchema = z.object({
  amount: z.coerce.number({
    required_error: "Please enter an amount",
    invalid_type_error: "Amount must be a number",
  }).positive("Amount must be positive"),
  method: z.string({
    required_error: "Please select a payment method",
  }),
  reference: z.string({
    required_error: "Please enter a reference number",
  }).min(3, "Reference must be at least 3 characters"),
  notes: z.string().optional(),
})

export function BrokerWalletManagement() {
  const { 
    balance, 
    totalDeposits, 
    totalDisbursements, 
    deposits, 
    disbursements,
    lastDepositDate,
    lastDisbursementDate,
    isLoading,
    error,
    fetchBrokerWalletData,
    deposit
  } = useBrokerWalletStore()
  
  const [showNewDeposit, setShowNewDeposit] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Fetch broker wallet data when component mounts
  useEffect(() => {
    fetchBrokerWalletData()
  }, [])
  
  // Form for new deposit
  const form = useForm<z.infer<typeof depositFormSchema>>({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof depositFormSchema>) {
    try {
      setIsSubmitting(true)
      // Add deposit to broker wallet
      await deposit(values.amount, values.method, values.reference, values.notes)
      setShowNewDeposit(false)
      form.reset()
    } catch (error) {
      console.error('Error submitting deposit:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter deposits based on search query
  const filteredDeposits = deposits.filter(d => 
    d.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.method.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  // Show error if there is one
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription className="flex items-center justify-between">
          <span>Error loading broker wallet data: {error}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchBrokerWalletData()}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Broker Wallet Management</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => fetchBrokerWalletData()} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowNewDeposit(true)}>
            <Upload className="h-4 w-4 mr-2" />
            New Deposit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Available Balance</h3>
          {isLoading ? (
            <Skeleton className="h-8 w-24 my-1" />
          ) : (
            <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
          )}
          <p className="text-sm text-muted-foreground">For disbursements to clients</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Deposits</h3>
          {isLoading ? (
            <Skeleton className="h-8 w-24 my-1" />
          ) : (
            <p className="text-2xl font-bold">{formatCurrency(totalDeposits)}</p>
          )}
          <p className="text-sm text-muted-foreground">Last: {formatDate(lastDepositDate)}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Disbursements</h3>
          {isLoading ? (
            <Skeleton className="h-8 w-24 my-1" />
          ) : (
            <p className="text-2xl font-bold">{formatCurrency(totalDisbursements)}</p>
          )}
          <p className="text-sm text-muted-foreground">Last: {formatDate(lastDisbursementDate)}</p>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search by reference or method..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="deposits">
        <TabsList>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
        </TabsList>
        <TabsContent value="deposits" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(3).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredDeposits.length > 0 ? (
                  filteredDeposits.map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell>{new Date(deposit.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{deposit.reference}</TableCell>
                      <TableCell>{deposit.method}</TableCell>
                      <TableCell>{formatCurrency(deposit.amount)}</TableCell>
                      <TableCell>
                        <Badge className={`${deposit.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {deposit.status === 'completed' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {deposit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No deposits found. {searchQuery ? 'Try a different search term.' : 'Make your first deposit.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="disbursements" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(3).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : disbursements && disbursements.length > 0 ? (
                  disbursements.map((disbursement) => (
                    <TableRow key={disbursement.id}>
                      <TableCell>{new Date(disbursement.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{disbursement.userName}</TableCell>
                      <TableCell>{formatCurrency(disbursement.amount)}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          disbursement.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          disbursement.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                          disbursement.status === 'failed' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {disbursement.status === 'completed' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : disbursement.status === 'processing' ? (
                            <Clock className="h-3 w-3 mr-1" />
                          ) : disbursement.status === 'failed' ? (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {disbursement.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{disbursement.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No disbursements found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Deposit Dialog */}
      <Dialog open={showNewDeposit} onOpenChange={setShowNewDeposit}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Funds to Broker Wallet</DialogTitle>
            <DialogDescription>
              Deposit funds to your broker wallet for disbursement to client wallets.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (TZS)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the amount to deposit in Tanzanian Shillings.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                        <SelectItem value="Tigo Pesa">Tigo Pesa</SelectItem>
                        <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter payment reference" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the transaction reference number from your payment.
                    </FormDescription>
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
                        placeholder="Add any additional information about this deposit"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowNewDeposit(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Submit Deposit'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
