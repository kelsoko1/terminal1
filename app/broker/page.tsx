'use client'

import { useState } from 'react'
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
import { Plus } from 'lucide-react'
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

export default function BrokerBackOffice() {
  const { checkAccess, user } = useAuth()
  const [showNewChallenge, setShowNewChallenge] = useState(false)
  const [activeHRTab, setActiveHRTab] = useState('staff')

  const isKelsokoAdmin = user?.role === 'kelsoko_admin'

  return (
    <RequireAuth requiredRole="broker">
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Broker Back Office</h1>
        
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            {isKelsokoAdmin && (
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
            )}
            <TabsTrigger value="clients">Client Management</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="bonds">Bonds</TabsTrigger>
            <TabsTrigger value="funds">Mutual Funds</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="fx">FX Futures</TabsTrigger>
            <TabsTrigger value="commodities">Commodities</TabsTrigger>
            <TabsTrigger value="ads">Ads Management</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            
            {checkAccess('hr') && (
              <TabsTrigger value="hr">HR & Roles</TabsTrigger>
            )}
            
            {(checkAccess('admin') || checkAccess('accounting')) && (
              <TabsTrigger value="accounting">Accounting</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard">
            <BrokerDashboard />
          </TabsContent>

          {isKelsokoAdmin && (
            <TabsContent value="organizations">
              <OrganizationManagement />
            </TabsContent>
          )}

          <TabsContent value="clients">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="stocks">
            <StockManagement />
          </TabsContent>

          <TabsContent value="challenges">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-semibold">Trading Challenges</h2>
                <Button 
                  onClick={() => setShowNewChallenge(true)}
                  className="ml-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Challenge
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3 p-6 border-b bg-muted/10">
                <ChallengeStats />
              </div>

              {showNewChallenge ? (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Create New Challenge</h3>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowNewChallenge(false)}
                    >
                      Back to List
                    </Button>
                  </div>
                  <CreateChallengeForm onSuccess={() => setShowNewChallenge(false)} />
                </div>
              ) : (
                <Tabs defaultValue="active" className="w-full">
                  <div className="px-6 border-b">
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
                    <ChallengeList status="Active" />
                  </TabsContent>
                  
                  <TabsContent value="draft" className="p-6">
                    <ChallengeList status="Draft" />
                  </TabsContent>
                  
                  <TabsContent value="completed" className="p-6">
                    <ChallengeList status="Completed" />
                  </TabsContent>
                </Tabs>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="bonds">
            <BondManagement />
          </TabsContent>

          <TabsContent value="funds">
            <FundManagement />
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <Card className="overflow-hidden">
              <SubscriptionManagement />
            </Card>
          </TabsContent>
          
          <TabsContent value="fx">
            <FxFutureManagement />
          </TabsContent>
          
          <TabsContent value="commodities">
            <CommodityManagement />
          </TabsContent>

          <TabsContent value="ads">
            <Card className="overflow-hidden">
              <AdsManagement />
            </Card>
          </TabsContent>

          <TabsContent value="research">
            <ResearchBackoffice />
          </TabsContent>

          <TabsContent value="reports">
            <Reports />
          </TabsContent>

          <TabsContent value="hr">
            <Card className="overflow-hidden">
              <Tabs value={activeHRTab} onValueChange={setActiveHRTab} className="w-full">
                <div className="px-6 border-b">
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
                  <HRManagement />
                </TabsContent>
                
                <TabsContent value="roles" className="p-6">
                  <RoleManagement />
                </TabsContent>
              </Tabs>
            </Card>
          </TabsContent>

          <TabsContent value="accounting">
            <AccountingManagement />
          </TabsContent>
        </Tabs>
      </div>
    </RequireAuth>
  )
}