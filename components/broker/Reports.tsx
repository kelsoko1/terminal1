import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarIcon, Download, FileText, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Report {
  id: string
  name: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  format: 'pdf' | 'excel'
  description: string
  generationTime?: string
}

const reportTypes: Report[] = [
  {
    id: 'daily-trading',
    name: 'Daily Trading Report',
    type: 'daily',
    format: 'excel',
    description: 'Summary of all trading activities for the day including executed orders and settlements'
  },
  {
    id: 'csdr',
    name: 'CSDR Report',
    type: 'daily',
    format: 'pdf',
    description: 'Central Securities Depository Registry report for DSE compliance'
  },
  {
    id: 'settlement',
    name: 'Settlement Report',
    type: 'daily',
    format: 'excel',
    description: 'Detailed report of all settled trades and pending settlements'
  },
  {
    id: 'client-holdings',
    name: 'Client Holdings Report',
    type: 'weekly',
    format: 'excel',
    description: 'Comprehensive report of all client positions and account balances'
  },
  {
    id: 'cmsa-compliance',
    name: 'CMSA Compliance Report',
    type: 'monthly',
    format: 'pdf',
    description: 'Monthly compliance report for Capital Markets and Securities Authority'
  },
  {
    id: 'transaction',
    name: 'Transaction Report',
    type: 'custom',
    format: 'excel',
    description: 'Detailed transaction history for a specified date range'
  }
]

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)

  const handleGenerateReport = async (report: Report) => {
    setGenerating(report.id)
    
    try {
      // Simulate report generation delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create report data based on type
      const reportData = {
        reportType: report.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        dateRange: dateRange ? {
          from: format(dateRange.from, 'yyyy-MM-dd'),
          to: format(dateRange.to, 'yyyy-MM-dd')
        } : null,
        format: report.format,
        timestamp: new Date().toISOString()
      }

      // Create and download the file
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${report.id}-${format(selectedDate, 'yyyy-MM-dd')}.${report.format}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">DSE Reports</h2>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{report.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{report.type.toUpperCase()}</Badge>
                  <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateReport(report)}
                disabled={!!generating}
              >
                {generating === report.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Report Generation History</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Daily Trading Report</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Generated on {format(new Date(), 'PPP')}
            </div>
          </div>
          {/* Add more history items here */}
        </div>
      </Card>
    </div>
  )
} 