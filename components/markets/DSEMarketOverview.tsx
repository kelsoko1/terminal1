import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { marketData } from '@/lib/data/markets'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DSEMarketOverviewProps {
  onSymbolSelect: (symbol: string) => void
}

export function DSEMarketOverview({ onSymbolSelect }: DSEMarketOverviewProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US')
  }

  const renderChangeIndicator = (change: number) => (
    <span className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
      {change >= 0 ? (
        <ArrowUpRight className="h-4 w-4" />
      ) : (
        <ArrowDownRight className="h-4 w-4" />
      )}
      {Math.abs(change)}%
    </span>
  )

  // Generate mock bid/ask prices based on last price
  const getBidAsk = (price: number) => {
    const spread = price * 0.002 // 0.2% spread
    return {
      bid: price - spread / 2,
      ask: price + spread / 2
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>DSE Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="main-market">
          <TabsList className="grid w-full grid-cols-6 mb-4">
            <TabsTrigger value="main-market">Main Market</TabsTrigger>
            <TabsTrigger value="egm">EGM</TabsTrigger>
            <TabsTrigger value="cross-listed">Cross-Listed</TabsTrigger>
            <TabsTrigger value="bonds">Bonds</TabsTrigger>
            <TabsTrigger value="reits">REITs</TabsTrigger>
            <TabsTrigger value="funds">Funds</TabsTrigger>
          </TabsList>

          <TabsContent value="main-market">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Symbol</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-right">Bid</th>
                    <th className="p-2 text-right">Ask</th>
                    <th className="p-2 text-right">Last Price</th>
                    <th className="p-2 text-right">Change</th>
                    <th className="p-2 text-right">Volume</th>
                    <th className="p-2 text-right">Market Cap</th>
                    <th className="p-2 text-center">Trade</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData
                    .find(group => group.type === 'stocks')
                    ?.regions.find(region => region.name === 'Main Investment Market')
                    ?.exchanges[0].instruments.map(stock => {
                      const { bid, ask } = getBidAsk(stock.price)
                      return (
                        <tr key={stock.symbol} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{stock.symbol}</td>
                          <td className="p-2">{stock.name}</td>
                          <td className="p-2 text-right text-green-600">{formatNumber(bid)}</td>
                          <td className="p-2 text-right text-red-600">{formatNumber(ask)}</td>
                          <td className="p-2 text-right">{formatNumber(stock.price)}</td>
                          <td className="p-2 text-right">{renderChangeIndicator(stock.change)}</td>
                          <td className="p-2 text-right">{formatNumber(stock.volume)}</td>
                          <td className="p-2 text-right">{stock.marketCap}</td>
                          <td className="p-2 text-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onSymbolSelect(stock.symbol)}
                            >
                              Trade
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="egm">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Symbol</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-right">Bid</th>
                    <th className="p-2 text-right">Ask</th>
                    <th className="p-2 text-right">Last Price</th>
                    <th className="p-2 text-right">Change</th>
                    <th className="p-2 text-right">Volume</th>
                    <th className="p-2 text-right">Market Cap</th>
                    <th className="p-2 text-center">Trade</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData
                    .find(group => group.type === 'stocks')
                    ?.regions.find(region => region.name === 'Enterprise Growth Market')
                    ?.exchanges[0].instruments.map(stock => {
                      const { bid, ask } = getBidAsk(stock.price)
                      return (
                        <tr key={stock.symbol} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{stock.symbol}</td>
                          <td className="p-2">{stock.name}</td>
                          <td className="p-2 text-right text-green-600">{formatNumber(bid)}</td>
                          <td className="p-2 text-right text-red-600">{formatNumber(ask)}</td>
                          <td className="p-2 text-right">{formatNumber(stock.price)}</td>
                          <td className="p-2 text-right">{renderChangeIndicator(stock.change)}</td>
                          <td className="p-2 text-right">{formatNumber(stock.volume)}</td>
                          <td className="p-2 text-right">{stock.marketCap}</td>
                          <td className="p-2 text-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onSymbolSelect(stock.symbol)}
                            >
                              Trade
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="cross-listed">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Symbol</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-right">Bid</th>
                    <th className="p-2 text-right">Ask</th>
                    <th className="p-2 text-right">Last Price</th>
                    <th className="p-2 text-right">Change</th>
                    <th className="p-2 text-right">Volume</th>
                    <th className="p-2 text-left">Home Exchange</th>
                    <th className="p-2 text-center">Trade</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData
                    .find(group => group.type === 'stocks')
                    ?.regions.find(region => region.name === 'Cross-Listed Securities')
                    ?.exchanges[0].instruments.map(stock => {
                      const { bid, ask } = getBidAsk(stock.price)
                      return (
                        <tr key={stock.symbol} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{stock.symbol}</td>
                          <td className="p-2">{stock.name}</td>
                          <td className="p-2 text-right text-green-600">{formatNumber(bid)}</td>
                          <td className="p-2 text-right text-red-600">{formatNumber(ask)}</td>
                          <td className="p-2 text-right">{formatNumber(stock.price)}</td>
                          <td className="p-2 text-right">{renderChangeIndicator(stock.change)}</td>
                          <td className="p-2 text-right">{formatNumber(stock.volume)}</td>
                          <td className="p-2">{(stock as any).homeExchange}</td>
                          <td className="p-2 text-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onSymbolSelect(stock.symbol)}
                            >
                              Trade
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="bonds">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Symbol</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-right">Bid</th>
                    <th className="p-2 text-right">Ask</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Yield (%)</th>
                    <th className="p-2 text-right">Change</th>
                    <th className="p-2 text-left">Maturity</th>
                    <th className="p-2 text-center">Trade</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData
                    .find(group => group.type === 'bonds')
                    ?.regions[0].exchanges[0].instruments.map(bond => {
                      const { bid, ask } = getBidAsk(bond.price)
                      return (
                        <tr key={bond.symbol} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{bond.symbol}</td>
                          <td className="p-2">{bond.name}</td>
                          <td className="p-2 text-right text-green-600">{formatNumber(bid)}</td>
                          <td className="p-2 text-right text-red-600">{formatNumber(ask)}</td>
                          <td className="p-2 text-right">{formatNumber(bond.price)}</td>
                          <td className="p-2 text-right">{bond.yield.toFixed(2)}</td>
                          <td className="p-2 text-right">{renderChangeIndicator(bond.change)}</td>
                          <td className="p-2">{bond.maturity}</td>
                          <td className="p-2 text-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onSymbolSelect(bond.symbol)}
                            >
                              Trade
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="reits">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Symbol</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-right">Bid</th>
                    <th className="p-2 text-right">Ask</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">NAV</th>
                    <th className="p-2 text-right">Yield (%)</th>
                    <th className="p-2 text-right">Occupancy</th>
                    <th className="p-2 text-center">Trade</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData
                    .find(group => group.type === 'reits')
                    ?.regions[0].exchanges[0].instruments.map(reit => {
                      const { bid, ask } = getBidAsk(reit.price)
                      return (
                        <tr key={reit.symbol} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{reit.symbol}</td>
                          <td className="p-2">{reit.name}</td>
                          <td className="p-2 text-right text-green-600">{formatNumber(bid)}</td>
                          <td className="p-2 text-right text-red-600">{formatNumber(ask)}</td>
                          <td className="p-2 text-right">{formatNumber(reit.price)}</td>
                          <td className="p-2 text-right">{reit.nav.toFixed(2)}</td>
                          <td className="p-2 text-right">{reit.yield.toFixed(2)}%</td>
                          <td className="p-2 text-right">{reit.occupancyRate}</td>
                          <td className="p-2 text-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onSymbolSelect(reit.symbol)}
                            >
                              Trade
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="funds">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Symbol</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-right">Bid</th>
                    <th className="p-2 text-right">Ask</th>
                    <th className="p-2 text-right">NAV</th>
                    <th className="p-2 text-right">YTD Return</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-right">Min Investment</th>
                    <th className="p-2 text-center">Trade</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData
                    .find(group => group.type === 'funds')
                    ?.regions[0].exchanges[0].instruments.map(fund => {
                      const { bid, ask } = getBidAsk(fund.price)
                      return (
                        <tr key={fund.symbol} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{fund.symbol}</td>
                          <td className="p-2">{fund.name}</td>
                          <td className="p-2 text-right text-green-600">{formatNumber(bid)}</td>
                          <td className="p-2 text-right text-red-600">{formatNumber(ask)}</td>
                          <td className="p-2 text-right">{fund.nav.toFixed(2)}</td>
                          <td className="p-2 text-right">{renderChangeIndicator(fund.ytdReturn)}</td>
                          <td className="p-2 capitalize">{fund.category.replace('_', ' ')}</td>
                          <td className="p-2 text-right">{fund.minimumInvestment}</td>
                          <td className="p-2 text-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onSymbolSelect(fund.symbol)}
                            >
                              Trade
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 