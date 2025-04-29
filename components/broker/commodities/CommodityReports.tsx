'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  BarChart3,
  Calendar,
  Clock,
  Download,
  FileText,
  RefreshCw,
  Settings,
  Mail,
  Printer,
  PieChart,
  LineChart,
  BarChart,
  Layers
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Types and interfaces
interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  nextRun: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  lastRun?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'trading' | 'settlement' | 'risk' | 'compliance';
  icon: 'BarChart' | 'PieChart' | 'LineChart' | 'FileText';
}

// Mock data
const mockScheduledReports: ScheduledReport[] = [
  {
    id: 'sr1',
    name: 'Daily Trading Summary',
    description: 'Summary of all commodity futures trading activity',
    frequency: 'daily',
    nextRun: '2025-04-27T16:30:00Z',
    recipients: ['trading@example.com', 'risk@example.com'],
    format: 'pdf',
    lastRun: '2025-04-26T16:30:00Z'
  },
  {
    id: 'sr2',
    name: 'Weekly Market Analysis',
    description: 'Analysis of market trends, volumes, and price movements',
    frequency: 'weekly',
    nextRun: '2025-05-02T17:00:00Z',
    recipients: ['analysis@example.com', 'management@example.com'],
    format: 'excel',
    lastRun: '2025-04-25T17:00:00Z'
  },
  {
    id: 'sr3',
    name: 'Monthly Risk Exposure',
    description: 'Detailed report on risk exposure by commodity and client',
    frequency: 'monthly',
    nextRun: '2025-05-31T12:00:00Z',
    recipients: ['risk@example.com', 'compliance@example.com'],
    format: 'pdf',
    lastRun: '2025-03-31T12:00:00Z'
  }
];

const mockReportTemplates: ReportTemplate[] = [
  {
    id: 'rt1',
    name: 'Trading Volume Analysis',
    description: 'Breakdown of trading volume by contract, client, and time period',
    category: 'trading',
    icon: 'BarChart'
  },
  {
    id: 'rt2',
    name: 'Open Interest Report',
    description: 'Analysis of open interest by contract and participant type',
    category: 'trading',
    icon: 'LineChart'
  },
  {
    id: 'rt3',
    name: 'Settlement Report',
    description: 'Daily mark-to-market settlement results and margin calls',
    category: 'settlement',
    icon: 'FileText'
  },
  {
    id: 'rt4',
    name: 'Price Volatility Analysis',
    description: 'Analysis of price volatility across different commodity contracts',
    category: 'risk',
    icon: 'LineChart'
  },
  {
    id: 'rt5',
    name: 'Market Maker Performance',
    description: 'Evaluation of market maker activity and performance metrics',
    category: 'trading',
    icon: 'BarChart'
  },
  {
    id: 'rt6',
    name: 'Position Limits Compliance',
    description: 'Report on compliance with position limits by participant',
    category: 'compliance',
    icon: 'PieChart'
  },
  {
    id: 'rt7',
    name: 'Delivery Intentions',
    description: 'Report on delivery intentions for physically settled contracts',
    category: 'settlement',
    icon: 'FileText'
  },
  {
    id: 'rt8',
    name: 'Basis Risk Analysis',
    description: 'Analysis of basis risk between spot and futures prices',
    category: 'risk',
    icon: 'LineChart'
  }
];

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'BarChart':
      return <BarChart className="h-5 w-5 mr-3 mt-0.5" />;
    case 'PieChart':
      return <PieChart className="h-5 w-5 mr-3 mt-0.5" />;
    case 'LineChart':
      return <LineChart className="h-5 w-5 mr-3 mt-0.5" />;
    case 'FileText':
      return <FileText className="h-5 w-5 mr-3 mt-0.5" />;
    default:
      return <FileText className="h-5 w-5 mr-3 mt-0.5" />;
  }
};

export function CommodityReports() {
  // State
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(mockScheduledReports);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>(mockReportTemplates);
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatingReportName, setGeneratingReportName] = useState('');
  
  // Filter report templates based on selected category and search term
  const filteredTemplates = reportTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Simulate generating a report
  const generateReport = (reportName: string) => {
    setIsGeneratingReport(true);
    setGeneratingReportName(reportName);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
      setGeneratingReportName('');
      alert(`Report "${reportName}" has been generated successfully.`);
    }, 2000);
  };
  
  // Handle scheduling a new report
  const scheduleReport = (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId);
    if (template) {
      alert(`Report "${template.name}" has been scheduled. In a real application, this would open a dialog to configure the schedule.`);
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>
        
        {/* Report Templates Tab */}
        <TabsContent value="templates">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Available Report Templates</h3>
              <div className="flex gap-2">
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="trading">Trading</SelectItem>
                    <SelectItem value="settlement">Settlement</SelectItem>
                    <SelectItem value="risk">Risk</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-64">
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex">
                    {getIconComponent(template.icon)}
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <Badge className="mt-2" variant="outline">
                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => generateReport(template.name)}
                        disabled={isGeneratingReport && generatingReportName === template.name}
                      >
                        {isGeneratingReport && generatingReportName === template.name ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate
                          </>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => scheduleReport(template.id)}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Scheduled Reports</h3>
              <Button>
                <Clock className="h-4 w-4 mr-2" />
                Schedule New Report
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(report.nextRun).toLocaleString()}</TableCell>
                      <TableCell>{report.lastRun ? new Date(report.lastRun).toLocaleString() : 'Never'}</TableCell>
                      <TableCell>{report.format.toUpperCase()}</TableCell>
                      <TableCell>{report.recipients.length} recipients</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500">
                            <Clock className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
        
        {/* Custom Reports Tab */}
        <TabsContent value="custom">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Custom Report Builder</h3>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Save Report
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input id="report-name" placeholder="Enter report name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-category">Category</Label>
                    <Select defaultValue="trading">
                      <SelectTrigger id="report-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trading">Trading</SelectItem>
                        <SelectItem value="settlement">Settlement</SelectItem>
                        <SelectItem value="risk">Risk</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="report-description">Description</Label>
                  <Input id="report-description" placeholder="Enter report description" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-range">Date Range</Label>
                    <Select defaultValue="last_7_days">
                      <SelectTrigger id="date-range">
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                        <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                        <SelectItem value="this_month">This Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-format">Output Format</Label>
                    <Select defaultValue="pdf">
                      <SelectTrigger id="report-format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Data Elements</Label>
                <Card className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="element-volume" className="rounded border-gray-300" defaultChecked />
                      <Label htmlFor="element-volume">Trading Volume</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="element-open-interest" className="rounded border-gray-300" defaultChecked />
                      <Label htmlFor="element-open-interest">Open Interest</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="element-price" className="rounded border-gray-300" defaultChecked />
                      <Label htmlFor="element-price">Price Data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="element-settlement" className="rounded border-gray-300" />
                      <Label htmlFor="element-settlement">Settlement Data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="element-margin" className="rounded border-gray-300" />
                      <Label htmlFor="element-margin">Margin Requirements</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="element-participants" className="rounded border-gray-300" />
                      <Label htmlFor="element-participants">Participant Breakdown</Label>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="space-y-2">
                <Label>Visualization Options</Label>
                <Card className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-auto py-4 px-4 justify-start">
                      <div className="flex flex-col items-center w-full">
                        <BarChart className="h-8 w-8 mb-2" />
                        <div className="text-sm">Bar Chart</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 px-4 justify-start">
                      <div className="flex flex-col items-center w-full">
                        <LineChart className="h-8 w-8 mb-2" />
                        <div className="text-sm">Line Chart</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 px-4 justify-start">
                      <div className="flex flex-col items-center w-full">
                        <PieChart className="h-8 w-8 mb-2" />
                        <div className="text-sm">Pie Chart</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 px-4 justify-start">
                      <div className="flex flex-col items-center w-full">
                        <Layers className="h-8 w-8 mb-2" />
                        <div className="text-sm">Table View</div>
                      </div>
                    </Button>
                  </div>
                </Card>
              </div>
              
              <div className="space-y-2">
                <Label>Delivery Options</Label>
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="delivery-email" className="rounded border-gray-300" defaultChecked />
                      <Label htmlFor="delivery-email" className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="delivery-download" className="rounded border-gray-300" defaultChecked />
                      <Label htmlFor="delivery-download" className="flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="delivery-print" className="rounded border-gray-300" />
                      <Label htmlFor="delivery-print" className="flex items-center">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Label>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline">Preview Report</Button>
                <Button>Generate Report</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
