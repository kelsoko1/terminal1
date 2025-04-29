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
  DialogTitle 
} from '@/components/ui/dialog'
import { ArrowUp, ArrowDown, Info, TrendingUp } from 'lucide-react'
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

export function FundTrading() {
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState<number>(0)
  const [showBuyDialog, setShowBuyDialog] = useState(false)
  const [showSellDialog, setShowSellDialog] = useState(false)
  const [units, setUnits] = useState<number>(0)
  const { t } = useLanguage()

  const handleBuy = () => {
    // Handle buy logic here
    setShowBuyDialog(false)
  }

  const handleSell = () => {
    // Handle sell logic here
    setShowSellDialog(false)
  }

  const getRiskBadge = (risk: 'Low' | 'Medium' | 'High') => {
    const colorMap = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800'
    }
    
    return (
      <Badge className={`${colorMap[risk]} hover:${colorMap[risk]}`}>
        {t(risk.toLowerCase())}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">{t('fundTrading')}</h2>
        <p className="text-muted-foreground mb-6">
          Invest in professionally managed mutual funds with diversified portfolios. Choose from equity, balanced, and money market funds.
        </p>

        <Tabs defaultValue="all">
          <TabsList className="bg-transparent border rounded-lg p-1 mb-6">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('allFunds')}
            </TabsTrigger>
            <TabsTrigger 
              value="equity"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('equity')}
            </TabsTrigger>
            <TabsTrigger 
              value="balanced"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('balanced')}
            </TabsTrigger>
            <TabsTrigger 
              value="money-market"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('moneyMarket')}
            </TabsTrigger>
            <TabsTrigger 
              value="my-funds"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('myFunds')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('fundName')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('manager')}</TableHead>
                  <TableHead>{t('nav')}</TableHead>
                  <TableHead>{t('oneMonthReturn')}</TableHead>
                  <TableHead>{t('oneYearReturn')}</TableHead>
                  <TableHead>{t('riskLevel')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockFunds.map(fund => (
                  <TableRow key={fund.id}>
                    <TableCell className="font-medium">{fund.name}</TableCell>
                    <TableCell>{fund.category}</TableCell>
                    <TableCell>{fund.manager}</TableCell>
                    <TableCell>{fund.nav.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell className={fund.performance.oneMonth >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {fund.performance.oneMonth >= 0 ? '+' : ''}{fund.performance.oneMonth}%
                    </TableCell>
                    <TableCell className={fund.performance.oneYear >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {fund.performance.oneYear >= 0 ? '+' : ''}{fund.performance.oneYear}%
                    </TableCell>
                    <TableCell>{getRiskBadge(fund.riskLevel)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedFund(fund)
                            setShowBuyDialog(true)
                          }}
                        >
                          {t('buy')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedFund(fund)
                            setShowSellDialog(true)
                          }}
                        >
                          {t('sell')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="equity">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('fundName')}</TableHead>
                  <TableHead>{t('manager')}</TableHead>
                  <TableHead>{t('nav')}</TableHead>
                  <TableHead>{t('oneMonthReturn')}</TableHead>
                  <TableHead>{t('oneYearReturn')}</TableHead>
                  <TableHead>{t('riskLevel')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockFunds
                  .filter(fund => fund.category === 'Equity')
                  .map(fund => (
                    <TableRow key={fund.id}>
                      <TableCell className="font-medium">{fund.name}</TableCell>
                      <TableCell>{fund.manager}</TableCell>
                      <TableCell>{fund.nav.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className={fund.performance.oneMonth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {fund.performance.oneMonth >= 0 ? '+' : ''}{fund.performance.oneMonth}%
                      </TableCell>
                      <TableCell className={fund.performance.oneYear >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {fund.performance.oneYear >= 0 ? '+' : ''}{fund.performance.oneYear}%
                      </TableCell>
                      <TableCell>{getRiskBadge(fund.riskLevel)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedFund(fund)
                              setShowBuyDialog(true)
                            }}
                          >
                            {t('buy')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedFund(fund)
                              setShowSellDialog(true)
                            }}
                          >
                            {t('sell')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="balanced">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('fundName')}</TableHead>
                  <TableHead>{t('manager')}</TableHead>
                  <TableHead>{t('nav')}</TableHead>
                  <TableHead>{t('oneMonthReturn')}</TableHead>
                  <TableHead>{t('oneYearReturn')}</TableHead>
                  <TableHead>{t('riskLevel')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockFunds
                  .filter(fund => fund.category === 'Balanced')
                  .map(fund => (
                    <TableRow key={fund.id}>
                      <TableCell className="font-medium">{fund.name}</TableCell>
                      <TableCell>{fund.manager}</TableCell>
                      <TableCell>{fund.nav.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className={fund.performance.oneMonth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {fund.performance.oneMonth >= 0 ? '+' : ''}{fund.performance.oneMonth}%
                      </TableCell>
                      <TableCell className={fund.performance.oneYear >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {fund.performance.oneYear >= 0 ? '+' : ''}{fund.performance.oneYear}%
                      </TableCell>
                      <TableCell>{getRiskBadge(fund.riskLevel)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedFund(fund)
                              setShowBuyDialog(true)
                            }}
                          >
                            {t('buy')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedFund(fund)
                              setShowSellDialog(true)
                            }}
                          >
                            {t('sell')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="money-market">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('fundName')}</TableHead>
                  <TableHead>{t('manager')}</TableHead>
                  <TableHead>{t('nav')}</TableHead>
                  <TableHead>{t('oneMonthReturn')}</TableHead>
                  <TableHead>{t('oneYearReturn')}</TableHead>
                  <TableHead>{t('riskLevel')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockFunds
                  .filter(fund => fund.category === 'Money Market')
                  .map(fund => (
                    <TableRow key={fund.id}>
                      <TableCell className="font-medium">{fund.name}</TableCell>
                      <TableCell>{fund.manager}</TableCell>
                      <TableCell>{fund.nav.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className={fund.performance.oneMonth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {fund.performance.oneMonth >= 0 ? '+' : ''}{fund.performance.oneMonth}%
                      </TableCell>
                      <TableCell className={fund.performance.oneYear >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {fund.performance.oneYear >= 0 ? '+' : ''}{fund.performance.oneYear}%
                      </TableCell>
                      <TableCell>{getRiskBadge(fund.riskLevel)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedFund(fund)
                              setShowBuyDialog(true)
                            }}
                          >
                            {t('buy')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedFund(fund)
                              setShowSellDialog(true)
                            }}
                          >
                            {t('sell')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="my-funds">
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('noFunds')}</p>
              <p className="mt-2">{t('purchaseFunds')}</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Buy Fund Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('buyFundUnits')}</DialogTitle>
            <DialogDescription>
              {t('enterInvestmentAmount')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFund && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('fundName')}</p>
                  <p className="text-sm">{selectedFund.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('manager')}</p>
                  <p className="text-sm">{selectedFund.manager}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('category')}</p>
                  <p className="text-sm">{selectedFund.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('riskLevel')}</p>
                  <p className="text-sm">{t(selectedFund.riskLevel.toLowerCase())}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('nav')}</p>
                  <p className="text-sm">{selectedFund.nav.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TZS</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('minInvestment')}</p>
                  <p className="text-sm">{selectedFund.minInvestment.toLocaleString()} TZS</p>
                </div>
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
                  <div className="text-sm">
                    {t('units')}: {(investmentAmount / selectedFund.nav).toFixed(4)}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuyDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleBuy} disabled={investmentAmount < (selectedFund?.minInvestment || 0)}>
              {t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sell Fund Dialog */}
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sellFundUnits')}</DialogTitle>
            <DialogDescription>
              {t('enterUnitsToSell')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFund && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('fundName')}</p>
                  <p className="text-sm">{selectedFund.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('nav')}</p>
                  <p className="text-sm">{selectedFund.nav.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TZS</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="units">{t('unitsToSell')}</Label>
                <Input
                  id="units"
                  type="number"
                  min={0.0001}
                  step={0.0001}
                  value={units}
                  onChange={(e) => {
                    const unitCount = Number(e.target.value);
                    setUnits(unitCount);
                    setInvestmentAmount(unitCount * selectedFund.nav);
                  }}
                />
                {units > 0 && (
                  <div className="text-sm">
                    {t('value')}: {(units * selectedFund.nav).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TZS
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSellDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSell} disabled={units <= 0}>
              {t('confirmSale')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
