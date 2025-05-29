'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { UserPortfolio, PortfolioPerformance } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, PieChart, BarChart, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export function Portfolio() {
  const { user, stocks } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<UserPortfolio>({});
  const [performance, setPerformance] = useState<PortfolioPerformance | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('1M'); // 1D, 1W, 1M, 3M, 1Y, ALL
  
  // Fetch portfolio data when component mounts or user changes
  useEffect(() => {
    async function fetchPortfolio() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch comprehensive portfolio data from the users API endpoint
        const response = await fetch(`/api/users/portfolio?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch portfolio: ${response.status}`);
        }
        
        const data = await response.json();
        setPortfolio(data.portfolio);
        setPerformance(data.performance);
        
        // Generate mock historical data based on current performance
        // In a real app, this would be fetched from an API
        generateHistoricalData(data.performance?.totalValue || 0);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        // Fallback to trading API if users API fails
        try {
          const fallbackResponse = await fetch(`/api/trading/portfolio?userId=${user.id}`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setPortfolio(fallbackData.portfolio);
          }
        } catch (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    // Generate mock historical data for the chart
    function generateHistoricalData(currentValue: number) {
      const now = new Date();
      const data = [];
      
      // Generate data points based on the selected timeframe
      let points = 30; // Default for 1M
      let interval = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      
      if (timeframe === '1D') {
        points = 24;
        interval = 60 * 60 * 1000; // 1 hour
      } else if (timeframe === '1W') {
        points = 7;
        interval = 24 * 60 * 60 * 1000; // 1 day
      } else if (timeframe === '3M') {
        points = 90;
        interval = 24 * 60 * 60 * 1000; // 1 day
      } else if (timeframe === '1Y') {
        points = 12;
        interval = 30 * 24 * 60 * 60 * 1000; // 1 month
      }
      
      // Start with the current value and work backwards with random variations
      let value = currentValue;
      for (let i = points - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * interval));
        // Random variation between -2% and +2%
        const change = (Math.random() * 4 - 2) / 100;
        // For earlier points, reduce the value slightly to show growth trend
        const trendFactor = 1 - (i / points) * 0.1;
        value = value * (1 - change) * trendFactor;
        
        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(value)
        });
      }
      
      // Add the current value as the last point
      data.push({
        date: now.toISOString().split('T')[0],
        value: currentValue
      });
      
      setHistoricalData(data);
    }
    
    fetchPortfolio();
  }, [user, timeframe]);
  
  // Refetch when timeframe changes
  useEffect(() => {
    if (performance?.totalValue) {
      generateHistoricalData(performance.totalValue);
    }
  }, [timeframe, performance?.totalValue]);
  
  function generateHistoricalData(currentValue: number) {
    const now = new Date();
    const data = [];
    
    // Generate data points based on the selected timeframe
    let points = 30; // Default for 1M
    let interval = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    
    if (timeframe === '1D') {
      points = 24;
      interval = 60 * 60 * 1000; // 1 hour
    } else if (timeframe === '1W') {
      points = 7;
      interval = 24 * 60 * 60 * 1000; // 1 day
    } else if (timeframe === '3M') {
      points = 90;
      interval = 24 * 60 * 60 * 1000; // 1 day
    } else if (timeframe === '1Y') {
      points = 12;
      interval = 30 * 24 * 60 * 60 * 1000; // 1 month
    }
    
    // Start with the current value and work backwards with random variations
    let value = currentValue;
    for (let i = points - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * interval));
      // Random variation between -2% and +2%
      const change = (Math.random() * 4 - 2) / 100;
      // For earlier points, reduce the value slightly to show growth trend
      const trendFactor = 1 - (i / points) * 0.1;
      value = value * (1 - change) * trendFactor;
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value)
      });
    }
    
    // Add the current value as the last point
    data.push({
      date: now.toISOString().split('T')[0],
      value: currentValue
    });
    
    setHistoricalData(data);
  }

  if (!user) return null;

  const getStockCurrentPrice = (symbol: string) => {
    return stocks.find((s) => s.symbol === symbol)?.price || 0;
  };

  const calculatePositionValue = (symbol: string, quantity: number) => {
    const currentPrice = getStockCurrentPrice(symbol);
    return currentPrice * quantity;
  };

  const calculateProfitLoss = (symbol: string) => {
    const position = portfolio[symbol];
    if (!position) return 0;
    const currentValue = calculatePositionValue(symbol, position.quantity);
    const costBasis = position.averagePrice * position.quantity;
    return currentValue - costBasis;
  };
  
  // Calculate total portfolio value and gain/loss
  const totalPortfolioValue = performance?.totalValue || 
    Object.entries(portfolio).reduce((sum, [symbol, position]) => {
      return sum + calculatePositionValue(symbol, position.quantity);
    }, 0);
    
  const totalGainLoss = performance?.totalGainLoss ||
    Object.entries(portfolio).reduce((sum, [symbol, position]) => {
      return sum + calculateProfitLoss(symbol);
    }, 0);
  
  // Calculate portfolio allocation for pie chart
  const portfolioAllocation = Object.entries(portfolio).map(([symbol, position]) => {
    const value = calculatePositionValue(symbol, position.quantity);
    return {
      name: symbol,
      value: (value / totalPortfolioValue) * 100
    };
  });
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];
  
  // Format currency
  const formatCurrency = (value: number) => {
    return `TZS ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Portfolio Summary</CardTitle>
              <CardDescription>Your investment overview</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
              <div className={`flex items-center ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLoss >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span>
                  {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
                  {' '}({((totalGainLoss / (totalPortfolioValue - totalGainLoss)) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="allocation">Allocation</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Performance Chart */}
                  <div className="h-[300px] border rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-2">Portfolio Value</h3>
                    <div className="flex space-x-2 mb-4">
                      {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
                        <Button 
                          key={tf} 
                          variant={timeframe === tf ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimeframe(tf)}
                        >
                          {tf}
                        </Button>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => {
                            if (timeframe === '1D') {
                              return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            }
                            return date;
                          }}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `TZS ${(value / 1000).toFixed(0)}k`}
                          tick={{ fontSize: 12 }}
                        />
                        <RechartsTooltip 
                          formatter={(value: any) => [formatCurrency(value), 'Portfolio Value']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#0088FE" 
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Allocation Pie Chart */}
                  <div className="h-[300px] border rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-4">Asset Allocation</h3>
                    <ResponsiveContainer width="100%" height="90%">
                      <RechartsPieChart>
                        <Pie
                          data={portfolioAllocation}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {portfolioAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip formatter={(value: any) => [`${value.toFixed(2)}%`, 'Allocation']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>
              
              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Card className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Total Value</div>
                    <div className="text-2xl font-bold mt-1">{formatCurrency(totalPortfolioValue)}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Total Gain/Loss</div>
                    <div className={`text-2xl font-bold mt-1 ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Return</div>
                    <div className={`text-2xl font-bold mt-1 ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalGainLoss >= 0 ? '+' : ''}{((totalGainLoss / (totalPortfolioValue - totalGainLoss)) * 100).toFixed(2)}%
                    </div>
                  </Card>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-4">Holdings Performance</h3>
                  <div className="space-y-4">
                    {performance?.holdings ? (
                      // Use performance data if available
                      performance.holdings.map((holding) => (
                        <div key={holding.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{holding.symbol}</h4>
                            <p className="text-sm text-muted-foreground">
                              {holding.quantity} shares @ {formatCurrency(holding.averagePrice)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(holding.value)}</p>
                            <p className={`text-sm ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {holding.gainLoss >= 0 ? '+' : ''}{formatCurrency(holding.gainLoss)}
                              {' '}({((holding.gainLoss / (holding.value - holding.gainLoss)) * 100).toFixed(2)}%)
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Fallback to portfolio data
                      Object.entries(portfolio).map(([symbol, position]) => (
                        <div
                          key={symbol}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{symbol}</h4>
                            <p className="text-sm text-muted-foreground">
                              {position.quantity} shares @ {formatCurrency(position.averagePrice)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(calculatePositionValue(symbol, position.quantity))}
                            </p>
                            <p
                              className={`text-sm ${
                                calculateProfitLoss(symbol) >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {calculateProfitLoss(symbol) >= 0 ? '+' : ''}{formatCurrency(calculateProfitLoss(symbol))}
                              {' '}({((calculateProfitLoss(symbol) / (calculatePositionValue(symbol, position.quantity) - calculateProfitLoss(symbol))) * 100).toFixed(2)}%)
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {!isLoading && Object.keys(portfolio).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No positions yet. Start trading to build your portfolio!
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* Allocation Tab */}
              <TabsContent value="allocation" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-4">Asset Allocation</h3>
                    <div className="space-y-4">
                      {portfolioAllocation.map((asset, index) => (
                        <div key={asset.name} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{asset.name}</span>
                            <span className="text-sm">{asset.value.toFixed(2)}%</span>
                          </div>
                          <Progress value={asset.value} className="h-2" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                            <div 
                              className="h-full" 
                              style={{ 
                                width: `${asset.value}%`, 
                                backgroundColor: COLORS[index % COLORS.length] 
                              }}
                            />
                          </Progress>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-4">Diversification Analysis</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Diversification Score</span>
                        <span className="text-sm font-medium">
                          {portfolioAllocation.length > 3 ? 'Good' : portfolioAllocation.length > 1 ? 'Fair' : 'Poor'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Number of Assets</span>
                        <span className="text-sm font-medium">{portfolioAllocation.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Largest Position</span>
                        <span className="text-sm font-medium">
                          {portfolioAllocation.length > 0 ? 
                            `${portfolioAllocation.sort((a, b) => b.value - a.value)[0].name} (${portfolioAllocation.sort((a, b) => b.value - a.value)[0].value.toFixed(2)}%)` : 
                            'N/A'}
                        </span>
                      </div>
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                        <ul className="text-sm space-y-2 list-disc pl-5">
                          {portfolioAllocation.length === 0 && (
                            <li>Start building your portfolio by adding some assets.</li>
                          )}
                          {portfolioAllocation.length === 1 && (
                            <li>Consider diversifying your portfolio by adding more assets to reduce risk.</li>
                          )}
                          {portfolioAllocation.length > 0 && portfolioAllocation.sort((a, b) => b.value - a.value)[0].value > 50 && (
                            <li>Your portfolio is heavily concentrated in {portfolioAllocation.sort((a, b) => b.value - a.value)[0].name}. Consider reducing this position to lower risk.</li>
                          )}
                          {portfolioAllocation.length > 0 && portfolioAllocation.length < 5 && (
                            <li>Adding more assets from different sectors could improve diversification.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
