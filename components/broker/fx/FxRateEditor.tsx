'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Upload } from 'lucide-react'

interface CurrencyRate {
  id: string
  currency: string
  baseRate: number
  lastUpdated: string
  source: 'manual' | 'api'
}

// Mock data for currency rates
const mockRates: CurrencyRate[] = [
  {
    id: 'r1',
    currency: 'USD',
    baseRate: 2500,
    lastUpdated: '2025-04-12T08:30:00Z',
    source: 'manual'
  },
  {
    id: 'r2',
    currency: 'EUR',
    baseRate: 2700,
    lastUpdated: '2025-04-12T08:30:00Z',
    source: 'manual'
  },
  {
    id: 'r3',
    currency: 'GBP',
    baseRate: 3100,
    lastUpdated: '2025-04-12T08:30:00Z',
    source: 'manual'
  },
  {
    id: 'r4',
    currency: 'KES',
    baseRate: 18.5,
    lastUpdated: '2025-04-12T08:30:00Z',
    source: 'manual'
  },
  {
    id: 'r5',
    currency: 'ZAR',
    baseRate: 135,
    lastUpdated: '2025-04-12T08:30:00Z',
    source: 'manual'
  }
]

export function FxRateEditor() {
  const [rates, setRates] = useState<CurrencyRate[]>(mockRates)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  // Start editing a rate
  const startEditing = (rate: CurrencyRate) => {
    setEditingId(rate.id)
    setEditValue(rate.baseRate.toString())
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null)
    setEditValue('')
  }

  // Save edited rate
  const saveRate = (id: string) => {
    const newRate = parseFloat(editValue)
    if (isNaN(newRate) || newRate <= 0) {
      alert('Please enter a valid rate')
      return
    }

    setRates(rates.map(rate => 
      rate.id === id 
        ? { 
            ...rate, 
            baseRate: newRate, 
            lastUpdated: new Date().toISOString(),
            source: 'manual'
          } 
        : rate
    ))
    setEditingId(null)
  }

  // Refresh rates from external source (mock)
  const refreshRates = () => {
    // In a real app, this would fetch from an API
    alert('Fetching latest rates from external source...')
    
    // Mock updated rates
    const updatedRates = rates.map(rate => ({
      ...rate,
      baseRate: rate.baseRate * (1 + (Math.random() * 0.02 - 0.01)), // Random fluctuation ±1%
      lastUpdated: new Date().toISOString(),
      source: 'api' as const
    }))
    
    setRates(updatedRates)
  }

  // Import rates from file (mock)
  const importRates = () => {
    // In a real app, this would open a file dialog
    alert('This would open a file import dialog in a real application')
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Base Currency Rates</h3>
          <p className="text-muted-foreground">
            Manage base exchange rates for all supported currencies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={importRates}>
            <Upload className="h-4 w-4 mr-2" />
            Import Rates
          </Button>
          <Button variant="default" size="sm" onClick={refreshRates}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh from API
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Currency</TableHead>
              <TableHead>Base Rate (vs TZS)</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell className="font-medium">{rate.currency}</TableCell>
                <TableCell>
                  {editingId === rate.id ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      type="number"
                      step="0.0001"
                      className="w-32"
                    />
                  ) : (
                    rate.baseRate.toFixed(4)
                  )}
                </TableCell>
                <TableCell>
                  {new Date(rate.lastUpdated).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={rate.source === 'api' ? 'default' : 'outline'}>
                    {rate.source}
                  </Badge>
                </TableCell>
                <TableCell>
                  {editingId === rate.id ? (
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => saveRate(rate.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEditing}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => startEditing(rate)}>
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>Last bulk update: {new Date().toLocaleString()}</p>
        <p>Base currency: Tanzanian Shilling (TZS)</p>
      </div>
    </Card>
  )
}
