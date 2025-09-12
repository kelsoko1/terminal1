'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { ArrowUpRight, Info, Star, ArrowDownRight, UserCircle } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet'
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

interface Bond {
  id: string
  name: string
  issuer: string
  maturityDate: string
  couponRate: number
  price: number
  yieldToMaturity: number
  minimumInvestment: number
  type?: 'Government' | 'Corporate' | 'Municipal'
  status?: 'New' | 'Popular' | 'Limited'
  description?: string
  yieldHistory?: { date: string, yield: number }[]
}

// Mock data for bonds
const mockBonds: Bond[] = [
  {
    id: 'b1',
    name: 'Treasury Bond 7Y',
    issuer: 'Government of Tanzania',
    maturityDate: '2031-05-15',
    couponRate: 12.5,
    price: 10000,
    yieldToMaturity: 13.2,
    minimumInvestment: 100000,
    type: 'Government',
    status: 'Popular',
    description: 'Long-term government bond for infrastructure projects.',
    yieldHistory: [
      { date: '2023-01', yield: 12.0 },
      { date: '2023-04', yield: 12.5 },
      { date: '2023-07', yield: 13.0 },
      { date: '2023-10', yield: 13.2 },
    ]
  },
  {
    id: 'b2',
    name: 'Corporate Bond Series A',
    issuer: 'CRDB Bank',
    maturityDate: '2028-03-10',
    couponRate: 14.8,
    price: 10000,
    yieldToMaturity: 15.3,
    minimumInvestment: 500000,
    type: 'Corporate',
    status: 'New',
    description: 'Issued by CRDB Bank to support business expansion.'
  },
  {
    id: 'b3',
    name: 'Municipal Bond',
    issuer: 'Dar es Salaam City',
    maturityDate: '2029-11-20',
    couponRate: 13.7,
    price: 10000,
    yieldToMaturity: 14.1,
    minimumInvestment: 250000,
    type: 'Municipal',
    status: 'Limited',
    description: 'Funds city development and public services.'
  },
  {
    id: 'b4',
    name: 'Corporate Bond Series B',
    issuer: 'NMB Bank',
    maturityDate: '2027-08-15',
    couponRate: 11.2,
    price: 10000,
    yieldToMaturity: 10.5,
    minimumInvestment: 300000,
    type: 'Corporate',
    status: 'Popular',
    description: 'Issued by NMB Bank to finance new branch expansion.'
  },
  {
    id: 'b5',
    name: 'Infrastructure Bond',
    issuer: 'Government of Tanzania',
    maturityDate: '2035-01-01',
    couponRate: 10.0,
    price: 10000,
    yieldToMaturity: 9.8,
    minimumInvestment: 200000,
    type: 'Government',
    status: 'Limited',
    description: 'Supports national infrastructure and public works.',
    yieldHistory: [
      { date: '2023-01', yield: 9.0 },
      { date: '2023-04', yield: 9.2 },
      { date: '2023-07', yield: 9.5 },
      { date: '2023-10', yield: 9.8 },
    ]
  },
  {
    id: 'b6',
    name: 'Green Energy Bond',
    issuer: 'Tanzania Electric Supply Co.',
    maturityDate: '2030-12-31',
    couponRate: 12.0,
    price: 10000,
    yieldToMaturity: -2.5,
    minimumInvestment: 150000,
    type: 'Corporate',
    status: 'New',
    description: 'Funds renewable energy projects and sustainability.'
  },
  {
    id: 'b7',
    name: 'Education Bond',
    issuer: 'Ministry of Education',
    maturityDate: '2032-06-30',
    couponRate: 13.0,
    price: 10000,
    yieldToMaturity: 0.0,
    minimumInvestment: 120000,
    type: 'Government',
    status: 'Popular',
    description: 'Invest in the future of education and schools.'
  },
  {
    id: 'b8',
    name: 'Corporate Bond Series C',
    issuer: 'Vodacom Tanzania',
    maturityDate: '2026-09-15',
    couponRate: 9.5,
    price: 10000,
    yieldToMaturity: 7.2,
    minimumInvestment: 400000,
    type: 'Corporate',
    status: 'Limited',
    description: 'Vodacom bond for telecom infrastructure.'
  },
  {
    id: 'b9',
    name: 'Municipal Development Bond',
    issuer: 'Arusha City',
    maturityDate: '2033-03-20',
    couponRate: 10.8,
    price: 10000,
    yieldToMaturity: 8.9,
    minimumInvestment: 180000,
    type: 'Municipal',
    status: 'New',
    description: 'Funds city development and local projects.'
  },
  {
    id: 'b10',
    name: 'Corporate Bond Series D',
    issuer: 'Tanzania Breweries',
    maturityDate: '2029-11-11',
    couponRate: 8.5,
    price: 10000,
    yieldToMaturity: -1.1,
    minimumInvestment: 350000,
    type: 'Corporate',
    status: 'Popular',
    description: 'Issued by Tanzania Breweries for expansion.'
  },
]

// Helper: get bond type color
const bondTypeColor = (type?: string) => {
  switch (type) {
    case 'Government': return 'investor-bg-info';
    case 'Corporate': return 'investor-bg-warning';
    case 'Municipal': return 'investor-bg-success';
    default: return 'investor-bg-secondary';
  }
}
// Helper: get status color
const statusColor = (status?: string) => {
  switch (status) {
    case 'New': return 'investor-bg-success';
    case 'Popular': return 'investor-bg-secondary';
    case 'Limited': return 'investor-bg-warning';
    default: return 'investor-bg-secondary';
  }
}
// Helper: maturity countdown
const getMaturityCountdown = (maturityDate: string) => {
  const now = new Date()
  const maturity = new Date(maturityDate)
  const diff = maturity.getTime() - now.getTime()
  if (diff <= 0) return 'Matured'
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365))
  const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))
  if (years > 0) return `${years}y ${months}m left`
  if (months > 0) return `${months}m left`
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  return `${days}d left`
}

// Enhanced BondCard
const BondCard = ({ bond, onClick }: { bond: Bond, onClick: () => void }) => {
  const [favorite, setFavorite] = useState(false)
  return (
    <div
      className={`relative flex flex-col sm:flex-row items-center bg-card backdrop-blur-md rounded-2xl cursor-pointer border-l-8 ${bond.yieldToMaturity > 0 ? 'border-green-600' : 'border-red-600'} hover:scale-[1.03] hover:shadow-2xl hover:bg-card/90 transition group px-6 py-4 shadow-lg mb-6 w-full max-w-3xl`}
      onClick={onClick}
      style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)', overflow: 'visible', position: 'relative' }}
    >
      {/* Issuer Avatar/Icon */}
      <div className="flex flex-col items-center mr-6">
        <span className="w-12 h-12 flex items-center justify-center rounded-full bg-background border-2 border-border shadow-lg text-2xl">
          <UserCircle className="w-8 h-8 text-foreground" />
        </span>
        <Badge className={`${bondTypeColor(bond.type)} text-white mt-3`} variant="secondary">{bond.type}</Badge>
      </div>
      {/* Main Info */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-lg leading-tight truncate max-w-[260px] drop-shadow-md">
            {bond.name}
          </h3>
          <div className="flex items-center gap-2">
            {/* Status badge */}
            {bond.status && <Badge className={`${statusColor(bond.status)} text-white`} variant="secondary">{bond.status}</Badge>}
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
        <div className="flex items-center gap-3 mt-2 text-foreground text-sm font-medium flex-wrap">
          <span>{bond.issuer}</span>
          <span>• {getMaturityCountdown(bond.maturityDate)}</span>
          <span>• {bond.price.toLocaleString()} TZS</span>
        </div>
        {/* Short description */}
        {bond.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{bond.description}</div>}
      </div>
      {/* Yield/Performance & Mini Chart */}
      <div className="flex flex-col items-end ml-6 min-w-[90px]">
        <span className={`flex items-center font-bold text-base ${bond.yieldToMaturity > 0 ? 'text-green-400' : bond.yieldToMaturity < 0 ? 'text-red-400' : 'text-foreground'}`}>
          {bond.yieldToMaturity > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : bond.yieldToMaturity < 0 ? <ArrowDownRight className="w-4 h-4 mr-1" /> : null}
          {bond.yieldToMaturity}%
        </span>
        {/* Mini chart placeholder */}
        <div className="w-24 h-8 mt-3 bg-muted/40 rounded-md flex items-center justify-center text-[11px] text-foreground">
          Chart
        </div>
      </div>
    </div>
  )
}

export function BondTrading() {
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null)
  const [orderAmount, setOrderAmount] = useState<number>(0)
  const [showSheet, setShowSheet] = useState(false)
  const { t } = useLanguage()

  const handleBuy = () => {
    // Handle buy logic here
    setShowSheet(false)
  }
  const handleSell = () => {
    // Handle sell logic here
    setShowSheet(false)
  }

  // Helper to render bond cards list
  const renderBondCards = (bonds: Bond[]) => (
    <div className="w-full flex flex-col items-center gap-4">
      {bonds.map(bond => (
        <BondCard key={bond.id} bond={bond} onClick={() => {
          setSelectedBond(bond)
          setShowSheet(true)
          setOrderAmount(bond.minimumInvestment)
        }} />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {renderBondCards(mockBonds.filter(bond => bond.issuer.includes('Government')))}
      </Card>
      {/* Bond Details Sheet */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent side="right" className="max-w-xl w-full bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-slide-in-right px-2 sm:px-6 py-4 flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-2xl font-extrabold text-white drop-shadow-lg tracking-tight truncate">
              {selectedBond ? selectedBond.name : ''}
            </SheetTitle>
            <SheetDescription className="text-foreground mb-2 text-base font-medium drop-shadow-sm bg-background/10 rounded-lg px-3 py-2" style={{ backdropFilter: 'blur(1px)' }}>
              {selectedBond ? selectedBond.issuer : ''}
            </SheetDescription>
          </SheetHeader>
          {selectedBond && (
            <div className="space-y-4 py-4 flex flex-col">
              {/* Responsive Chart */}
              {selectedBond.yieldHistory && (
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-2">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={selectedBond.yieldHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={['auto', 'auto']} tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                      <RechartsTooltip contentStyle={{ background: 'hsl(var(--background))', border: 'none', color: 'hsl(var(--foreground))', fontSize: 12 }} />
                      <Line type="monotone" dataKey="yield" stroke="hsl(var(--green))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-foreground text-center mt-1">Yield History</div>
                </div>
              )}
              <div className="flex flex-col gap-2 text-foreground text-base font-mono">
                <span>Maturity: {new Date(selectedBond.maturityDate).toLocaleDateString()}</span>
                <span>Coupon Rate: {selectedBond.couponRate}%</span>
                <span>Price: {selectedBond.price.toLocaleString()} TZS</span>
                <span>Min Investment: {selectedBond.minimumInvestment.toLocaleString()} TZS</span>
                <span>Yield to Maturity: <span className={selectedBond.yieldToMaturity > 0 ? 'text-green-400' : 'text-red-400'}>{selectedBond.yieldToMaturity}%</span></span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">{t('investmentAmount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  min={selectedBond.minimumInvestment}
                  step={selectedBond.price}
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(Number(e.target.value))}
                />
                {orderAmount > 0 && (
                  <div className="text-sm text-foreground">
                    {t('units')}: {Math.floor(orderAmount / selectedBond.price)}
                  </div>
                )}
              </div>
            </div>
          )}
          <SheetFooter className="flex flex-col sm:flex-row gap-3 p-4 border-t border-border bg-background/80 backdrop-blur-xl z-10 w-full">
            <Button variant="destructive" onClick={handleSell} disabled={!selectedBond || orderAmount < (selectedBond?.minimumInvestment || 0)} className="flex-1 py-3 rounded-xl text-lg shadow-lg hover:scale-105 hover:brightness-110 transition-all">{t('sell')}</Button>
            <Button onClick={handleBuy} disabled={!selectedBond || orderAmount < (selectedBond?.minimumInvestment || 0)} className="flex-1 py-3 rounded-xl text-lg shadow-lg hover:scale-105 hover:brightness-110 transition-all">{t('buy')}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
