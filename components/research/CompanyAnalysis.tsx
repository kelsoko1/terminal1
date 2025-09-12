'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

// Mock data for company analysis
const companies = [
  { id: "crdb", name: "CRDB Bank Plc" },
  { id: "nmb", name: "NMB Bank Plc" },
  { id: "tbl", name: "Tanzania Breweries Ltd" },
  { id: "tcc", name: "Tanzania Cigarette Company" },
  { id: "tics", name: "Tanzania Insurance Corporation" },
  { id: "swissport", name: "Swissport Tanzania" },
  { id: "tatepa", name: "Tanzania Tea Packers" }
]

const financialData = {
  crdb: {
    overview: {
      marketCap: "1.2T TZS",
      shares: "2.6B",
      sector: "Banking",
      pe: 8.5,
      eps: 55,
      dividend: 4.5,
      high52: 510,
      low52: 420
    },
    performance: [
      { year: "2020", revenue: 850, profit: 120, eps: 46 },
      { year: "2021", revenue: 920, profit: 145, eps: 48 },
      { year: "2022", revenue: 980, profit: 160, eps: 50 },
      { year: "2023", revenue: 1050, profit: 175, eps: 52 },
      { year: "2024", revenue: 1120, profit: 190, eps: 55 }
    ],
    priceHistory: [
      { month: "Jan", price: 450 },
      { month: "Feb", price: 465 },
      { month: "Mar", price: 480 },
      { month: "Apr", price: 470 },
      { month: "May", price: 485 },
      { month: "Jun", price: 495 }
    ],
    ratios: [
      { name: "ROE", value: 18.5 },
      { name: "ROA", value: 2.8 },
      { name: "NIM", value: 7.2 },
      { name: "Cost-to-Income", value: 52.0 },
      { name: "CAR", value: 16.8 },
      { name: "NPL Ratio", value: 4.2 }
    ]
  },
  nmb: {
    overview: {
      marketCap: "1.0T TZS",
      shares: "2.0B",
      sector: "Banking",
      pe: 7.8,
      eps: 60,
      dividend: 5.0,
      high52: 490,
      low52: 400
    },
    performance: [
      { year: "2020", revenue: 780, profit: 110, eps: 50 },
      { year: "2021", revenue: 840, profit: 125, eps: 53 },
      { year: "2022", revenue: 900, profit: 140, eps: 55 },
      { year: "2023", revenue: 950, profit: 155, eps: 58 },
      { year: "2024", revenue: 1000, profit: 170, eps: 60 }
    ],
    priceHistory: [
      { month: "Jan", price: 420 },
      { month: "Feb", price: 435 },
      { month: "Mar", price: 450 },
      { month: "Apr", price: 440 },
      { month: "May", price: 455 },
      { month: "Jun", price: 470 }
    ],
    ratios: [
      { name: "ROE", value: 19.2 },
      { name: "ROA", value: 3.0 },
      { name: "NIM", value: 7.5 },
      { name: "Cost-to-Income", value: 50.5 },
      { name: "CAR", value: 17.2 },
      { name: "NPL Ratio", value: 3.8 }
    ]
  },
  tbl: {
    overview: {
      marketCap: "850B TZS",
      shares: "1.5B",
      sector: "Consumer Goods",
      pe: 12.5,
      eps: 40,
      dividend: 3.8,
      high52: 580,
      low52: 480
    },
    performance: [
      { year: "2020", revenue: 950, profit: 180, eps: 30 },
      { year: "2021", revenue: 1000, profit: 195, eps: 33 },
      { year: "2022", revenue: 1050, profit: 210, eps: 35 },
      { year: "2023", revenue: 1100, profit: 225, eps: 38 },
      { year: "2024", revenue: 1150, profit: 240, eps: 40 }
    ],
    priceHistory: [
      { month: "Jan", price: 500 },
      { month: "Feb", price: 520 },
      { month: "Mar", price: 540 },
      { month: "Apr", price: 530 },
      { month: "May", price: 550 },
      { month: "Jun", price: 570 }
    ],
    ratios: [
      { name: "ROE", value: 22.5 },
      { name: "ROA", value: 15.8 },
      { name: "Gross Margin", value: 45.2 },
      { name: "Operating Margin", value: 25.0 },
      { name: "Net Margin", value: 20.8 },
      { name: "Debt-to-Equity", value: 0.35 }
    ]
  }
}

export function CompanyAnalysis() {
  const [selectedCompany, setSelectedCompany] = useState("crdb")
  
  const companyData = financialData[selectedCompany as keyof typeof financialData] || financialData.crdb

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Company Analysis</CardTitle>
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map(company => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="chart">Price Chart</TabsTrigger>
            <TabsTrigger value="ratios">Key Ratios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Market Cap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{companyData.overview.marketCap}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">P/E Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{companyData.overview.pe}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">EPS (TZS)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{companyData.overview.eps}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Dividend Yield</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{companyData.overview.dividend}%</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Company Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sector</span>
                      <span>{companyData.overview.sector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Outstanding Shares</span>
                      <span>{companyData.overview.shares}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">52-Week High</span>
                      <span>{companyData.overview.high52} TZS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">52-Week Low</span>
                      <span>{companyData.overview.low52} TZS</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Analyst Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full investor-bg-success mr-2"></div>
                      <span>Buy</span>
                    </div>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="investor-bg-success h-2.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full investor-bg-warning mr-2"></div>
                      <span>Hold</span>
                    </div>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="investor-bg-warning h-2.5 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full investor-bg-danger mr-2"></div>
                      <span>Sell</span>
                    </div>
                    <span>10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="investor-bg-danger h-2.5 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="financials" className="mt-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={companyData.performance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue (Bn TZS)" fill="#8884d8" />
                  <Bar yAxisId="left" dataKey="profit" name="Profit (Bn TZS)" fill="#82ca9d" />
                  <Line yAxisId="right" type="monotone" dataKey="eps" name="EPS (TZS)" stroke="#ff7300" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Financial Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium">Revenue Growth</h4>
                  <p className="text-sm text-muted-foreground">
                    Consistent growth over the past 5 years with a CAGR of 7.2%
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Profit Margins</h4>
                  <p className="text-sm text-muted-foreground">
                    Improving profit margins due to operational efficiency and cost control
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">EPS Trend</h4>
                  <p className="text-sm text-muted-foreground">
                    Steady increase in earnings per share, reflecting strong fundamental performance
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chart" className="mt-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={companyData.priceHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    name="Share Price (TZS)"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Technical Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-medium">RSI (14)</h4>
                  <p className="text-sm text-green-600">
                    58.2 (Neutral)
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">MACD</h4>
                  <p className="text-sm text-green-600">
                    Bullish
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Moving Averages</h4>
                  <p className="text-sm text-green-600">
                    Above 50 & 200 MA
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Support/Resistance</h4>
                  <p className="text-sm text-muted-foreground">
                    S: 460 | R: 510
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ratios" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={companyData.ratios}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Value (%)" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Ratio Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium">Profitability Ratios</h4>
                  <p className="text-sm text-muted-foreground">
                    Strong ROE and ROA compared to industry peers, indicating efficient use of capital and assets.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Efficiency Ratios</h4>
                  <p className="text-sm text-muted-foreground">
                    Improving operational efficiency with better cost-to-income ratio than industry average.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Liquidity Ratios</h4>
                  <p className="text-sm text-muted-foreground">
                    Adequate liquidity position with strong capital adequacy ratio, well above regulatory requirements.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Valuation Ratios</h4>
                  <p className="text-sm text-muted-foreground">
                    Trading at attractive valuation multiples compared to regional and global peers.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
