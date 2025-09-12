'use client'

import { marketData } from '@/lib/data/markets'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { CorporateBond, Fund, Instrument } from '@/lib/types/market'

interface MarketListProps {
  type: 'stocks' | 'bonds' | 'corporate_bonds' | 'funds'
  searchQuery: string
}

export function MarketList({ type, searchQuery }: MarketListProps) {
  const router = useRouter()

  const instruments = marketData
    .find(group => group.type === type)
    ?.regions.flatMap(region => 
      region.exchanges.flatMap(exchange => exchange.instruments)
    ).filter(instrument => 
      instrument.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instrument.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  const renderInstrumentDetails = (instrument: Instrument) => {
    switch (instrument.type) {
      case 'stocks':
        return (
          <>
            <td className="p-4 text-right">
              <span className="text-lg">TZS {instrument.price.toLocaleString()}</span>
            </td>
            <td className={`p-4 text-right ${instrument.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {instrument.change >= 0 ? (
                <ArrowUpRight className="inline h-4 w-4" />
              ) : (
                <ArrowDownRight className="inline h-4 w-4" />
              )}
              {Math.abs(instrument.change)}%
            </td>
            <td className="p-4 text-right">{instrument.volume.toLocaleString()}</td>
            <td className="p-4 text-right">{instrument.marketCap}</td>
            <td className="p-4">{instrument.sector}</td>
          </>
        )

      case 'bonds':
        return (
          <>
            <td className="p-4 text-right">
              <span className="text-lg">TZS {instrument.price.toLocaleString()}</span>
            </td>
            <td className="p-4 text-right">{instrument.yield}%</td>
            <td className="p-4">{instrument.maturity}</td>
            <td className="p-4">{instrument.issuer}</td>
          </>
        )

      case 'corporate_bonds':
        const corporateBond = instrument as CorporateBond
        return (
          <>
            <td className="p-4 text-right">
              <span className="text-lg">TZS {corporateBond.price.toLocaleString()}</span>
            </td>
            <td className="p-4 text-right">{corporateBond.yield}%</td>
            <td className="p-4 text-right">{corporateBond.couponRate}%</td>
            <td className="p-4">{corporateBond.rating}</td>
            <td className="p-4">{corporateBond.maturity}</td>
            <td className="p-4">{corporateBond.issueSize}</td>
            <td className="p-4">{new Date(corporateBond.nextPayment).toLocaleDateString()}</td>
          </>
        )

      case 'funds':
        const fund = instrument as Fund
        return (
          <>
            <td className="p-4 text-right">
              <span className="text-lg">TZS {fund.nav.toLocaleString()}</span>
            </td>
            <td className={`p-4 text-right ${fund.ytdReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fund.ytdReturn >= 0 ? (
                <ArrowUpRight className="inline h-4 w-4" />
              ) : (
                <ArrowDownRight className="inline h-4 w-4" />
              )}
              {Math.abs(fund.ytdReturn)}%
            </td>
            <td className="p-4">{fund.category.replace('_', ' ').toUpperCase()}</td>
            <td className="p-4">{fund.aum}</td>
            <td className="p-4">{fund.manager}</td>
            <td className="p-4">{fund.minimumInvestment}</td>
            <td className="p-4">{fund.managementFee}</td>
          </>
        )
    }
  }

  const renderTableHeaders = () => {
    switch (type) {
      case 'stocks':
        return (
          <tr className="border-b">
            <th className="text-left p-4">Symbol</th>
            <th className="text-left p-4">Name</th>
            <th className="text-right p-4">Price (TZS)</th>
            <th className="text-right p-4">Change</th>
            <th className="text-right p-4">Volume</th>
            <th className="text-right p-4">Market Cap</th>
            <th className="text-left p-4">Sector</th>
          </tr>
        )

      case 'bonds':
        return (
          <tr className="border-b">
            <th className="text-left p-4">Symbol</th>
            <th className="text-left p-4">Name</th>
            <th className="text-right p-4">Price (TZS)</th>
            <th className="text-right p-4">Yield</th>
            <th className="text-left p-4">Maturity</th>
            <th className="text-left p-4">Issuer</th>
          </tr>
        )

      case 'corporate_bonds':
        return (
          <tr className="border-b">
            <th className="text-left p-4">Symbol</th>
            <th className="text-left p-4">Name</th>
            <th className="text-right p-4">Price (TZS)</th>
            <th className="text-right p-4">Yield</th>
            <th className="text-right p-4">Coupon</th>
            <th className="text-left p-4">Rating</th>
            <th className="text-left p-4">Maturity</th>
            <th className="text-left p-4">Issue Size</th>
            <th className="text-left p-4">Next Payment</th>
          </tr>
        )

      case 'funds':
        return (
          <tr className="border-b">
            <th className="text-left p-4">Symbol</th>
            <th className="text-left p-4">Name</th>
            <th className="text-right p-4">NAV (TZS)</th>
            <th className="text-right p-4">YTD Return</th>
            <th className="text-left p-4">Category</th>
            <th className="text-left p-4">AUM</th>
            <th className="text-left p-4">Manager</th>
            <th className="text-left p-4">Min Investment</th>
            <th className="text-left p-4">Management Fee</th>
          </tr>
        )
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          {renderTableHeaders()}
        </thead>
        <tbody>
          {instruments.map((instrument) => (
            <tr key={instrument.symbol} className="border-b hover:bg-muted/50 cursor-pointer">
              <td className="p-4 font-medium">{instrument.symbol}</td>
              <td className="p-4 text-muted-foreground">{instrument.name}</td>
              {renderInstrumentDetails(instrument)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 