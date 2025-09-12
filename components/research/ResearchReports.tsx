'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Mock data for research reports
const mockReports = [
  {
    id: "1",
    title: "DSE Market Outlook Q2 2025",
    category: "Market Analysis",
    author: "Research Team",
    date: "Apr 25, 2025",
    type: "Premium",
    summary: "Comprehensive analysis of DSE market trends and outlook for Q2 2025"
  },
  {
    id: "2",
    title: "Banking Sector Analysis",
    category: "Sector Analysis",
    author: "John Doe",
    date: "Apr 22, 2025",
    type: "Premium",
    summary: "In-depth analysis of the banking sector performance and outlook"
  },
  {
    id: "3",
    title: "TBL Earnings Report Analysis",
    category: "Company Analysis",
    author: "Jane Smith",
    date: "Apr 20, 2025",
    type: "Standard",
    summary: "Analysis of TBL's latest earnings report and future prospects"
  },
  {
    id: "4",
    title: "Manufacturing Sector Outlook",
    category: "Sector Analysis",
    author: "Research Team",
    date: "Apr 18, 2025",
    type: "Standard",
    summary: "Overview of manufacturing sector performance and trends"
  },
  {
    id: "5",
    title: "Tanzania Macroeconomic Review",
    category: "Economic Analysis",
    author: "Economic Research Unit",
    date: "Apr 15, 2025",
    type: "Premium",
    summary: "Analysis of Tanzania's macroeconomic indicators and outlook"
  },
  {
    id: "6",
    title: "DSE Technical Analysis",
    category: "Technical Analysis",
    author: "Technical Team",
    date: "Apr 12, 2025",
    type: "Standard",
    summary: "Technical analysis of DSE index and major stocks"
  },
  {
    id: "7",
    title: "Fixed Income Market Update",
    category: "Market Analysis",
    author: "Bond Research Team",
    date: "Apr 10, 2025",
    type: "Premium",
    summary: "Update on fixed income market trends and opportunities"
  }
]

export function ResearchReports() {
  const [filter, setFilter] = useState("all")
  
  const filteredReports = filter === "all" 
    ? mockReports 
    : mockReports.filter(report => 
        filter === "premium" ? report.type === "Premium" : report.type === "Standard"
      )

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Research Reports</CardTitle>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="premium">Premium Only</SelectItem>
              <SelectItem value="standard">Standard Only</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Download All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map(report => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.title}</TableCell>
                <TableCell>{report.category}</TableCell>
                <TableCell>{report.author}</TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell>
                  <Badge variant={report.type === "Premium" ? "default" : "outline"}>
                    {report.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
