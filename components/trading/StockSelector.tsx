'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Stock {
  symbol: string
  name: string
  sector: string
}

// Mock DSE listed stocks
const DSE_STOCKS: Stock[] = [
  { symbol: 'CRDB', name: 'CRDB Bank Plc', sector: 'Banking' },
  { symbol: 'DCB', name: 'DCB Commercial Bank Plc', sector: 'Banking' },
  { symbol: 'DSE', name: 'Dar es Salaam Stock Exchange PLC', sector: 'Financial Services' },
  { symbol: 'EABL', name: 'East African Breweries Ltd', sector: 'Consumer Goods' },
  { symbol: 'JHL', name: 'Jubilee Holdings Ltd', sector: 'Insurance' },
  { symbol: 'KA', name: 'Kenya Airways Ltd', sector: 'Transportation' },
  { symbol: 'KCB', name: 'KCB Group Plc', sector: 'Banking' },
  { symbol: 'NMG', name: 'Nation Media Group', sector: 'Media' },
  { symbol: 'PAL', name: 'Precision Air Services Plc', sector: 'Transportation' },
  { symbol: 'TBL', name: 'Tanzania Breweries Ltd', sector: 'Consumer Goods' },
  { symbol: 'TCC', name: 'Tanzania Cigarette Co Ltd', sector: 'Consumer Goods' },
  { symbol: 'TCCL', name: 'Tanga Cement Company Ltd', sector: 'Industrial' },
  { symbol: 'TOL', name: 'Tanzania Oxygen Ltd', sector: 'Industrial' },
  { symbol: 'TPCC', name: 'Tanzania Portland Cement Co Ltd', sector: 'Industrial' },
  { symbol: 'TTP', name: 'Tanzania Tea Packers Ltd', sector: 'Consumer Goods' },
]

interface StockSelectorProps {
  selectedStocks: Stock[]
  onSelectStock: (stock: Stock) => void
  onRemoveStock: (symbol: string) => void
}

export function StockSelector({ selectedStocks, onSelectStock, onRemoveStock }: StockSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-wrap gap-2">
      {selectedStocks.map((stock) => (
        <Badge
          key={stock.symbol}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {stock.symbol}
          <button
            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onRemoveStock(stock.symbol)
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={() => onRemoveStock(stock.symbol)}
          >
            ×
          </button>
        </Badge>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-10 justify-between"
          >
            Add stocks...
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search stocks..." />
            <CommandEmpty>No stocks found.</CommandEmpty>
            <CommandGroup>
              {DSE_STOCKS.filter(stock => 
                !selectedStocks.some(s => s.symbol === stock.symbol)
              ).map((stock) => (
                <CommandItem
                  key={stock.symbol}
                  value={stock.symbol}
                  onSelect={() => {
                    onSelectStock(stock)
                    setOpen(false)
                  }}
                >
                  <div className="flex flex-col">
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-muted-foreground">{stock.name}</div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedStocks.some(s => s.symbol === stock.symbol)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
