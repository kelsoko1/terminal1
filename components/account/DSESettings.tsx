'use client'

import { useState } from 'react'
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

interface DSEBroker {
  id: string
  name: string
  code: string
  minimumDeposit: number
  tradingFees: number
  services: string[]
  features: {
    onlineTrading: boolean
    mobileApp: boolean
    research: boolean
    marginTrading: boolean
    advisoryServices: boolean
  }
  ratings: {
    execution: number
    research: number
    platform: number
    support: number
  }
}

const dseBrokers: DSEBroker[] = [
  {
    id: '1',
    name: 'Vertex International Securities',
    code: 'VERTEX',
    minimumDeposit: 100000,
    tradingFees: 1.1,
    services: ['Online Trading', 'Research', 'Advisory', 'Margin Trading'],
    features: {
      onlineTrading: true,
      mobileApp: true,
      research: true,
      marginTrading: true,
      advisoryServices: true
    },
    ratings: {
      execution: 4.5,
      research: 4.2,
      platform: 4.3,
      support: 4.4
    }
  },
  {
    id: '2',
    name: 'Tanzania Securities Limited',
    code: 'TSL',
    minimumDeposit: 50000,
    tradingFees: 1.2,
    services: ['Online Trading', 'Mobile Trading', 'Research', 'IPO Services'],
    features: {
      onlineTrading: true,
      mobileApp: true,
      research: true,
      marginTrading: false,
      advisoryServices: true
    },
    ratings: {
      execution: 4.3,
      research: 4.5,
      platform: 4.1,
      support: 4.6
    }
  },
  {
    id: '3',
    name: 'Core Securities Limited',
    code: 'CORE',
    minimumDeposit: 75000,
    tradingFees: 1.0,
    services: ['Online Trading', 'Advisory', 'Portfolio Management', 'Corporate Trading'],
    features: {
      onlineTrading: true,
      mobileApp: false,
      research: true,
      marginTrading: true,
      advisoryServices: true
    },
    ratings: {
      execution: 4.4,
      research: 4.3,
      platform: 4.2,
      support: 4.3
    }
  },
  {
    id: '4',
    name: 'Orbit Securities Company',
    code: 'ORBIT',
    minimumDeposit: 60000,
    tradingFees: 1.15,
    services: ['Online Trading', 'Research', 'Corporate Trading', 'Fixed Income'],
    features: {
      onlineTrading: true,
      mobileApp: true,
      research: true,
      marginTrading: false,
      advisoryServices: false
    },
    ratings: {
      execution: 4.2,
      research: 4.4,
      platform: 4.3,
      support: 4.2
    }
  }
]

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
  const [selectedBroker, setSelectedBroker] = useState<string>('')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      broker: '',
      csdNumber: '',
      tradingLimit: '1000000',
      accountType: 'individual',
      tradingPreferences: {
        defaultOrderType: 'limit',
        autoSettlement: true,
        marginTrading: false,
        allowShortSelling: false,
      },
      riskManagement: {
        stopLossPercentage: '10',
        maxPositionSize: '1000000',
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

  function onSubmit(data: FormValues) {
    toast({
      title: 'DSE Settings Updated',
      description: 'Your DSE trading settings have been saved successfully.'
    })
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value)
                          setSelectedBroker(value)
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a broker" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dseBrokers.map((broker) => (
                            <SelectItem key={broker.id} value={broker.id}>
                              {broker.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose your preferred DSE licensed broker for trading
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedBroker && (
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Broker Details</h4>
                      {dseBrokers.map((broker) => 
                        broker.id === selectedBroker && (
                          <div key={broker.id} className="space-y-4">
                            <div className="space-y-2">
                              <p><span className="text-muted-foreground">Broker Code:</span> {broker.code}</p>
                              <p><span className="text-muted-foreground">Minimum Deposit:</span> TZS {broker.minimumDeposit.toLocaleString()}</p>
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
          <Button type="submit">Save DSE Settings</Button>
        </div>
      </form>
    </Form>
  )
} 