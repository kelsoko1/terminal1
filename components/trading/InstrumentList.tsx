'use client'

import { Badge } from '@/components/ui/badge'
import { marketData } from '@/lib/data/markets'
import { Instrument } from '@/lib/types/market'

interface InstrumentListProps {
  type: 'stocks' | 'bonds'
  onSelect: (instrument: Instrument) => void
}

export default function InstrumentList({ type, onSelect }: InstrumentListProps) {
  const instruments = marketData
    .find(group => group.type === type)
    ?.regions.flatMap(region => 
      region.exchanges.flatMap(exchange => exchange.instruments)
    ) || []

  return (
    <div className="divide-y">
      {instruments.map((instrument) => (
        <div
          key={instrument.symbol}
          className="p-4 hover:bg-muted cursor-pointer transition-colors"
          onClick={() => onSelect(instrument)}
        >
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="font-medium">{instrument.symbol}</h3>
              <p className="text-sm text-muted-foreground">{instrument.name}</p>
            </div>
            <Badge variant={instrument.type === 'stocks' ? 'default' : 'secondary'}>
              {instrument.type}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg">TZS {instrument.price}</span>
            <span className={instrument.change >= 0 ? 'text-green-600' : 'text-red-600'}>
              {instrument.change >= 0 ? '+' : ''}{instrument.change}%
            </span>
          </div>
        </div>
      ))}
    </div>
  )
} 