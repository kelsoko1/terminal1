'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils/currency'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw } from 'lucide-react'
import { useDSEBrokerStore, DSEBroker } from '@/lib/store/dseBrokerStore'

// DSEBroker interface is now imported from the store

const formSchema = z.object({
  broker: z.string().min(1, 'Please select a broker'),
  csdNumber: z.string().min(1, 'CSD number is required').regex(/^\d+$/, 'Must be a valid CSD number'),
  tradingLimit: z.string().transform(Number).pipe(
    z.number().min(1, 'Trading limit must be greater than 0')
  ),
  accountType: z.enum(['individual', 'corporate', 'institutional'], {
    required_error: 'Please select an account type',
  }),
  tradingPreferences: z.object({
    defaultOrderType: z.enum(['market', 'limit'], {
      required_error: 'Please select a default order type',
    }),
    autoSettlement: z.boolean(),
    marginTrading: z.boolean(),
    allowShortSelling: z.boolean(),
  }),
  riskManagement: z.object({
    stopLossPercentage: z.string().transform(Number).pipe(
      z.number().min(0).max(100, 'Stop loss percentage must be between 0 and 100')
    ),
    maxPositionSize: z.string().transform(Number).pipe(
      z.number().min(0, 'Maximum position size must be greater than 0')
    ),
  }),
  notifications: z.object({
    priceAlerts: z.boolean(),
    dividendAlerts: z.boolean(),
    marketUpdates: z.boolean(),
    tradingAlerts: z.boolean(),
    researchReports: z.boolean(),
    corporateActions: z.boolean(),
  }),
  verificationDocuments: z.object({
    idVerification: z.boolean(),
    proofOfResidence: z.boolean(),
    bankStatements: z.boolean(),
    taxClearance: z.boolean(),
  })
})

type FormValues = z.infer<typeof formSchema>

function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-600'
  if (rating >= 4.0) return 'text-blue-600'
  if (rating >= 3.5) return 'text-yellow-600'
  return 'text-red-600'
}

function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function DSESettings() {
  const { 
    brokers, 
    selectedBrokerId, 
    isLoading, 
    error, 
    fetchBrokers, 
    selectBroker,
    updateBrokerSettings
  } = useDSEBrokerStore()
  
  // Fetch brokers when component mounts
  useEffect(() => {
    fetchBrokers()
  }, [])
  
  // Use the selectedBrokerId from the store
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      broker: '',
      csdNumber: '',
      tradingLimit: 1000000,
      accountType: 'individual',
      tradingPreferences: {
        defaultOrderType: 'limit',
        autoSettlement: true,
        marginTrading: false,
        allowShortSelling: false,
      },
      riskManagement: {
        stopLossPercentage: 10,
        maxPositionSize: 1000000,
      },
      notifications: {
        priceAlerts: true,
        dividendAlerts: true,
        marketUpdates: false,
        tradingAlerts: true,
        researchReports: true,
        corporateActions: true,
      },
      verificationDocuments: {
        idVerification: false,
        proofOfResidence: false,
        bankStatements: false,
        taxClearance: false,
      }
    }
  })

  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true)
      await updateBrokerSettings(data)
      toast({
        title: 'DSE Settings Updated',
        description: 'Your DSE trading settings have been saved successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update DSE settings. Please try again.',
        variant: 'destructive'
      })
      console.error('Error updating DSE settings:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show error if there is one
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription className="flex items-center justify-between">
          <span>Error loading DSE brokers: {error}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchBrokers()}
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">DSE Trading Settings</h2>
          <Button 
            variant="outline" 
            onClick={() => fetchBrokers()} 
            disabled={isLoading}
            type="button"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <Tabs defaultValue="broker" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="broker">Broker Selection</TabsTrigger>
            <TabsTrigger value="account">Account Setup</TabsTrigger>
            <TabsTrigger value="trading">Trading Settings</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="broker">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">DSE Broker Selection</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="broker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select DSE Licensed Broker</FormLabel>
                      {isLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value)
                            selectBroker(value)
                          }}
                          value={field.value || selectedBrokerId || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a broker" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brokers.map((broker) => (
                              <SelectItem key={broker.id} value={broker.id}>
                                {broker.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormDescription>
                        Choose your preferred DSE licensed broker for trading
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(selectedBrokerId || form.getValues('broker')) && (
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Broker Details</h4>
                      {isLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : brokers.map((broker) => 
                        broker.id === (selectedBrokerId || form.getValues('broker')) && (
                          <div key={broker.id} className="space-y-4">
                            <div className="space-y-2">
                              <p><span className="text-muted-foreground">Broker Code:</span> {broker.code}</p>
                              <p><span className="text-muted-foreground">Minimum Deposit:</span> {formatCurrency(broker.minimumDeposit)}</p>
                              <p><span className="text-muted-foreground">Trading Fees:</span> {broker.tradingFees}%</p>
                              <p><span className="text-muted-foreground">Services:</span> {broker.services.join(', ')}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium mb-2">Features</h5>
                                <ul className="space-y-1">
                                  <li className={broker.features.onlineTrading ? 'text-green-600' : 'text-red-600'}>
                                    ● Online Trading Platform
                                  </li>
                                  <li className={broker.features.mobileApp ? 'text-green-600' : 'text-red-600'}>
                                    ● Mobile Trading App
                                  </li>
                                  <li className={broker.features.research ? 'text-green-600' : 'text-red-600'}>
                                    ● Research Services
                                  </li>
                                  <li className={broker.features.marginTrading ? 'text-green-600' : 'text-red-600'}>
                                    ● Margin Trading
                                  </li>
                                  <li className={broker.features.advisoryServices ? 'text-green-600' : 'text-red-600'}>
                                    ● Advisory Services
                                  </li>
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium mb-2">Ratings</h5>
                                <ul className="space-y-1">
                                  <li className={getRatingColor(broker.ratings.execution)}>
                                    Execution: {formatRating(broker.ratings.execution)}
                                    <span className="text-muted-foreground">/5</span>
                                  </li>
                                  <li className={getRatingColor(broker.ratings.research)}>
                                    Research: {formatRating(broker.ratings.research)}
                                    <span className="text-muted-foreground">/5</span>
                                  </li>
                                  <li className={getRatingColor(broker.ratings.platform)}>
                                    Platform: {formatRating(broker.ratings.platform)}
                                    <span className="text-muted-foreground">/5</span>
                                  </li>
                                  <li className={getRatingColor(broker.ratings.support)}>
                                    Support: {formatRating(broker.ratings.support)}
                                    <span className="text-muted-foreground">/5</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Account Setup</h3>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="individual" id="individual" />
                            <Label htmlFor="individual">Individual</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="corporate" id="corporate" />
                            <Label htmlFor="corporate">Corporate</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="institutional" id="institutional" />
                            <Label htmlFor="institutional">Institutional</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="csdNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CSD Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your CSD number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your Central Securities Depository (CSD) account number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tradingLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Trading Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter daily trading limit"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum amount you can trade per day (in TZS)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="trading">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Trading Preferences</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tradingPreferences.defaultOrderType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Order Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="market" id="market" />
                              <Label htmlFor="market">Market Order</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="limit" id="limit" />
                              <Label htmlFor="limit">Limit Order</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tradingPreferences.autoSettlement"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Auto Settlement</FormLabel>
                            <FormDescription>
                              Automatically settle trades on T+3
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tradingPreferences.marginTrading"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Margin Trading</FormLabel>
                            <FormDescription>
                              Enable margin trading facility
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Risk Management</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="riskManagement.stopLossPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Stop Loss (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter stop loss percentage"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Default stop loss percentage for your trades
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="riskManagement.maxPositionSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Position Size</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter maximum position size"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum position size per trade (in TZS)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="notifications.priceAlerts"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Price Alerts</FormLabel>
                          <FormDescription>
                            Receive alerts for significant price movements
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notifications.dividendAlerts"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Dividend Alerts</FormLabel>
                          <FormDescription>
                            Get notified about dividend announcements
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notifications.marketUpdates"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Market Updates</FormLabel>
                          <FormDescription>
                            Daily DSE market summaries
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notifications.tradingAlerts"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Trading Alerts</FormLabel>
                          <FormDescription>
                            Get notified about order executions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notifications.researchReports"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Research Reports</FormLabel>
                          <FormDescription>
                            Receive broker research reports
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notifications.corporateActions"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Corporate Actions</FormLabel>
                          <FormDescription>
                            Get updates on corporate actions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="verification">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Document Verification</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="verificationDocuments.idVerification"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          ID Verification
                        </FormLabel>
                        <FormDescription>
                          National ID, Passport, or Voter's ID
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="verificationDocuments.proofOfResidence"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Proof of Residence
                        </FormLabel>
                        <FormDescription>
                          Utility bill or rental agreement not older than 3 months
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="verificationDocuments.bankStatements"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Bank Statements
                        </FormLabel>
                        <FormDescription>
                          Last 3 months bank statements
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="verificationDocuments.taxClearance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Tax Clearance
                        </FormLabel>
                        <FormDescription>
                          TIN certificate and tax clearance certificate
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save DSE Settings'
                )}
              </Button>
        </div>
      </form>
    </Form>
  )
}