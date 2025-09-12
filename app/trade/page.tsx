'use client'

import { useState } from 'react'
import { Coins, LineChart, Briefcase, RefreshCw, Package } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { AssetTypeBubble } from '@/components/trading/AssetTypeBubble'
import { StockSelector } from '@/components/trading/StockSelector'
import { TradingWidget } from '@/components/trading/TradingWidget'
import { BondTrading } from '@/components/trading/BondTrading'
import { FundTrading } from '@/components/trading/FundTrading'
import dynamic from 'next/dynamic'
import { StockTrading } from '@/components/trading/StockTrading'
import { FuturesTrading } from '@/components/trading/FuturesTrading'
import Link from 'next/link';
import PredictionMarketTab from '@/components/trading/PredictionMarketTab';

// Dynamically import TradingView widget to avoid SSR issues
const TradingViewWidget = dynamic(
  () => import('@/components/TradingViewWidget'),
  { ssr: false }
)

type AssetType = 'stocks' | 'bonds' | 'funds' | 'futures' | 'prediction-market';

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
      <div className="overflow-x-auto pb-2 mb-6">
        <div className="flex min-w-max md:justify-center gap-2 md:gap-6">
          <AssetTypeBubble
            label="Stocks"
            icon={<LineChart className="w-4 h-4 md:w-5 md:h-5" />}
            isSelected={selectedAssetType === 'stocks'}
            onClick={() => setSelectedAssetType('stocks')}
          />
          <AssetTypeBubble
            label="Bonds"
            icon={<Coins className="w-4 h-4 md:w-5 md:h-5" />}
            isSelected={selectedAssetType === 'bonds'}
            onClick={() => setSelectedAssetType('bonds')}
          />
          <AssetTypeBubble
            label="Funds"
            icon={<Briefcase className="w-4 h-4 md:w-5 md:h-5" />}
            isSelected={selectedAssetType === 'funds'}
            onClick={() => setSelectedAssetType('funds')}
          />
          <AssetTypeBubble
            label="Futures"
            icon={<Package className="w-4 h-4 md:w-5 md:h-5" />}
            isSelected={selectedAssetType === 'futures'}
            onClick={() => setSelectedAssetType('futures')}
          />
          <AssetTypeBubble
            label="Prediction"
            icon={<RefreshCw className="w-4 h-4 md:w-5 md:h-5" />}
            isSelected={selectedAssetType === 'prediction-market'}
            onClick={() => setSelectedAssetType('prediction-market')}
          />
        </div>
      </div>

      {selectedAssetType === 'stocks' && (
        <StockTrading />
      )}

      {selectedAssetType === 'bonds' && (
        <BondTrading />
      )}

      {selectedAssetType === 'funds' && (
        <FundTrading />
      )}

      {selectedAssetType === 'futures' && (
        // TODO: Connect contracts prop to broker management data for real-time sync
        <FuturesTrading />
      )}
      {selectedAssetType === 'prediction-market' && (
        <div className="mt-6">
          <PredictionMarketTab />
        </div>
      )}
    </div>
  )
}