'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Download, Upload, Search, Filter } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BondRecordKeeper } from './BondRecordKeeper'

interface Bond {
  id: string
  bondNumber: string
  name: string
  issuer: string
  couponRate: number
  maturityDate: string
  faceValue: number
  currentPrice: number
  yieldToMaturity: number
}

export function BondManagement() {
  const [showNewBond, setShowNewBond] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingBond, setEditingBond] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Bond>({
    id: '',
    bondNumber: '',
    name: '',
    issuer: '',
    couponRate: 0,
    maturityDate: '',
    faceValue: 0,
    currentPrice: 0,
    yieldToMaturity: 0
  })

  // Combined list of all bonds
  const [allBonds, setAllBonds] = useState<Bond[]>([
    {
      id: 'b1',
      bondNumber: 'TZB001',
      name: 'Treasury Bond 2025',
      issuer: 'Government of Tanzania',
      couponRate: 12.5,
      maturityDate: '2025-12-31',
      faceValue: 100000,
      currentPrice: 102500,
      yieldToMaturity: 11.8
    },
    {
      id: 'b2',
      bondNumber: 'TZB002',
      name: 'Corporate Bond Series A',
      issuer: 'TanzaniaEnergy Corp',
      couponRate: 14.0,
      maturityDate: '2026-06-30',
      faceValue: 100000,
      currentPrice: 103200,
      yieldToMaturity: 13.2
    },
    {
      id: 'b3',
      bondNumber: 'TZB003',
      name: 'Municipal Bond 2024',
      issuer: 'Dar es Salaam City Council',
      couponRate: 11.5,
      maturityDate: '2024-09-30',
      faceValue: 100000,
      currentPrice: 99800,
      yieldToMaturity: 11.7
    },
    {
      id: 'b4',
      bondNumber: 'TZB004',
      name: 'Infrastructure Bond',
      issuer: 'Government of Tanzania',
      couponRate: 13.0,
      maturityDate: '2027-03-31',
      faceValue: 100000,
      currentPrice: 101800,
      yieldToMaturity: 12.6
    },
    {
      id: 'b5',
      bondNumber: 'TZB005',
      name: 'Green Energy Bond',
      issuer: 'Renewable Tanzania Ltd',
      couponRate: 13.5,
      maturityDate: '2025-08-31',
      faceValue: 100000,
      currentPrice: 100900,
      yieldToMaturity: 13.1
    }
  ])

  // Filter bonds based on search query
  const filteredBonds = allBonds.filter(bond =>
    bond.bondNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bond.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bond.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSaveEdit = () => {
    setAllBonds(allBonds.map(bond => 
      bond.id === editingBond ? editFormData : bond
    ))
    setEditingBond(null)
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-semibold">Bond Management</h2>
        <Button onClick={() => setShowNewBond(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Bond
        </Button>
      </div>

      {showNewBond ? (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Add New Bond</h3>
            <Button variant="ghost" onClick={() => setShowNewBond(false)}>
              Back to List
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="bondNumber">Bond Number</Label>
                <Input id="bondNumber" placeholder="Enter bond number" />
              </div>
              <div>
                <Label htmlFor="name">Bond Name</Label>
                <Input id="name" placeholder="Enter bond name" />
              </div>
              <div>
                <Label htmlFor="issuer">Issuer</Label>
                <Input id="issuer" placeholder="Enter issuer name" />
              </div>
              <div>
                <Label htmlFor="couponRate">Coupon Rate (%)</Label>
                <Input id="couponRate" type="number" step="0.1" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="maturityDate">Maturity Date</Label>
                <Input id="maturityDate" type="date" />
              </div>
              <div>
                <Label htmlFor="faceValue">Face Value (TZS)</Label>
                <Input id="faceValue" type="number" />
              </div>
              <div>
                <Label htmlFor="currentPrice">Current Price (TZS)</Label>
                <Input id="currentPrice" type="number" />
              </div>
              <div>
                <Label htmlFor="yieldToMaturity">Yield to Maturity (%)</Label>
                <Input id="yieldToMaturity" type="number" step="0.1" />
              </div>
              <Button className="w-full">Add Bond</Button>
            </div>
          </div>
        </div>
      ) : editingBond ? (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Edit Bond</h3>
            <Button variant="ghost" onClick={() => setEditingBond(null)}>
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-bondNumber">Bond Number</Label>
                <Input 
                  id="edit-bondNumber" 
                  value={editFormData.bondNumber}
                  onChange={(e) => setEditFormData({...editFormData, bondNumber: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-name">Bond Name</Label>
                <Input 
                  id="edit-name" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-issuer">Issuer</Label>
                <Input 
                  id="edit-issuer" 
                  value={editFormData.issuer}
                  onChange={(e) => setEditFormData({...editFormData, issuer: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-couponRate">Coupon Rate (%)</Label>
                <Input 
                  id="edit-couponRate" 
                  type="number" 
                  step="0.1"
                  value={editFormData.couponRate}
                  onChange={(e) => setEditFormData({...editFormData, couponRate: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-maturityDate">Maturity Date</Label>
                <Input 
                  id="edit-maturityDate" 
                  type="date"
                  value={editFormData.maturityDate}
                  onChange={(e) => setEditFormData({...editFormData, maturityDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-faceValue">Face Value (TZS)</Label>
                <Input 
                  id="edit-faceValue" 
                  type="number"
                  value={editFormData.faceValue}
                  onChange={(e) => setEditFormData({...editFormData, faceValue: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="edit-currentPrice">Current Price (TZS)</Label>
                <Input 
                  id="edit-currentPrice" 
                  type="number"
                  value={editFormData.currentPrice}
                  onChange={(e) => setEditFormData({...editFormData, currentPrice: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="edit-yieldToMaturity">Yield to Maturity (%)</Label>
                <Input 
                  id="edit-yieldToMaturity" 
                  type="number" 
                  step="0.1"
                  value={editFormData.yieldToMaturity}
                  onChange={(e) => setEditFormData({...editFormData, yieldToMaturity: parseFloat(e.target.value)})}
                />
              </div>
              <div className="flex gap-2 mt-8">
                <Button 
                  className="flex-1"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setEditingBond(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <Tabs defaultValue="bonds">
            <TabsList className="bg-transparent border rounded-lg p-1">
              <TabsTrigger value="bonds">All Bonds</TabsTrigger>
              <TabsTrigger value="records">Record Keeper</TabsTrigger>
            </TabsList>

            <TabsContent value="bonds">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search bonds..."
                      className="pl-8 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bond Number</TableHead>
                    <TableHead>Bond Name</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Coupon Rate</TableHead>
                    <TableHead>Maturity Date</TableHead>
                    <TableHead>Face Value</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>YTM</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBonds.map(bond => (
                    <TableRow key={bond.id}>
                      <TableCell>{bond.bondNumber}</TableCell>
                      <TableCell className="font-medium">{bond.name}</TableCell>
                      <TableCell>{bond.issuer}</TableCell>
                      <TableCell>{bond.couponRate}%</TableCell>
                      <TableCell>{bond.maturityDate}</TableCell>
                      <TableCell>{bond.faceValue.toLocaleString()} TZS</TableCell>
                      <TableCell>{bond.currentPrice.toLocaleString()} TZS</TableCell>
                      <TableCell>{bond.yieldToMaturity}%</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingBond(bond.id);
                            setEditFormData(bond);
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="records">
              <BondRecordKeeper />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  )
}
