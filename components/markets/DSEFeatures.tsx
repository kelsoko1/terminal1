import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Building2, 
  LineChart, 
  Landmark,
  BookOpen,
  GanttChartSquare,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Shield,
  Clock,
  Users,
  Building,
  Briefcase,
  Scale
} from 'lucide-react'

interface MarketMetric {
  label: string
  value: string
  change?: number
  info?: string
}

const dseMetrics: MarketMetric[] = [
  { label: 'All Share Index (DSEI)', value: '1,850.21', change: 0.8 },
  { label: 'Tanzania Share Index (TSI)', value: '3,524.12', change: 1.2 },
  { label: 'Market Capitalization', value: 'TZS 15.8T', change: 2.4 },
  { label: 'Daily Trading Volume', value: 'TZS 1.2B', change: -1.1 },
  { label: 'Listed Companies (MIM)', value: '28' },
  { label: 'Listed Companies (EGM)', value: '5' }
]

const botMetrics: MarketMetric[] = [
  { label: 'Policy Rate', value: '5.0%', info: 'Last updated: March 2024' },
  { label: 'Inflation Rate', value: '4.2%', change: -0.3 },
  { label: 'Exchange Rate (USD/TZS)', value: '2,485', change: 0.2 },
  { label: 'Foreign Reserves', value: 'USD 5.2B', change: 1.1 },
  { label: 'T-Bill Rate (364 days)', value: '11.44%', change: 0.05 },
  { label: 'GDP Growth Rate', value: '5.2%', change: 0.3 }
]

const marketFeatures = [
  {
    title: 'Market Segments',
    icon: LineChart,
    description: 'Main Investment Market (MIM), Enterprise Growth Market (EGM), and Fixed Income Market.'
  },
  {
    title: 'Automated Trading System (ATS)',
    icon: GanttChartSquare,
    description: 'Modern electronic trading platform with real-time execution and DMA capabilities.'
  },
  {
    title: 'Central Securities Depository',
    icon: Building2,
    description: 'Electronic securities custody through CSDR with T+3 settlement cycle.'
  },
  {
    title: 'Regulatory Framework',
    icon: Shield,
    description: 'Regulated by CMSA under the Capital Markets and Securities Act.'
  },
  {
    title: 'International Standards',
    icon: Globe,
    description: 'Compliant with international best practices and member of ASEA and COSSE.'
  },
  {
    title: 'Investor Education',
    icon: BookOpen,
    description: 'Comprehensive investor education programs and DSE Scholar Investment Challenge.'
  },
  {
    title: 'Trading Hours',
    icon: Clock,
    description: 'Pre-opening (09:30-10:00), Main Trading (10:00-15:30), Post-closing (15:30-15:45) EAT.'
  },
  {
    title: 'Market Participants',
    icon: Users,
    description: 'Licensed brokers, dealers, nominated advisors, and market makers.'
  },
  {
    title: 'REITs Framework',
    icon: Building,
    description: 'Regulatory framework in place for Real Estate Investment Trusts (REITs).'
  },
  {
    title: 'Cross-Border Trading',
    icon: Globe,
    description: 'Cross-listing framework with EAC exchanges and international markets.'
  },
  {
    title: 'Market Making',
    icon: Scale,
    description: 'Liquidity provision through designated market makers and specialists.'
  }
]

export function DSEFeatures() {
  return (
    <Card className="p-6">
      <Tabs defaultValue="metrics">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="metrics">Market Indices</TabsTrigger>
          <TabsTrigger value="bot">Economic Indicators</TabsTrigger>
          <TabsTrigger value="features">DSE Features</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dseMetrics.map((metric, index) => (
              <Card key={index} className="p-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    {metric.change !== undefined && (
                      <span className={`flex items-center text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change >= 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {Math.abs(metric.change)}%
                      </span>
                    )}
                  </div>
                  {metric.info && (
                    <span className="text-xs text-muted-foreground mt-1">{metric.info}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bot">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {botMetrics.map((metric, index) => (
              <Card key={index} className="p-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    {metric.change !== undefined && (
                      <span className={`flex items-center text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change >= 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {Math.abs(metric.change)}%
                      </span>
                    )}
                  </div>
                  {metric.info && (
                    <span className="text-xs text-muted-foreground mt-1">{metric.info}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open('https://www.bot.go.tz/MonetaryPolicy', '_blank')}
            >
              <Landmark className="w-4 h-4 mr-2" />
              BOT Monetary Policy
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open('https://www.dse.co.tz/trading-statistics', '_blank')}
            >
              <LineChart className="w-4 h-4 mr-2" />
              Trading Statistics
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="features">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {marketFeatures.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <feature.icon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}

              <div className="border-t pt-6">
                <h3 className="font-medium mb-2">Bond Trading Rules</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Minimum tradeable amount: TZS 100,000</li>
                  <li>• Settlement cycle: T+3 for corporate bonds</li>
                  <li>• Settlement cycle: T+1 for government bonds</li>
                  <li>• Interest calculation: Actual/365 days basis</li>
                  <li>• Trading hours: 10:00 - 15:30 EAT</li>
                  <li>• Price quotation: Clean price basis</li>
                </ul>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-2">Foreign Investor Requirements</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Valid Tax Identification Number (TIN)</li>
                  <li>• CSD account through licensed custodian</li>
                  <li>• Investment license for institutional investors</li>
                  <li>• Compliance with foreign exchange regulations</li>
                  <li>• Sectoral ownership limits compliance</li>
                  <li>• Quarterly holdings reporting</li>
                </ul>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-2">Market Maker Obligations</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Continuous two-way quotes during trading hours</li>
                  <li>• Maximum spread requirements per security class</li>
                  <li>• Minimum quote size requirements</li>
                  <li>• 90% presence in assigned securities</li>
                  <li>• Daily trading volume requirements</li>
                  <li>• Monthly performance evaluation</li>
                </ul>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-2">Cross-Listing Framework</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Harmonized listing requirements with EAC exchanges</li>
                  <li>• Fast-track listing process for regional companies</li>
                  <li>• Recognition of regional regulatory approvals</li>
                  <li>• Coordinated trading and settlement systems</li>
                  <li>• Regional depository linkages</li>
                </ul>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-2">REIT Framework</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Minimum fund size: TZS 10 billion</li>
                  <li>• Minimum free float: 25%</li>
                  <li>• Maximum gearing ratio: 60%</li>
                  <li>• Mandatory distribution: 90% of income</li>
                  <li>• Independent property valuation</li>
                  <li>• Quarterly NAV reporting</li>
                </ul>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-2">Trading Rules</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Price movement limits: ±5% for MIM, ±10% for EGM</li>
                  <li>• Minimum trading lot: 1 share</li>
                  <li>• Settlement cycle: T+3 for equities and bonds</li>
                  <li>• Trading currency: Tanzanian Shilling (TZS)</li>
                  <li>• Foreign ownership limit: Up to 60% in aggregate</li>
                  <li>• Block trade threshold: TZS 200M</li>
                </ul>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-2">Market Benefits</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Zero capital gains tax on listed securities</li>
                  <li>• Reduced corporate tax (25%) for listed companies</li>
                  <li>• Foreign investor participation allowed</li>
                  <li>• Mobile trading through DSE-M</li>
                  <li>• Real-time market information</li>
                  <li>• Efficient price discovery mechanism</li>
                </ul>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-2">Investment Channels</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Licensed stockbrokers</li>
                  <li>• DSE mobile trading platform (DSE-M)</li>
                  <li>• Internet trading facilities</li>
                  <li>• Bank-based brokerage services</li>
                  <li>• Collective Investment Schemes (CIS)</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
} 