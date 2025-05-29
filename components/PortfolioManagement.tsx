'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export default function PortfolioManagement() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubTab, setActiveSubTab] = useState('summary');
  const [portfolioData, setPortfolioData] = useState({
    summary: {
      cashBalance: 0,
      totalAssets: 0,
      grossPL: 0,
      netPL: 0,
      totalCosts: 0,
      roiPercentage: 0
    },
    performanceData: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/portfolio/summary?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch portfolio data: ${response.status}`);
        }
        
        const data = await response.json();
        setPortfolioData(data);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPortfolioData();
  }, [user?.id]);

  // Format numbers for display
  const formatTZS = (value: number) => formatCurrency(value, 'TZS', 'en-TZ');
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Portfolio Management</h1>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="accounting">Accounting</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Tabs defaultValue="summary" value={activeSubTab} onValueChange={setActiveSubTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="pnl">P&L Statement</TabsTrigger>
              <TabsTrigger value="tax">Tax Analysis</TabsTrigger>
              <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Cash Balance</div>
                    <div className="text-2xl font-bold">
                      {formatTZS(portfolioData.summary.cashBalance)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Total Assets</div>
                    <div className="text-2xl font-bold">
                      {formatTZS(portfolioData.summary.totalAssets)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Return on Investment</div>
                    <div className="text-2xl font-bold text-green-500">
                      {formatPercentage(portfolioData.summary.roiPercentage)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Gross P&L</div>
                    <div className="text-2xl font-bold text-green-500">
                      {formatTZS(portfolioData.summary.grossPL)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Net P&L</div>
                    <div className="text-2xl font-bold text-green-500">
                      {formatTZS(portfolioData.summary.netPL)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Total Costs</div>
                    <div className="text-2xl font-bold text-red-500">
                      {formatTZS(portfolioData.summary.totalCosts)}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Performance Breakdown</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={portfolioData.performanceData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [`TZS ${Number(value).toLocaleString()}`, 'Value']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulative_pl" 
                        stroke="#4ade80" 
                        activeDot={{ r: 8 }} 
                        name="Cumulative P&L"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
            
            {/* Other tab contents would go here */}
            <TabsContent value="transactions">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Transaction history will be displayed here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="pnl">
              <div className="text-center py-8">
                <p className="text-muted-foreground">P&L Statement will be displayed here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="tax">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Tax Analysis will be displayed here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="ratios">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Financial Ratios will be displayed here</p>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Other main tab contents would go here */}
        <TabsContent value="analytics">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Analytics will be displayed here</p>
          </div>
        </TabsContent>
        
        <TabsContent value="accounting">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Accounting will be displayed here</p>
          </div>
        </TabsContent>
        
        <TabsContent value="challenges">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Challenges will be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
