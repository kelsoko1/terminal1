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
import { ArrowUpRight, Info } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface Bond {
  id: string
  name: string
  issuer: string
  maturityDate: string
  couponRate: number
  price: number
  yieldToMaturity: number
  minimumInvestment: number
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
    minimumInvestment: 100000
  },
  {
    id: 'b2',
    name: 'Corporate Bond Series A',
    issuer: 'CRDB Bank',
    maturityDate: '2028-03-10',
    couponRate: 14.8,
    price: 10000,
    yieldToMaturity: 15.3,
    minimumInvestment: 500000
  },
  {
    id: 'b3',
    name: 'Municipal Bond',
    issuer: 'Dar es Salaam City',
    maturityDate: '2029-11-20',
    couponRate: 13.7,
    price: 10000,
    yieldToMaturity: 14.1,
    minimumInvestment: 250000
  }
]

export function BondTrading() {
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null)
  const [orderAmount, setOrderAmount] = useState<number>(0)
  const [showBuyDialog, setShowBuyDialog] = useState(false)
  const { t } = useLanguage()

  const handleBuy = () => {
    // Handle buy logic here
    setShowBuyDialog(false)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">{t('bondTrading')}</h2>
        <p className="text-muted-foreground mb-6">
          {t('investInBonds')}
        </p>

        <Tabs defaultValue="government">
          <TabsList className="bg-transparent border rounded-lg p-1 mb-6">
            <TabsTrigger 
              value="government"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('government')}
            </TabsTrigger>
            <TabsTrigger 
              value="corporate"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('corporate')}
            </TabsTrigger>
            <TabsTrigger 
              value="municipal"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('municipal')}
            </TabsTrigger>
            <TabsTrigger 
              value="my-bonds"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              {t('myBonds')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="government">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('bondName')}</TableHead>
                  <TableHead>{t('issuer')}</TableHead>
                  <TableHead>{t('maturity')}</TableHead>
                  <TableHead>{t('couponRate')}</TableHead>
                  <TableHead>{t('ytm')}</TableHead>
                  <TableHead>{t('price')}</TableHead>
                  <TableHead>{t('minInvestment')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBonds
                  .filter(bond => bond.issuer.includes('Government'))
                  .map(bond => (
                    <TableRow key={bond.id}>
                      <TableCell className="font-medium">{bond.name}</TableCell>
                      <TableCell>{bond.issuer}</TableCell>
                      <TableCell>{new Date(bond.maturityDate).toLocaleDateString()}</TableCell>
                      <TableCell>{bond.couponRate}%</TableCell>
                      <TableCell>{bond.yieldToMaturity}%</TableCell>
                      <TableCell>{bond.price.toLocaleString()} TZS</TableCell>
                      <TableCell>{bond.minimumInvestment.toLocaleString()} TZS</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBond(bond)
                              setShowBuyDialog(true)
                            }}
                          >
                            {t('buy')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBond(bond)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="corporate">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('bondName')}</TableHead>
                  <TableHead>{t('issuer')}</TableHead>
                  <TableHead>{t('maturity')}</TableHead>
                  <TableHead>{t('couponRate')}</TableHead>
                  <TableHead>{t('ytm')}</TableHead>
                  <TableHead>{t('price')}</TableHead>
                  <TableHead>{t('minInvestment')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBonds
                  .filter(bond => !bond.issuer.includes('Government') && !bond.issuer.includes('City'))
                  .map(bond => (
                    <TableRow key={bond.id}>
                      <TableCell className="font-medium">{bond.name}</TableCell>
                      <TableCell>{bond.issuer}</TableCell>
                      <TableCell>{new Date(bond.maturityDate).toLocaleDateString()}</TableCell>
                      <TableCell>{bond.couponRate}%</TableCell>
                      <TableCell>{bond.yieldToMaturity}%</TableCell>
                      <TableCell>{bond.price.toLocaleString()} TZS</TableCell>
                      <TableCell>{bond.minimumInvestment.toLocaleString()} TZS</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBond(bond)
                              setShowBuyDialog(true)
                            }}
                          >
                            {t('buy')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBond(bond)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="municipal">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('bondName')}</TableHead>
                  <TableHead>{t('issuer')}</TableHead>
                  <TableHead>{t('maturity')}</TableHead>
                  <TableHead>{t('couponRate')}</TableHead>
                  <TableHead>{t('ytm')}</TableHead>
                  <TableHead>{t('price')}</TableHead>
                  <TableHead>{t('minInvestment')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBonds
                  .filter(bond => bond.issuer.includes('City'))
                  .map(bond => (
                    <TableRow key={bond.id}>
                      <TableCell className="font-medium">{bond.name}</TableCell>
                      <TableCell>{bond.issuer}</TableCell>
                      <TableCell>{new Date(bond.maturityDate).toLocaleDateString()}</TableCell>
                      <TableCell>{bond.couponRate}%</TableCell>
                      <TableCell>{bond.yieldToMaturity}%</TableCell>
                      <TableCell>{bond.price.toLocaleString()} TZS</TableCell>
                      <TableCell>{bond.minimumInvestment.toLocaleString()} TZS</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBond(bond)
                              setShowBuyDialog(true)
                            }}
                          >
                            {t('buy')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBond(bond)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="my-bonds">
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('noBondsYet')}</p>
              <p className="mt-2">{t('purchaseBonds')}</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Buy Bond Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('buyBond')}</DialogTitle>
            <DialogDescription>
              {t('enterInvestmentAmount')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBond && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('bondName')}</p>
                  <p className="text-sm">{selectedBond.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('issuer')}</p>
                  <p className="text-sm">{selectedBond.issuer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('maturity')}</p>
                  <p className="text-sm">{new Date(selectedBond.maturityDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('couponRate')}</p>
                  <p className="text-sm">{selectedBond.couponRate}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('price')}</p>
                  <p className="text-sm">{selectedBond.price.toLocaleString()} TZS</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('minInvestment')}</p>
                  <p className="text-sm">{selectedBond.minimumInvestment.toLocaleString()} TZS</p>
                </div>
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
                  <div className="text-sm">
                    {t('units')}: {Math.floor(orderAmount / selectedBond.price)}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuyDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleBuy} disabled={orderAmount < (selectedBond?.minimumInvestment || 0)}>
              {t('confirmPurchase')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
