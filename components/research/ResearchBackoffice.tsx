'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { 
  Calendar, 
  Check, 
  Edit, 
  FileText, 
  Filter, 
  Plus, 
  Search, 
  Trash2, 
  Users 
} from "lucide-react"

// Mock data for research backoffice
const mockReports = [
  {
    id: "1",
    title: "DSE Market Outlook Q2 2025",
    author: "John Doe",
    category: "Market Analysis",
    status: "Published",
    date: "Apr 25, 2025",
    views: 245
  },
  {
    id: "2",
    title: "Banking Sector Analysis",
    author: "Jane Smith",
    category: "Sector Analysis",
    status: "Published",
    date: "Apr 22, 2025",
    views: 189
  },
  {
    id: "3",
    title: "TBL Earnings Report Analysis",
    author: "Robert Johnson",
    category: "Company Analysis",
    status: "Draft",
    date: "Apr 20, 2025",
    views: 0
  },
  {
    id: "4",
    title: "Manufacturing Sector Outlook",
    author: "Sarah Williams",
    category: "Sector Analysis",
    status: "Review",
    date: "Apr 18, 2025",
    views: 0
  },
  {
    id: "5",
    title: "Tanzania Macroeconomic Review",
    author: "Michael Brown",
    category: "Economic Analysis",
    status: "Published",
    date: "Apr 15, 2025",
    views: 156
  }
]

const mockAnalysts = [
  {
    id: "1",
    name: "John Doe",
    role: "Senior Analyst",
    specialization: "Banking & Finance",
    reports: 15,
    performance: 92
  },
  {
    id: "2",
    name: "Jane Smith",
    role: "Research Analyst",
    specialization: "Consumer Goods",
    reports: 12,
    performance: 88
  },
  {
    id: "3",
    name: "Robert Johnson",
    role: "Research Analyst",
    specialization: "Manufacturing",
    reports: 8,
    performance: 85
  },
  {
    id: "4",
    name: "Sarah Williams",
    role: "Senior Analyst",
    specialization: "Telecommunications",
    reports: 14,
    performance: 90
  },
  {
    id: "5",
    name: "Michael Brown",
    role: "Chief Economist",
    specialization: "Macroeconomics",
    reports: 18,
    performance: 95
  }
]

const mockRequests = [
  {
    id: "1",
    title: "CRDB Detailed Analysis",
    requester: "Investment Team",
    priority: "High",
    status: "Pending",
    deadline: "May 5, 2025"
  },
  {
    id: "2",
    title: "Energy Sector Deep Dive",
    requester: "Portfolio Management",
    priority: "Medium",
    status: "In Progress",
    deadline: "May 10, 2025"
  },
  {
    id: "3",
    title: "Tanzania GDP Forecast",
    requester: "Risk Management",
    priority: "High",
    status: "In Progress",
    deadline: "May 8, 2025"
  },
  {
    id: "4",
    title: "DSE Technical Analysis",
    requester: "Trading Desk",
    priority: "Low",
    status: "Pending",
    deadline: "May 15, 2025"
  },
  {
    id: "5",
    title: "Fixed Income Market Update",
    requester: "Bond Trading",
    priority: "Medium",
    status: "Pending",
    deadline: "May 12, 2025"
  }
]

// Form schemas
const reportFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  author: z.string().min(1, { message: "Please select an author" }),
  summary: z.string().min(10, { message: "Summary must be at least 10 characters" }),
  content: z.string().min(50, { message: "Content must be at least 50 characters" })
})

const requestFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  requester: z.string().min(1, { message: "Please enter requester" }),
  priority: z.string().min(1, { message: "Please select a priority" }),
  deadline: z.string().min(1, { message: "Please enter a deadline" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" })
})

export function ResearchBackoffice() {
  const [activeTab, setActiveTab] = useState("reports")
  const [isNewReportOpen, setIsNewReportOpen] = useState(false)
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  
  // Report form
  const reportForm = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      category: "",
      author: "",
      summary: "",
      content: ""
    }
  })
  
  // Request form
  const requestForm = useForm<z.infer<typeof requestFormSchema>>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: "",
      requester: "",
      priority: "",
      deadline: "",
      description: ""
    }
  })
  
  function onSubmitReport(values: z.infer<typeof reportFormSchema>) {
    console.log(values)
    setIsNewReportOpen(false)
    reportForm.reset()
  }
  
  function onSubmitRequest(values: z.infer<typeof requestFormSchema>) {
    console.log(values)
    setIsNewRequestOpen(false)
    requestForm.reset()
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return <Badge className="bg-green-500">Published</Badge>
      case "Draft":
        return <Badge variant="outline">Draft</Badge>
      case "Review":
        return <Badge className="bg-yellow-500">Review</Badge>
      case "Pending":
        return <Badge variant="outline">Pending</Badge>
      case "In Progress":
        return <Badge className="bg-blue-500">In Progress</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-500">High</Badge>
      case "Medium":
        return <Badge className="bg-yellow-500">Medium</Badge>
      case "Low":
        return <Badge className="bg-green-500">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Research Backoffice</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 mr-2" />
              Reports Management
            </TabsTrigger>
            <TabsTrigger value="analysts">
              <Users className="w-4 h-4 mr-2" />
              Analyst Team
            </TabsTrigger>
            <TabsTrigger value="requests">
              <Calendar className="w-4 h-4 mr-2" />
              Research Requests
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search reports..."
                    className="pl-8 w-[250px]"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Dialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Research Report</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new research report. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...reportForm}>
                    <form onSubmit={reportForm.handleSubmit(onSubmitReport)} className="space-y-4">
                      <FormField
                        control={reportForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Report Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter report title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={reportForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="market_analysis">Market Analysis</SelectItem>
                                  <SelectItem value="sector_analysis">Sector Analysis</SelectItem>
                                  <SelectItem value="company_analysis">Company Analysis</SelectItem>
                                  <SelectItem value="economic_analysis">Economic Analysis</SelectItem>
                                  <SelectItem value="technical_analysis">Technical Analysis</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={reportForm.control}
                          name="author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Author</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select author" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {mockAnalysts.map(analyst => (
                                    <SelectItem key={analyst.id} value={analyst.id}>
                                      {analyst.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={reportForm.control}
                        name="summary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Summary</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter a brief summary of the report" 
                                className="resize-none"
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={reportForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter the full content of the report" 
                                className="resize-none"
                                rows={10}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsNewReportOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Save Report</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReports.map(report => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>{report.author}</TableCell>
                    <TableCell>{report.category}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.views}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {report.status !== "Published" && (
                          <Button variant="ghost" size="icon" className="text-green-600">
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="analysts" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search analysts..."
                    className="pl-8 w-[250px]"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Analyst
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAnalysts.map(analyst => (
                  <TableRow key={analyst.id}>
                    <TableCell className="font-medium">{analyst.name}</TableCell>
                    <TableCell>{analyst.role}</TableCell>
                    <TableCell>{analyst.specialization}</TableCell>
                    <TableCell>{analyst.reports}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 dark:bg-gray-700">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${analyst.performance}%` }}
                          ></div>
                        </div>
                        <span>{analyst.performance}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="requests" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search requests..."
                    className="pl-8 w-[250px]"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Research Request</DialogTitle>
                    <DialogDescription>
                      Submit a new research request to the research team.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...requestForm}>
                    <form onSubmit={requestForm.handleSubmit(onSubmitRequest)} className="space-y-4">
                      <FormField
                        control={requestForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Request Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter request title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={requestForm.control}
                          name="requester"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Requester</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter requester name/team" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={requestForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={requestForm.control}
                        name="deadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deadline</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={requestForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your research request in detail" 
                                className="resize-none"
                                rows={5}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsNewRequestOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Submit Request</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell>{request.requester}</TableCell>
                    <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{request.deadline}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {request.status === "Pending" && (
                          <Button variant="ghost" size="icon" className="text-green-600">
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
