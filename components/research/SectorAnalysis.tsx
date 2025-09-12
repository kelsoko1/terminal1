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
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

// Mock data for sector analysis
const sectors = [
  { id: "banking", name: "Banking" },
  { id: "telecom", name: "Telecommunications" },
  { id: "manufacturing", name: "Manufacturing" },
  { id: "energy", name: "Energy" },
  { id: "consumer", name: "Consumer Goods" },
  { id: "insurance", name: "Insurance" },
  { id: "transportation", name: "Transportation" }
]

const sectorData = {
  banking: {
    overview: {
      marketCap: "3.2T TZS",
      peRatio: 8.2,
      dividendYield: 4.8,
      companies: 6,
      indexWeight: 35.2
    },
    performance: [
      { year: "2020", return: 12.5 },
      { year: "2021", return: 15.8 },
      { year: "2022", return: 10.2 },
      { year: "2023", return: 14.5 },
      { year: "2024", return: 16.2 }
    ],
    companies: [
      { name: "CRDB Bank", weight: 38, performance: 16.5 },
      { name: "NMB Bank", weight: 32, performance: 15.2 },
      { name: "DCB Bank", weight: 12, performance: 8.5 },
      { name: "Exim Bank", weight: 10, performance: 7.2 },
      { name: "Azania Bank", weight: 5, performance: 5.8 },
      { name: "Akiba Bank", weight: 3, performance: 4.2 }
    ],
    monthlyPerformance: [
      { month: "Jan", sectorReturn: 2.5, indexReturn: 2.0 },
      { month: "Feb", sectorReturn: 3.2, indexReturn: 2.8 },
      { month: "Mar", sectorReturn: 2.8, indexReturn: 2.5 },
      { month: "Apr", sectorReturn: -1.2, indexReturn: -0.8 },
      { month: "May", sectorReturn: 3.5, indexReturn: 2.2 },
      { month: "Jun", sectorReturn: 4.2, indexReturn: 3.0 }
    ]
  },
  telecom: {
    overview: {
      marketCap: "2.5T TZS",
      peRatio: 12.5,
      dividendYield: 3.5,
      companies: 3,
      indexWeight: 25.8
    },
    performance: [
      { year: "2020", return: 8.5 },
      { year: "2021", return: 10.2 },
      { year: "2022", return: 12.5 },
      { year: "2023", return: 9.8 },
      { year: "2024", return: 11.5 }
    ],
    companies: [
      { name: "Vodacom Tanzania", weight: 55, performance: 12.5 },
      { name: "Airtel Tanzania", weight: 35, performance: 10.8 },
      { name: "Tanzania Telecom", weight: 10, performance: 6.5 }
    ],
    monthlyPerformance: [
      { month: "Jan", sectorReturn: 1.8, indexReturn: 2.0 },
      { month: "Feb", sectorReturn: 2.5, indexReturn: 2.8 },
      { month: "Mar", sectorReturn: 3.2, indexReturn: 2.5 },
      { month: "Apr", sectorReturn: -0.5, indexReturn: -0.8 },
      { month: "May", sectorReturn: 2.8, indexReturn: 2.2 },
      { month: "Jun", sectorReturn: 2.2, indexReturn: 3.0 }
    ]
  },
  manufacturing: {
    overview: {
      marketCap: "1.8T TZS",
      peRatio: 14.2,
      dividendYield: 3.2,
      companies: 8,
      indexWeight: 15.5
    },
    performance: [
      { year: "2020", return: 5.2 },
      { year: "2021", return: 7.8 },
      { year: "2022", return: 9.5 },
      { year: "2023", return: 6.8 },
      { year: "2024", return: 8.2 }
    ],
    companies: [
      { name: "TBL", weight: 42, performance: 9.5 },
      { name: "TCC", weight: 28, performance: 8.2 },
      { name: "Tanga Cement", weight: 10, performance: 5.5 },
      { name: "Tanzania Portland", weight: 8, performance: 4.8 },
      { name: "TOL Gases", weight: 5, performance: 3.5 },
      { name: "Twiga Cement", weight: 7, performance: 4.2 }
    ],
    monthlyPerformance: [
      { month: "Jan", sectorReturn: 1.2, indexReturn: 2.0 },
      { month: "Feb", sectorReturn: 1.8, indexReturn: 2.8 },
      { month: "Mar", sectorReturn: 2.2, indexReturn: 2.5 },
      { month: "Apr", sectorReturn: -1.5, indexReturn: -0.8 },
      { month: "May", sectorReturn: 1.5, indexReturn: 2.2 },
      { month: "Jun", sectorReturn: 2.0, indexReturn: 3.0 }
    ]
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

export function SectorAnalysis() {
  const [selectedSector, setSelectedSector] = useState("banking")
  
  const data = sectorData[selectedSector as keyof typeof sectorData] || sectorData.banking

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sector Analysis</CardTitle>
        <Select value={selectedSector} onValueChange={setSelectedSector}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select sector" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map(sector => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Market Cap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{data.overview.marketCap}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">P/E Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{data.overview.peRatio}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Dividend Yield</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{data.overview.dividendYield}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{data.overview.companies}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Index Weight</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{data.overview.indexWeight}%</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Sector Composition</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.companies}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="weight"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.companies.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Sector Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Strengths</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li>Strong financial performance with consistent growth</li>
                        <li>High dividend yield compared to other sectors</li>
                        <li>Robust regulatory framework providing stability</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Weaknesses</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li>Increasing competition affecting margins</li>
                        <li>Regulatory changes impacting operational costs</li>
                        <li>Technology disruption requiring significant investment</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Outlook</h4>
                      <p className="text-sm text-muted-foreground">
                        Positive outlook with expected growth driven by economic expansion, 
                        increased financial inclusion, and technological innovation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.performance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="return" name="Annual Return (%)" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Performance Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium">5-Year Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    The sector has delivered a cumulative return of 69.2% over the past 5 years,
                    outperforming the broader DSE index by 15.8%.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Volatility</h4>
                  <p className="text-sm text-muted-foreground">
                    Lower volatility compared to other sectors with a standard deviation of 2.5%,
                    providing more stable returns for investors.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Future Outlook</h4>
                  <p className="text-sm text-muted-foreground">
                    Expected to maintain strong performance with projected returns of 12-15%
                    annually over the next 3 years.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Relative Performance</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.monthlyPerformance}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sectorReturn"
                      name="Sector Return (%)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="indexReturn"
                      name="DSE Index Return (%)"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="companies" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Weight (%)</TableHead>
                  <TableHead>YTD Performance (%)</TableHead>
                  <TableHead>Relative to Sector</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.companies.map((company, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.weight}%</TableCell>
                    <TableCell>{company.performance}%</TableCell>
                    <TableCell>
                      {company.performance > data.performance[4].return ? (
                        <span className="text-green-600">Outperforming</span>
                      ) : company.performance === data.performance[4].return ? (
                        <span className="text-yellow-600">In-line</span>
                      ) : (
                        <span className="text-red-600">Underperforming</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Key Metrics Comparison</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.companies}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'Weight (%)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Performance (%)', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="weight" name="Weight (%)" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="performance" name="YTD Performance (%)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Key Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Digitalization</h4>
                      <p className="text-sm text-muted-foreground">
                        Accelerating digital transformation with increased investment in mobile and online platforms.
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Financial Inclusion</h4>
                      <p className="text-sm text-muted-foreground">
                        Expanding services to underserved populations through innovative products and channels.
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Regulatory Changes</h4>
                      <p className="text-sm text-muted-foreground">
                        Adapting to evolving regulatory requirements with focus on compliance and risk management.
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Consolidation</h4>
                      <p className="text-sm text-muted-foreground">
                        Increasing M&A activity as companies seek scale and operational efficiencies.
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '55%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Sector Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Short-term Outlook (6-12 months)</h4>
                      <div className="flex items-center mt-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-green-600 font-medium">Bullish</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Expected to outperform the broader market with 15-18% returns driven by strong earnings growth.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Medium-term Outlook (1-3 years)</h4>
                      <div className="flex items-center mt-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-green-600 font-medium">Bullish</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sustained growth expected with potential for 12-15% annual returns as digital transformation drives efficiency.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Long-term Outlook (3-5 years)</h4>
                      <div className="flex items-center mt-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-sm text-yellow-600 font-medium">Neutral to Positive</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Moderating growth with 8-10% annual returns as the sector matures and competition intensifies.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Key Catalysts</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                        <li>Regulatory reforms supporting innovation</li>
                        <li>Economic growth driving loan demand</li>
                        <li>Technological adoption improving efficiency</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
