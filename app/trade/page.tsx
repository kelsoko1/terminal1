'use client'

import { useState } from 'react'
import { Coins, LineChart, Briefcase, RefreshCw, Package } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { AssetTypeBubble } from '@/components/trading/AssetTypeBubble'
import { StockSelector } from '@/components/trading/StockSelector'
import { TradingWidget } from '@/components/trading/TradingWidget'
import { BondTrading } from '@/components/trading/BondTrading'
import { FundTrading } from '@/components/trading/FundTrading'
import { FxFutureTrading } from '@/components/trading/FxFutureTrading'
import { CommodityTrading } from '@/components/trading/CommodityTrading'
import dynamic from 'next/dynamic'

// Dynamically import TradingView widget to avoid SSR issues
const TradingViewWidget = dynamic(
  () => import('@/components/TradingViewWidget'),
  { ssr: false }
)

type AssetType = 'stocks' | 'bonds' | 'funds' | 'fx' | 'commodities'

interface Stock {
  symbol: string
  name: string
  sector: string
}

export default function TradePage() {
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>('stocks')
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([])

  // Mock data for the trading widget
  const mockPriceData = {
    'CRDB': { price: 350, change: 2.5, volume: 150000 },
    'TBL': { price: 890, change: -1.2, volume: 75000 },
    'DSE': { price: 1200, change: 0.8, volume: 45000 },
  }

  return (
    <div className="container py-6">
      {/* Asset Type Selection */}
      <div className="flex justify-center gap-6 mb-8">
        <AssetTypeBubble
          label="Stocks"
          icon={<LineChart />}
          isSelected={selectedAssetType === 'stocks'}
          onClick={() => setSelectedAssetType('stocks')}
        />
        <AssetTypeBubble
          label="Bonds"
          icon={<Coins />}
          isSelected={selectedAssetType === 'bonds'}
          onClick={() => setSelectedAssetType('bonds')}
        />
        <AssetTypeBubble
          label="Funds"
          icon={<Briefcase />}
          isSelected={selectedAssetType === 'funds'}
          onClick={() => setSelectedAssetType('funds')}
        />
        <AssetTypeBubble
          label="FX Futures"
          icon={<RefreshCw />}
          isSelected={selectedAssetType === 'fx'}
          onClick={() => setSelectedAssetType('fx')}
        />
        <AssetTypeBubble
          label="Commodities"
          icon={<Package />}
          isSelected={selectedAssetType === 'commodities'}
          onClick={() => setSelectedAssetType('commodities')}
        />
      </div>

      {selectedAssetType === 'stocks' && (
        <>
          {/* Stock Selection */}
          <div className="mb-6">
            <StockSelector
              selectedStocks={selectedStocks}
              onSelectStock={(stock) => setSelectedStocks([...selectedStocks, stock])}
              onRemoveStock={(symbol) => 
                setSelectedStocks(selectedStocks.filter(s => s.symbol !== symbol))
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-3">
              <Card className="p-4 h-[600px]">
                <TradingViewWidget />
              </Card>
            </div>

            {/* Trading Widgets */}
            <div className="space-y-6">
              {selectedStocks.map(stock => {
                const data = mockPriceData[stock.symbol as keyof typeof mockPriceData] || {
                  price: 0,
                  change: 0,
                  volume: 0
                }
                
                return (
                  <TradingWidget
                    key={stock.symbol}
                    symbol={stock.symbol}
                    currentPrice={data.price}
                    change={data.change}
                    volume={data.volume}
                  />
                )
              })}
            </div>
          </div>
        </>
      )}

      {selectedAssetType === 'bonds' && (
        <BondTrading />
      )}

      {selectedAssetType === 'funds' && (
        <FundTrading />
      )}

      {selectedAssetType === 'fx' && (
        <FxFutureTrading />
      )}

      {selectedAssetType === 'commodities' && (
        <CommodityTrading />
      )}
    </div>
  )
}