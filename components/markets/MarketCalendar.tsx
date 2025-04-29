import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Clock, Info } from 'lucide-react'

interface MarketEvent {
  date: Date
  title: string
  type: 'dse' | 'bot' | 'corporate'
  description: string
  time?: string
  location?: string
}

// Mock data - In production, this would come from an API
const marketEvents: MarketEvent[] = [
  {
    date: new Date(2024, 2, 15),
    title: 'DSE Monthly Market Report',
    type: 'dse',
    description: 'Release of DSE market performance statistics for February 2024',
    time: '09:00 EAT'
  },
  {
    date: new Date(2024, 2, 20),
    title: 'Monetary Policy Committee Meeting',
    type: 'bot',
    description: 'Bank of Tanzania MPC meeting to review monetary policy stance',
    time: '10:00 EAT',
    location: 'BOT Headquarters'
  },
  {
    date: new Date(2024, 2, 22),
    title: 'CRDB Dividend Payment',
    type: 'corporate',
    description: 'CRDB Bank Plc dividend payment for FY 2023',
  },
  {
    date: new Date(2024, 2, 25),
    title: 'Treasury Bills Auction',
    type: 'bot',
    description: '91, 182, and 364-day Treasury Bills auction',
    time: '14:00 EAT'
  },
  {
    date: new Date(2024, 2, 28),
    title: 'New DSE Trading System Launch',
    type: 'dse',
    description: 'Launch of upgraded automated trading system',
    time: '08:30 EAT',
    location: 'DSE Trading Floor'
  }
]

const tradingSchedule = [
  { day: 'Monday - Friday', sessions: [
    { name: 'Pre-market', time: '09:30 - 10:00 EAT' },
    { name: 'Regular Trading', time: '10:00 - 15:30 EAT' },
    { name: 'Post-market', time: '15:30 - 16:00 EAT' }
  ]},
  { day: 'Saturday - Sunday', sessions: [
    { name: 'Market Closed', time: 'All Day' }
  ]}
]

const botSchedule = [
  { event: 'Treasury Bills Auction', frequency: 'Every Wednesday', time: '14:00 EAT' },
  { event: 'Treasury Bonds Auction', frequency: 'Last Wednesday of the Month', time: '14:00 EAT' },
  { event: 'Monetary Policy Meetings', frequency: 'Bi-monthly', time: '10:00 EAT' },
  { event: 'Foreign Exchange Auction', frequency: 'Daily', time: '09:00 EAT' }
]

export function MarketCalendar() {
  const [date, setDate] = useState<Date>(new Date())
  
  const getEventsForDate = (date: Date) => {
    return marketEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    )
  }

  const getBadgeColor = (type: MarketEvent['type']) => {
    switch (type) {
      case 'dse':
        return 'bg-blue-500'
      case 'bot':
        return 'bg-green-500'
      case 'corporate':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="calendar">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="trading">Trading Hours</TabsTrigger>
          <TabsTrigger value="bot">BOT Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                className="rounded-md border"
                components={{
                  DayContent: ({ date }) => {
                    const events = getEventsForDate(date)
                    return (
                      <div className="relative">
                        <div>{date.getDate()}</div>
                        {events.length > 0 && (
                          <div className="absolute bottom-0 right-0">
                            <div className={`w-2 h-2 rounded-full ${getBadgeColor(events[0].type)}`} />
                          </div>
                        )}
                      </div>
                    )
                  }
                }}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Events for {date.toLocaleDateString()}</h3>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {getEventsForDate(date).map((event, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getBadgeColor(event.type)}>
                          {event.type.toUpperCase()}
                        </Badge>
                        {event.time && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-1" />
                            {event.time}
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      {event.location && (
                        <p className="text-sm text-muted-foreground mt-2">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                  ))}
                  {getEventsForDate(date).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No events scheduled for this date
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trading">
          <div className="space-y-6">
            <div className="grid gap-4">
              {tradingSchedule.map((schedule, index) => (
                <Card key={index} className="p-4">
                  <h3 className="font-medium mb-3">{schedule.day}</h3>
                  <div className="space-y-2">
                    {schedule.sessions.map((session, sessionIndex) => (
                      <div key={sessionIndex} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{session.name}</span>
                        <span className="font-medium">{session.time}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="bg-muted rounded-lg p-4 mt-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <p>The Dar es Salaam Stock Exchange operates Monday through Friday, except on public holidays.</p>
                  <p className="mt-2">Settlement cycle: T+3 (Trade date plus three business days)</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bot">
          <div className="space-y-4">
            {botSchedule.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{item.event}</h3>
                    <p className="text-sm text-muted-foreground">{item.frequency}</p>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {item.time}
                  </div>
                </div>
              </Card>
            ))}
            
            <div className="bg-muted rounded-lg p-4 mt-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <p>Bank of Tanzania (BOT) schedules are subject to change. Please refer to the official BOT website for the most up-to-date information.</p>
                  <Button variant="link" className="h-auto p-0 text-sm" onClick={() => window.open('https://www.bot.go.tz', '_blank')}>
                    Visit BOT Website
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
} 