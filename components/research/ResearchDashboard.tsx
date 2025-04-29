'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResearchReports } from "./ResearchReports"
import { MarketInsights } from "./MarketInsights"
import { EconomicCalendar } from "./EconomicCalendar"
import { CompanyAnalysis } from "./CompanyAnalysis"
import { SectorAnalysis } from "./SectorAnalysis"

export function ResearchDashboard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Research Dashboard</CardTitle>
        <CardDescription>
          Access comprehensive market research, analysis, and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Latest Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span className="text-sm font-medium">DSE Market Outlook Q2 2025</span>
                  <span className="text-xs text-muted-foreground">Apr 25</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-sm font-medium">Banking Sector Analysis</span>
                  <span className="text-xs text-muted-foreground">Apr 22</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-sm font-medium">TBL Earnings Report</span>
                  <span className="text-xs text-muted-foreground">Apr 20</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Market Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">DSE Index</span>
                  <span className="text-sm text-green-600">Bullish</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Banking Sector</span>
                  <span className="text-sm text-green-600">Bullish</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Manufacturing</span>
                  <span className="text-sm text-yellow-600">Neutral</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span className="text-sm font-medium">BOT Interest Rate Decision</span>
                  <span className="text-xs text-muted-foreground">Apr 30</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-sm font-medium">CRDB Earnings Call</span>
                  <span className="text-xs text-muted-foreground">May 5</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tanzania GDP Report</span>
                  <span className="text-xs text-muted-foreground">May 10</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
