'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChallengeList } from '@/components/broker/challenges/ChallengeList'
import { CreateChallengeForm } from '@/components/broker/challenges/CreateChallengeForm'
import { ChallengeStats } from '@/components/broker/challenges/ChallengeStats'
import { BondManagement } from '@/components/broker/bonds/BondManagement'
import { FundManagement } from '@/components/broker/funds/FundManagement'
import { StockManagement } from '@/components/broker/stocks/StockManagement'
import { SubscriptionManagement } from '@/components/broker/subscriptions/SubscriptionManagement'
import { Plus, ArrowLeft } from 'lucide-react'
import {
  ClientManagement,
  TransactionHistory,
  BrokerDashboard,
  Reports,
  HRManagement,
  AccountingManagement,
  RoleManagement,
  FxFutureManagement,
  CommodityManagement
} from '@/components/broker'
import { AdsManagement } from '@/components/broker/ads/AdsManagement'
import { ResearchBackoffice } from '@/components/research/ResearchBackoffice'
import { OrganizationManagement } from '@/components/broker/organizations/OrganizationManagement'
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/lib/auth/auth-context'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function BrokerBackOffice() {
  const { checkAccess, user } = useAuth()
  const searchParams = useSearchParams()
  const tabParam = searchParams ? searchParams.get('tab') : null
  
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showNewChallenge, setShowNewChallenge] = useState(false)
  const [activeHRTab, setActiveHRTab] = useState('staff')

  // Set active tab based on URL parameter
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const isKelsokoAdmin = user?.role === 'kelsoko_admin'

  return (
    <RequireAuth requiredRole="broker">
      <div className="p-6 max-w-[1600px] mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsContent value="dashboard">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <BrokerDashboard />
            </div>
          </TabsContent>

          {isKelsokoAdmin && (
            <TabsContent value="organizations">
              <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
                <Card className="overflow-hidden">
                  <OrganizationManagement />
                </Card>
              </div>
            </TabsContent>
          )}

          <TabsContent value="clients">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
              <Card className="overflow-hidden">
                <ClientManagement />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stocks">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Stocks</h1>
              <Card className="overflow-hidden">
                <StockManagement />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="challenges">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Trading Challenges</h1>
                <Button 
                  onClick={() => setShowNewChallenge(true)}
                  className="ml-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Challenge
                </Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                <ChallengeStats />
              </div>

              <Card className="overflow-hidden">
                {showNewChallenge ? (
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Create New Challenge</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowNewChallenge(false)}
                        className="gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to List
                      </Button>
                    </div>
                    <CreateChallengeForm onSuccess={() => setShowNewChallenge(false)} />
                  </div>
                ) : (
                  <Tabs defaultValue="active" className="w-full">
                    <div className="px-6 pt-6 border-b">
                      <TabsList className="bg-transparent border rounded-lg p-1">
                        <TabsTrigger 
                          value="active"
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
                        >
                          Active
                        </TabsTrigger>
                        <TabsTrigger 
                          value="draft"
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
                        >
                          Drafts
                        </TabsTrigger>
                        <TabsTrigger 
                          value="completed"
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
                        >
                          Completed
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="active" className="p-6">
                      <ScrollArea className="h-[calc(100vh-320px)]">
                        <ChallengeList status="Active" />
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="draft" className="p-6">
                      <ScrollArea className="h-[calc(100vh-320px)]">
                        <ChallengeList status="Draft" />
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="completed" className="p-6">
                      <ScrollArea className="h-[calc(100vh-320px)]">
                        <ChallengeList status="Completed" />
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bonds">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Bonds</h1>
              <Card className="overflow-hidden">
                <BondManagement />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="funds">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Mutual Funds</h1>
              <Card className="overflow-hidden">
                <FundManagement />
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
              <Card className="overflow-hidden">
                <SubscriptionManagement />
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="fx">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">FX Futures</h1>
              <Card className="overflow-hidden">
                <FxFutureManagement />
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="commodities">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Commodities</h1>
              <Card className="overflow-hidden">
                <CommodityManagement />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ads">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Ads Management</h1>
              <Card className="overflow-hidden">
                <AdsManagement />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="research">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Research</h1>
              <Card className="overflow-hidden">
                <ResearchBackoffice />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
              <Card className="overflow-hidden">
                <Reports />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hr">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">HR & Roles</h1>
              <Card className="overflow-hidden">
                <Tabs value={activeHRTab} onValueChange={setActiveHRTab} className="w-full">
                  <div className="px-6 pt-6 border-b">
                    <TabsList className="bg-transparent border rounded-lg p-1">
                      <TabsTrigger 
                        value="staff"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
                      >
                        Staff Management
                      </TabsTrigger>
                      <TabsTrigger 
                        value="roles"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
                      >
                        Roles & Permissions
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="staff" className="p-6">
                    <ScrollArea className="h-[calc(100vh-280px)]">
                      <HRManagement />
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="roles" className="p-6">
                    <ScrollArea className="h-[calc(100vh-280px)]">
                      <RoleManagement />
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounting">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>
              <Card className="overflow-hidden">
                <AccountingManagement />
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RequireAuth>
  )
}