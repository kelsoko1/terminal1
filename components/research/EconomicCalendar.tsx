'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"

// Mock data for economic events
const economicEvents = [
  {
    id: "1",
    date: "2025-04-30",
    time: "14:00",
    event: "BOT Interest Rate Decision",
    country: "Tanzania",
    impact: "High",
    previous: "9.0%",
    forecast: "9.0%",
    actual: ""
  },
  {
    id: "2",
    date: "2025-05-05",
    time: "10:00",
    event: "Tanzania Inflation Rate",
    country: "Tanzania",
    impact: "High",
    previous: "3.8%",
    forecast: "3.7%",
    actual: ""
  },
  {
    id: "3",
    date: "2025-05-10",
    time: "12:00",
    event: "Tanzania GDP Growth Rate",
    country: "Tanzania",
    impact: "High",
    previous: "5.2%",
    forecast: "5.4%",
    actual: ""
  },
  {
    id: "4",
    date: "2025-05-12",
    time: "09:00",
    event: "Tanzania Balance of Trade",
    country: "Tanzania",
    impact: "Medium",
    previous: "-$120M",
    forecast: "-$110M",
    actual: ""
  },
  {
    id: "5",
    date: "2025-05-15",
    time: "14:00",
    event: "EAC Economic Outlook",
    country: "Regional",
    impact: "Medium",
    previous: "",
    forecast: "",
    actual: ""
  },
  {
    id: "6",
    date: "2025-05-18",
    time: "10:00",
    event: "Tanzania Foreign Exchange Reserves",
    country: "Tanzania",
    impact: "Medium",
    previous: "$5.2B",
    forecast: "$5.3B",
    actual: ""
  },
  {
    id: "7",
    date: "2025-05-20",
    time: "09:00",
    event: "Tanzania Business Confidence",
    country: "Tanzania",
    impact: "Low",
    previous: "52.3",
    forecast: "53.0",
    actual: ""
  }
]

export function EconomicCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [view, setView] = useState<"calendar" | "list">("list")
  
  // Filter events based on selected date if in calendar view
  const filteredEvents = view === "calendar" && date
    ? economicEvents.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.toDateString() === date.toDateString()
      })
    : economicEvents

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "High":
        return <Badge className="bg-red-500">High</Badge>
      case "Medium":
        return <Badge className="bg-yellow-500">Medium</Badge>
      case "Low":
        return <Badge className="bg-green-500">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Economic Calendar</CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant={view === "list" ? "default" : "outline"} 
            size="sm"
            onClick={() => setView("list")}
          >
            List View
          </Button>
          <Button 
            variant={view === "calendar" ? "default" : "outline"} 
            size="sm"
            onClick={() => setView("calendar")}
          >
            Calendar View
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {view === "calendar" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">
                Events for {date?.toLocaleDateString()}
              </h3>
              {filteredEvents.length > 0 ? (
                <ul className="space-y-3">
                  {filteredEvents.map(event => (
                    <li key={event.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{event.event}</div>
                          <div className="text-sm text-muted-foreground">{event.time} | {event.country}</div>
                        </div>
                        {getImpactBadge(event.impact)}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">Previous</div>
                          <div>{event.previous || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Forecast</div>
                          <div>{event.forecast || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Actual</div>
                          <div>{event.actual || "Pending"}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No events scheduled for this date
                </div>
              )}
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Previous</TableHead>
                <TableHead>Forecast</TableHead>
                <TableHead>Actual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {economicEvents.map(event => (
                <TableRow key={event.id}>
                  <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell>{event.time}</TableCell>
                  <TableCell className="font-medium">{event.event}</TableCell>
                  <TableCell>{event.country}</TableCell>
                  <TableCell>{getImpactBadge(event.impact)}</TableCell>
                  <TableCell>{event.previous || "N/A"}</TableCell>
                  <TableCell>{event.forecast || "N/A"}</TableCell>
                  <TableCell>{event.actual || "Pending"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
