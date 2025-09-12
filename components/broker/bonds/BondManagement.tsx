'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
  const [allBonds, setAllBonds] = useState<Bond[]>([])
  
  // Fetch bonds from API
  useEffect(() => {
    const fetchBonds = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/trading/bonds')
        
        // Transform API data to match our Bond interface
        const apiBonds = response.data.map((bond: any) => ({
          id: bond.id,
          bondNumber: bond.bondNumber || `TZB${bond.id.substring(0, 3)}`,
          name: bond.name,
          issuer: bond.issuer || 'Unknown',
          couponRate: bond.couponRate || 0,
          maturityDate: bond.maturityDate || new Date().toISOString().split('T')[0],
          faceValue: bond.faceValue || 0,
          currentPrice: bond.price || 0,
          yieldToMaturity: bond.yieldToMaturity || 0
        }))
        
        setAllBonds(apiBonds)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch bonds:', err)
        setError('Failed to load bonds. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchBonds()
  }, [])

  // Filter bonds based on search query
  const filteredBonds = allBonds.filter(bond =>
    bond.bondNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bond.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bond.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding a new bond
  const handleAddBond = async (bond: Bond) => {
    try {
      // Call API to add the bond
      await axios.post('/api/trading/bonds', {
        name: bond.name,
        issuer: bond.issuer,
        bondNumber: bond.bondNumber,
        couponRate: bond.couponRate,
        maturityDate: bond.maturityDate,
        faceValue: bond.faceValue,
        price: bond.currentPrice,
        yieldToMaturity: bond.yieldToMaturity,
        isActive: true
      });
      
      // Refresh the bond list
      const response = await axios.get('/api/trading/bonds');
      
      // Transform API data to match our Bond interface
      const apiBonds = response.data.map((bond: any) => ({
        id: bond.id,
        bondNumber: bond.bondNumber || `TZB${bond.id.substring(0, 3)}`,
        name: bond.name,
        issuer: bond.issuer || 'Unknown',
        couponRate: bond.couponRate || 0,
        maturityDate: bond.maturityDate || new Date().toISOString().split('T')[0],
        faceValue: bond.faceValue || 0,
        currentPrice: bond.price || 0,
        yieldToMaturity: bond.yieldToMaturity || 0
      }));
      
      setAllBonds(apiBonds);
      setShowNewBond(false);
    } catch (error) {
      console.error('Failed to add bond:', error);
      // Handle error
    }
  };

  const handleSaveEdit = async () => {
    try {
      // Call API to update the bond
      await axios.put(`/api/trading/bonds/${editingBond}`, {
        name: editFormData.name,
        issuer: editFormData.issuer,
        bondNumber: editFormData.bondNumber,
        couponRate: editFormData.couponRate,
        maturityDate: editFormData.maturityDate,
        faceValue: editFormData.faceValue,
        price: editFormData.currentPrice,
        yieldToMaturity: editFormData.yieldToMaturity,
        isActive: true
      });
      
      // Refresh the bond list
      const response = await axios.get('/api/trading/bonds');
      
      // Transform API data to match our Bond interface
      const apiBonds = response.data.map((bond: any) => ({
        id: bond.id,
        bondNumber: bond.bondNumber || `TZB${bond.id.substring(0, 3)}`,
        name: bond.name,
        issuer: bond.issuer || 'Unknown',
        couponRate: bond.couponRate || 0,
        maturityDate: bond.maturityDate || new Date().toISOString().split('T')[0],
        faceValue: bond.faceValue || 0,
        currentPrice: bond.price || 0,
        yieldToMaturity: bond.yieldToMaturity || 0
      }));
      
      setAllBonds(apiBonds);
      setEditingBond(null);
    } catch (error) {
      console.error('Failed to update bond:', error);
      // Handle error
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold">Bond Management</h2>
        <p className="text-muted-foreground mt-1">
          Manage government and corporate bonds, track yields, and monitor bond market performance.
        </p>
      </div>
      
      {loading ? (
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading bonds...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-8">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
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
                  <Button variant="outline" onClick={() => setShowNewBond(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bond
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
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEditingBond(bond.id);
                              setEditFormData(bond);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this bond?')) {
                                try {
                                  await axios.delete(`/api/trading/bonds/${bond.id}`);
                                  // Refresh the bond list
                                  const response = await axios.get('/api/trading/bonds');
                                  const apiBonds = response.data.map((bond: any) => ({
                                    id: bond.id,
                                    bondNumber: bond.bondNumber || `TZB${bond.id.substring(0, 3)}`,
                                    name: bond.name,
                                    issuer: bond.issuer || 'Unknown',
                                    couponRate: bond.couponRate || 0,
                                    maturityDate: bond.maturityDate || new Date().toISOString().split('T')[0],
                                    faceValue: bond.faceValue || 0,
                                    currentPrice: bond.price || 0,
                                    yieldToMaturity: bond.yieldToMaturity || 0
                                  }));
                                  setAllBonds(apiBonds);
                                } catch (error) {
                                  console.error('Failed to delete bond:', error);
                                }
                              }
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-red-500"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </Button>
                        </div>
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
      {showNewBond && (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Add New Bond</h3>
            <Button variant="ghost" onClick={() => setShowNewBond(false)}>
              Cancel
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
              <Button 
                className="w-full"
                onClick={() => {
                  const newBond: Bond = {
                    id: '',
                    bondNumber: (document.getElementById('bondNumber') as HTMLInputElement).value,
                    name: (document.getElementById('name') as HTMLInputElement).value,
                    issuer: (document.getElementById('issuer') as HTMLInputElement).value,
                    couponRate: parseFloat((document.getElementById('couponRate') as HTMLInputElement).value),
                    maturityDate: (document.getElementById('maturityDate') as HTMLInputElement).value,
                    faceValue: parseFloat((document.getElementById('faceValue') as HTMLInputElement).value),
                    currentPrice: parseFloat((document.getElementById('currentPrice') as HTMLInputElement).value),
                    yieldToMaturity: parseFloat((document.getElementById('yieldToMaturity') as HTMLInputElement).value)
                  };
                  handleAddBond(newBond);
                }}
              >
                Add Bond
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
