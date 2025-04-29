'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Star, TrendingUp, Clock, Percent, BarChart2 } from 'lucide-react'
import { marketData } from '@/lib/data/markets'
import { Instrument } from '@/lib/types/market'

interface MarketDetailProps {
  marketSymbol: string
}

export function MarketDetail({ marketSymbol }: MarketDetailProps) {
  const [instrument, setInstrument] = useState<Instrument | null>(null)
  const [priceHistory] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - i * 3600000).toLocaleTimeString(),
      price: Math.random() * 10 + 90
    })).reverse()
  )

  useEffect(() => {
    // Find the instrument in market data
    for (const group of marketData) {
      for (const region of group.regions) {
        for (const exchange of region.exchanges) {
          const found = exchange.instruments.find(i => i.symbol === marketSymbol)
          if (found) {
            setInstrument(found)
            return
          }
        }
      }
    }
  }, [marketSymbol])

  if (!instrument) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Market Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {instrument.symbol}
            <Button variant="ghost" size="icon">
              <Star className="w-4 h-4" />
            </Button>
          </h1>
          <p className="text-muted-foreground">{instrument.name}</p>
          {instrument.sector && (
            <span className="inline-block px-2 py-1 text-xs bg-muted rounded-full">
              {instrument.sector}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">TZS {instrument.price.toLocaleString()}</div>
          <div className={instrument.change >= 0 ? 'text-green-600' : 'text-red-600'}>
            {instrument.change >= 0 ? '+' : ''}{instrument.change}%
          </div>
        </div>
      </div>

      {/* Market Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {instrument.type === 'stocks' ? (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium">Volume</h3>
              </div>
              <p className="text-2xl mt-2">{instrument.volume?.toLocaleString() ?? 'N/A'}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium">Market Cap</h3>
              </div>
              <p className="text-2xl mt-2">TZS {instrument.marketCap ?? 'N/A'}</p>
            </Card>
          </>
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium">Yield</h3>
              </div>
              <p className="text-2xl mt-2">{instrument.yield}%</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium">Maturity</h3>
              </div>
              <p className="text-2xl mt-2">{instrument.maturity}</p>
            </Card>
          </>
        )}

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium">Trading Hours</h3>
          </div>
          <p className="text-2xl mt-2">10:00 - 15:30</p>
        </Card>
      </div>

      {/* Chart and Trading Interface */}
      <Card className="p-6">
        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="depth">Market Depth</TabsTrigger>
            <TabsTrigger value="trades">Recent Trades</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={['dataMin', 'dataMax']} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8884d8" 
                    name="Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="depth">
            <div className="text-center py-8 text-muted-foreground">
              Market depth data coming soon
            </div>
          </TabsContent>

          <TabsContent value="trades">
            <div className="text-center py-8 text-muted-foreground">
              Recent trades data coming soon
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Trading Buttons */}
      <div className="grid gap-4 md:grid-cols-2">
        <Button className="w-full bg-green-600 hover:bg-green-700">
          Buy {instrument.symbol}
        </Button>
        <Button className="w-full bg-red-600 hover:bg-red-700">
          Sell {instrument.symbol}
        </Button>
      </div>
    </div>
  )
} 