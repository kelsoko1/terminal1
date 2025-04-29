'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Search, Plus, FileText, ArrowUpRight, CheckCircle, AlertCircle, Clock, Wallet } from 'lucide-react'
import { useBrokerWalletStore } from '@/lib/store/brokerWalletStore'
import { toast } from '@/components/ui/use-toast'

// Mock data for client wallets
const clientWallets = [
  {
    id: 'C1001',
    userId: 'U1001',
    name: 'John Makamba',
    walletId: 'W1001',
    balance: 250000,
    lastActivity: '2025-04-05',
  },
  {
    id: 'C1002',
    userId: 'U1002',
    name: 'Amina Hussein',
    walletId: 'W1002',
    balance: 1500000,
    lastActivity: '2025-04-01',
  },
  {
    id: 'C1003',
    userId: 'U1003',
    name: 'Global Investments Ltd',
    walletId: 'W1003',
    balance: 4500000,
    lastActivity: '2025-03-28',
  },
  {
    id: 'C1004',
    userId: 'U1004',
    name: 'Tanzanite Capital',
    walletId: 'W1004',
    balance: 2850000,
    lastActivity: '2025-04-02',
  },
  {
    id: 'C1005',
    userId: 'U1005',
    name: 'Robert Mbeki',
    walletId: 'W1005',
    balance: 120000,
    lastActivity: '2025-03-25',
  }
]

// Form schema for new disbursement
const disbursementFormSchema = z.object({
  clientId: z.string({
    required_error: "Please select a client",
  }),
  amount: z.coerce.number({
    required_error: "Please enter an amount",
    invalid_type_error: "Amount must be a number",
  }).positive("Amount must be positive"),
  notes: z.string().optional(),
})

export function DisbursementManagement() {
  const [activeTab, setActiveTab] = useState('disbursements')
  const [showNewDisbursement, setShowNewDisbursement] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [brokerBalance, setBrokerBalance] = useState(0)
  
  const { 
    balance, 
    disbursements, 
    disburseToUserWallet,
  } = useBrokerWalletStore()
  
  useEffect(() => {
    setBrokerBalance(balance)
  }, [balance])
  
  // Form for new disbursement
  const form = useForm<z.infer<typeof disbursementFormSchema>>({
    resolver: zodResolver(disbursementFormSchema),
    defaultValues: {
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof disbursementFormSchema>) {
    // Find the client
    const client = clientWallets.find(c => c.id === values.clientId)
    if (!client) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Client not found",
      })
      return
    }
    
    // Disburse to user wallet
    const result = await disburseToUserWallet(
      client.userId,
      client.name,
      values.amount,
      values.notes
    )
    
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      })
      setShowNewDisbursement(false)
      form.reset()
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      })
    }
  }

  // Filter disbursements based on search query
  const filteredDisbursements = disbursements.filter(d => 
    d.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter client wallets based on search query
  const filteredClients = clientWallets.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.walletId.includes(searchQuery)
  )

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wallet Disbursement Management</h2>
        <div className="flex items-center gap-2">
          <Card className="p-2 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Broker Balance:</span>
            <span className="text-sm font-bold">TZS {brokerBalance.toLocaleString()}</span>
          </Card>
          <Button onClick={() => setShowNewDisbursement(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Disbursement
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search by client, ID, or wallet ID..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
          <TabsTrigger value="client-wallets">Client Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="disbursements" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisbursements.length > 0 ? (
                  filteredDisbursements.map((disbursement) => (
                    <TableRow key={disbursement.id}>
                      <TableCell className="font-medium">{disbursement.id.substring(0, 8)}</TableCell>
                      <TableCell>{disbursement.userName}</TableCell>
                      <TableCell>TZS {disbursement.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(disbursement.date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(disbursement.status)}</TableCell>
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
                      No disbursements found. {searchQuery ? 'Try a different search term.' : ''}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="client-wallets" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Wallet ID</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.walletId}</TableCell>
                    <TableCell>TZS {client.balance.toLocaleString()}</TableCell>
                    <TableCell>{new Date(client.lastActivity).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowNewDisbursement(true)
                          form.setValue('clientId', client.id)
                        }}
                      >
                        Disburse
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Disbursement Dialog */}
      <Dialog open={showNewDisbursement} onOpenChange={setShowNewDisbursement}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>New Wallet Disbursement</DialogTitle>
            <DialogDescription>
              Disburse funds from your broker wallet to a client's wallet.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientWallets.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} (Wallet: {client.walletId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      Enter the amount to disburse in Tanzanian Shillings.
                      Available balance: TZS {brokerBalance.toLocaleString()}
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
                        placeholder="Add any additional information about this disbursement"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowNewDisbursement(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={brokerBalance <= 0}>Submit Disbursement</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
