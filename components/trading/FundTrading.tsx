'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet'
import { ArrowUpRight, ArrowDownRight, Star, UserCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { useLanguage } from '@/lib/language-context'

interface Fund {
  id: string
  name: string
  manager: string
  category: string
  nav: number
  aum: number
  minInvestment: number
  riskLevel: 'Low' | 'Medium' | 'High'
  performance: {
    oneMonth: number
    threeMonths: number
    oneYear: number
  }
}

// Mock data for funds
const mockFunds: Fund[] = [
  {
    id: 'f1',
    name: 'Tanzania Equity Fund',
    manager: 'CRDB Asset Management',
    category: 'Equity',
    nav: 1250.75,
    aum: 15000000000,
    minInvestment: 100000,
    riskLevel: 'High',
    performance: {
      oneMonth: 2.5,
      threeMonths: 7.8,
      oneYear: 18.5
    }
  },
  {
    id: 'f2',
    name: 'Balanced Growth Fund',
    manager: 'NMB Wealth Management',
    category: 'Balanced',
    nav: 950.25,
    aum: 8500000000,
    minInvestment: 50000,
    riskLevel: 'Medium',
    performance: {
      oneMonth: 1.2,
      threeMonths: 4.5,
      oneYear: 12.8
    }
  },
  {
    id: 'f3',
    name: 'Money Market Fund',
    manager: 'UTT Asset Management',
    category: 'Money Market',
    nav: 115.50,
    aum: 5200000000,
    minInvestment: 10000,
    riskLevel: 'Low',
    performance: {
      oneMonth: 0.8,
      threeMonths: 2.4,
      oneYear: 9.6
    }
  }
]

// Helper: get risk color
const riskColor = (risk: 'Low' | 'Medium' | 'High') => {
  switch (risk) {
    case 'Low': return 'risk-bg-low';
    case 'Medium': return 'risk-bg-medium';
    case 'High': return 'risk-bg-high';
    default: return 'investor-bg-secondary';
  }
}

// FundCard component (like BondCard)
const FundCard = ({ fund, onClick }: { fund: Fund, onClick: () => void }) => {
  const [favorite, setFavorite] = useState(false)
  return (
    <div
      className={`relative flex flex-col sm:flex-row items-center bg-card backdrop-blur-md rounded-2xl cursor-pointer border-l-8 ${fund.performance.oneYear > 0 ? 'border-green-600' : 'border-red-600'} hover:scale-[1.03] hover:shadow-2xl hover:bg-card/90 transition group px-4 py-3 min-h-[92px] shadow-lg mb-4 w-full max-w-xl`}
      onClick={onClick}
      style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)', overflow: 'hidden', position: 'relative' }}
    >
      {/* Manager Avatar/Icon */}
      <div className="flex flex-col items-center mr-4">
        <span className="w-10 h-10 flex items-center justify-center rounded-full bg-background border-2 border-border shadow-lg text-2xl">
          <UserCircle className="w-7 h-7 text-foreground" />
        </span>
        <span className={`mt-2 px-2 py-1 rounded text-xs text-foreground ${riskColor(fund.riskLevel)}`}>{fund.riskLevel}</span>
      </div>
      {/* Main Info */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-foreground text-lg leading-tight truncate max-w-[180px] drop-shadow-md">
            {fund.name}
          </h3>
          <div className="flex items-center gap-2">
            {/* Favorite star */}
            <button
              className="ml-1 p-1 rounded-full hover:bg-background/20 transition"
              onClick={e => { e.stopPropagation(); setFavorite(f => !f) }}
              aria-label="Add to watchlist"
              type="button"
            >
              <Star className={`w-5 h-5 ${favorite ? 'text-yellow-400 fill-yellow-400' : 'text-foreground'}`} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 text-muted-foreground text-sm font-medium flex-wrap">
          <span>{fund.manager}</span>
          <span> {fund.category}</span>
          <span> NAV: {fund.nav.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TZS</span>
        </div>
        {/* Short performance */}
        <div className="flex gap-2 mt-1 text-xs">
          <span className={fund.performance.oneMonth >= 0 ? 'text-green-400' : 'text-red-400'}>1M: {fund.performance.oneMonth >= 0 ? '+' : ''}{fund.performance.oneMonth}%</span>
          <span className={fund.performance.oneYear >= 0 ? 'text-green-400' : 'text-red-400'}>1Y: {fund.performance.oneYear >= 0 ? '+' : ''}{fund.performance.oneYear}%</span>
        </div>
      </div>
      {/* Mini chart placeholder */}
      <div className="flex flex-col items-end ml-4 min-w-[70px]">
        <span className={`flex items-center font-bold text-base ${fund.performance.oneYear > 0 ? 'text-green-400' : fund.performance.oneYear < 0 ? 'text-red-400' : 'text-foreground'}`}>
          {fund.performance.oneYear > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : fund.performance.oneYear < 0 ? <ArrowDownRight className="w-4 h-4 mr-1" /> : null}
          {fund.performance.oneYear}%
        </span>
        {/* Mini chart placeholder */}
        <div className="w-16 h-6 mt-2 bg-muted/40 rounded-md flex items-center justify-center text-[10px] text-foreground">
          Chart
        </div>
      </div>
    </div>
  )
}

export function FundTrading() {
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState<number>(0)
  const [showSheet, setShowSheet] = useState(false)
  const [units, setUnits] = useState<number>(0)
  const { t } = useLanguage()

  const handleBuy = () => {
    // Handle buy logic here
    setShowSheet(false)
  }
  const handleSell = () => {
    // Handle sell logic here
    setShowSheet(false)
  }

  // Helper to render fund cards list
  const renderFundCards = (funds: Fund[]) => (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {funds.map(fund => (
        <FundCard key={fund.id} fund={fund} onClick={() => {
          setSelectedFund(fund)
          setShowSheet(true)
          setInvestmentAmount(fund.minInvestment)
          setUnits(0)
        }} />
      ))}
    </div>
    )

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">{t('fundTrading')}</h2>
        <p className="text-muted-foreground mb-6">
          Invest in professionally managed mutual funds with diversified portfolios. Choose from equity, balanced, and money market funds.
        </p>
        {renderFundCards(mockFunds)}
      </Card>
      {/* Fund Details Sheet */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent side="right" className="max-w-xl w-full bg-card backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-slide-in-right px-2 sm:px-6 py-4 flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-2xl font-extrabold text-foreground drop-shadow-lg tracking-tight truncate">
              {selectedFund ? selectedFund.name : ''}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground mb-2 text-base font-medium drop-shadow-sm bg-background/10 rounded-lg px-3 py-2" style={{ backdropFilter: 'blur(1px)' }}>
              {selectedFund ? selectedFund.manager : ''}
            </SheetDescription>
          </SheetHeader>
          {selectedFund && (
            <div className="space-y-4 py-4 flex flex-col">
              {/* Responsive Chart Placeholder */}
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-2">
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={[]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                    <RechartsTooltip contentStyle={{ background: 'hsl(var(--background))', border: 'none', color: 'hsl(var(--foreground))', fontSize: 12 }} />
                    <Line type="monotone" dataKey="nav" stroke="hsl(var(--green))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-xs text-foreground text-center mt-1">NAV History</div>
                </div>
              <div className="flex flex-col gap-2 text-foreground text-base font-mono">
                <span>Category: {selectedFund.category}</span>
                <span>NAV: {selectedFund.nav.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TZS</span>
                <span>Min Investment: {selectedFund.minInvestment.toLocaleString()} TZS</span>
                <span>Risk Level: <span className={riskColor(selectedFund.riskLevel)}>{selectedFund.riskLevel}</span></span>
                <span>1M Return: <span className={selectedFund.performance.oneMonth >= 0 ? 'text-green-400' : 'text-red-400'}>{selectedFund.performance.oneMonth}%</span></span>
                <span>1Y Return: <span className={selectedFund.performance.oneYear >= 0 ? 'text-green-400' : 'text-red-400'}>{selectedFund.performance.oneYear}%</span></span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">{t('investmentAmount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  min={selectedFund.minInvestment}
                  step={1000}
                  value={investmentAmount}
                  onChange={(e) => {
                    const amount = Number(e.target.value);
                    setInvestmentAmount(amount);
                    setUnits(amount / selectedFund.nav);
                  }}
                />
                {investmentAmount > 0 && (
                  <div className="text-sm text-foreground">
                    {t('units')}: {(investmentAmount / selectedFund.nav).toFixed(4)}
                  </div>
                )}
              </div>
            </div>
          )}
          <SheetFooter className="flex flex-col sm:flex-row gap-3 p-4 border-t border-border bg-background backdrop-blur-xl z-10 w-full">
            <Button variant="destructive" onClick={handleSell} disabled={!selectedFund || investmentAmount < (selectedFund?.minInvestment || 0)} className="flex-1 py-3 rounded-xl text-lg shadow-lg hover:scale-105 hover:brightness-110 transition-all">{t('sell')}</Button>
            <Button onClick={handleBuy} disabled={!selectedFund || investmentAmount < (selectedFund?.minInvestment || 0)} className="flex-1 py-3 rounded-xl text-lg shadow-lg hover:scale-105 hover:brightness-110 transition-all">{t('buy')}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
