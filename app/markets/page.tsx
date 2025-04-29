'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ResearchDashboard } from '@/components/research/ResearchDashboard'
import { ResearchReports } from '@/components/research/ResearchReports'
import { MarketInsights } from '@/components/research/MarketInsights'
import { EconomicCalendar } from '@/components/research/EconomicCalendar'
import { CompanyAnalysis } from '@/components/research/CompanyAnalysis'
import { SectorAnalysis } from '@/components/research/SectorAnalysis'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function ResearchPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Research & Analysis</h1>
        <div className="relative w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search research..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="grid gap-6">
        <ResearchDashboard />

        <Tabs defaultValue="reports">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
            <TabsTrigger value="calendar">Economic Calendar</TabsTrigger>
            <TabsTrigger value="company">Company Analysis</TabsTrigger>
            <TabsTrigger value="sector">Sector Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <ResearchReports />
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <Card>
              <MarketInsights />
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <EconomicCalendar />
            </Card>
          </TabsContent>

          <TabsContent value="company" className="mt-6">
            <Card>
              <CompanyAnalysis />
            </Card>
          </TabsContent>

          <TabsContent value="sector" className="mt-6">
            <Card>
              <SectorAnalysis />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}