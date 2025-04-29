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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  ArrowDownUp,
  BarChart3,
  Calendar,
  Clock,
  Download,
  FileText,
  RefreshCw,
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Types and interfaces
interface SettlementPosition {
  id: string;
  contractId: string;
  contractName: string;
  userId: string;
  userName: string;
  position: number; // Positive for long, negative for short
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  margin: number;
  maintenanceMargin: number;
  status: 'active' | 'margin_call' | 'liquidated';
  lastSettled: string;
}

interface SettlementCycle {
  id: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  contractsSettled: number;
  totalPositions: number;
  totalPnL: number;
  marginCalls: number;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
}

// Mock data
const mockPositions: SettlementPosition[] = [
  {
    id: 'pos1',
    contractId: 'f1',
    contractName: 'Cashew Nuts Futures DEC25',
    userId: 'user123',
    userName: 'John Doe',
    position: 10000, // 10 contracts of 1000kg each
    entryPrice: 2920,
    currentPrice: 2950,
    pnl: 300000, // (2950-2920) * 10000
    margin: 2920000, // 10% of contract value at entry
    maintenanceMargin: 1460000, // 5% of contract value at entry
    status: 'active',
    lastSettled: '2025-04-25T16:00:00Z'
  },
  {
    id: 'pos2',
    contractId: 'f2',
    contractName: 'Coffee Arabica Futures SEP25',
    userId: 'user456',
    userName: 'Jane Smith',
    position: -2500, // Short 5 contracts of 500kg each
    entryPrice: 7700,
    currentPrice: 7650,
    pnl: 125000, // (7700-7650) * 2500
    margin: 2887500, // 15% of contract value at entry
    maintenanceMargin: 1443750, // 7.5% of contract value at entry
    status: 'active',
    lastSettled: '2025-04-25T16:00:00Z'
  },
  {
    id: 'pos3',
    contractId: 'f3',
    contractName: 'Gold Futures JUN25',
    userId: 'user789',
    userName: 'Robert Johnson',
    position: 20, // 2 contracts of 10oz each
    entryPrice: 2870000,
    currentPrice: 2875000,
    pnl: 100000, // (2875000-2870000) * 20
    margin: 11480000, // 20% of contract value at entry
    maintenanceMargin: 5740000, // 10% of contract value at entry
    status: 'active',
    lastSettled: '2025-04-25T16:00:00Z'
  },
  {
    id: 'pos4',
    contractId: 'f4',
    contractName: 'Sesame Seeds Futures OCT25',
    userId: 'user321',
    userName: 'Alice Brown',
    position: 6000, // 3 contracts of 2000kg each
    entryPrice: 3800,
    currentPrice: 3750,
    pnl: -300000, // (3750-3800) * 6000
    margin: 2736000, // 12% of contract value at entry
    maintenanceMargin: 1368000, // 6% of contract value at entry
    status: 'margin_call',
    lastSettled: '2025-04-25T16:00:00Z'
  }
];

const mockSettlementCycles: SettlementCycle[] = [
  {
    id: 'sc1',
    date: '2025-04-25',
    status: 'completed',
    contractsSettled: 12,
    totalPositions: 42,
    totalPnL: 1250000,
    marginCalls: 3,
    startTime: '2025-04-25T16:00:00Z',
    endTime: '2025-04-25T16:05:23Z'
  },
  {
    id: 'sc2',
    date: '2025-04-24',
    status: 'completed',
    contractsSettled: 11,
    totalPositions: 38,
    totalPnL: -750000,
    marginCalls: 5,
    startTime: '2025-04-24T16:00:00Z',
    endTime: '2025-04-24T16:04:45Z'
  },
  {
    id: 'sc3',
    date: '2025-04-23',
    status: 'completed',
    contractsSettled: 10,
    totalPositions: 35,
    totalPnL: 2100000,
    marginCalls: 1,
    startTime: '2025-04-23T16:00:00Z',
    endTime: '2025-04-23T16:03:58Z'
  }
];

export function CommodityClearingSettlement() {
  // State
  const [positions, setPositions] = useState<SettlementPosition[]>(mockPositions);
  const [settlementCycles, setSettlementCycles] = useState<SettlementCycle[]>(mockSettlementCycles);
  const [activeTab, setActiveTab] = useState('positions');
  const [selectedContractId, setSelectedContractId] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSettlementInProgress, setIsSettlementInProgress] = useState(false);
  const [settlementProgress, setSettlementProgress] = useState(0);
  
  // Filter positions based on selected contract and search term
  const filteredPositions = positions.filter(position => {
    const matchesContract = selectedContractId === 'all' || position.contractId === selectedContractId;
    const matchesSearch = 
      position.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.contractName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesContract && matchesSearch;
  });
  
  // Calculate totals
  const totalPositions = filteredPositions.length;
  const totalMargin = filteredPositions.reduce((sum, pos) => sum + pos.margin, 0);
  const totalPnL = filteredPositions.reduce((sum, pos) => sum + pos.pnl, 0);
  const marginCallsCount = filteredPositions.filter(pos => pos.status === 'margin_call').length;
  
  // Simulate running a settlement cycle
  const runSettlementCycle = () => {
    if (isSettlementInProgress) return;
    
    setIsSettlementInProgress(true);
    setSettlementProgress(0);
    
    // Create a new settlement cycle
    const newCycle: SettlementCycle = {
      id: `sc${settlementCycles.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      contractsSettled: 0,
      totalPositions: positions.length,
      totalPnL: 0,
      marginCalls: 0,
      startTime: new Date().toISOString()
    };
    
    setSettlementCycles([newCycle, ...settlementCycles]);
    
    // Simulate settlement progress
    const interval = setInterval(() => {
      setSettlementProgress(prev => {
        const newProgress = prev + 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Update settlement cycle
          const completedCycle: SettlementCycle = {
            ...newCycle,
            status: 'completed',
            contractsSettled: positions.filter(p => p.contractId === selectedContractId || selectedContractId === 'all').length,
            totalPnL: totalPnL,
            marginCalls: marginCallsCount,
            endTime: new Date().toISOString()
          };
          
          setSettlementCycles(prev => [
            completedCycle,
            ...prev.slice(1)
          ]);
          
          // Update positions with new settlement date
          setPositions(positions.map(pos => ({
            ...pos,
            lastSettled: new Date().toISOString()
          })));
          
          setIsSettlementInProgress(false);
          return 100;
        }
        
        return newProgress;
      });
    }, 500);
  };
  
  // Handle resolving a margin call
  const resolveMarginCall = (positionId: string) => {
    setPositions(positions.map(pos => 
      pos.id === positionId ? { ...pos, status: 'active' } : pos
    ));
  };
  
  // Handle liquidating a position
  const liquidatePosition = (positionId: string) => {
    if (confirm('Are you sure you want to liquidate this position? This action cannot be undone.')) {
      setPositions(positions.filter(pos => pos.id !== positionId));
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="positions">Open Positions</TabsTrigger>
          <TabsTrigger value="settlement">Settlement Cycles</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>
        
        {/* Open Positions Tab */}
        <TabsContent value="positions">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Clearing House Status</h3>
              <Button 
                onClick={runSettlementCycle}
                disabled={isSettlementInProgress}
              >
                {isSettlementInProgress ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Settling ({settlementProgress}%)
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Run Settlement Cycle
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-muted-foreground text-sm">Total Open Positions</div>
                <div className="font-medium text-xl mt-1">{totalPositions}</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-muted-foreground text-sm">Total Margin Held</div>
                <div className="font-medium text-xl mt-1">{totalMargin.toLocaleString()} TZS</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-muted-foreground text-sm">Unrealized P&L</div>
                <div className={`font-medium text-xl mt-1 ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString()} TZS
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-muted-foreground text-sm">Margin Calls</div>
                <div className="font-medium text-xl mt-1 flex items-center">
                  {marginCallsCount}
                  {marginCallsCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      Action Required
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="contractFilter">Filter by Contract:</Label>
                <Select 
                  value={selectedContractId} 
                  onValueChange={(value) => setSelectedContractId(value as string)}
                >
                  <SelectTrigger id="contractFilter" className="w-[250px]">
                    <SelectValue placeholder="All contracts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All contracts</SelectItem>
                    <SelectItem value="f1">Cashew Nuts Futures DEC25</SelectItem>
                    <SelectItem value="f2">Coffee Arabica Futures SEP25</SelectItem>
                    <SelectItem value="f3">Gold Futures JUN25</SelectItem>
                    <SelectItem value="f4">Sesame Seeds Futures OCT25</SelectItem>
                    <SelectItem value="f5">Coffee Robusta Futures MAR26</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Entry Price</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Settled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPositions.length > 0 ? (
                    filteredPositions.map((position) => (
                      <TableRow key={position.id} className={position.status === 'margin_call' ? 'bg-red-50' : undefined}>
                        <TableCell className="font-medium">{position.contractName}</TableCell>
                        <TableCell>{position.userName}</TableCell>
                        <TableCell className={position.position > 0 ? 'text-green-600' : 'text-red-600'}>
                          {position.position > 0 ? 'LONG' : 'SHORT'} {Math.abs(position.position).toLocaleString()}
                        </TableCell>
                        <TableCell>{position.entryPrice.toLocaleString()}</TableCell>
                        <TableCell>{position.currentPrice.toLocaleString()}</TableCell>
                        <TableCell className={position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {position.pnl >= 0 ? '+' : ''}{position.pnl.toLocaleString()} TZS
                        </TableCell>
                        <TableCell>{position.margin.toLocaleString()} TZS</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              position.status === 'active' ? 'default' : 
                              position.status === 'margin_call' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {position.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(position.lastSettled).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {position.status === 'margin_call' ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600"
                                  onClick={() => resolveMarginCall(position.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Resolve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                  onClick={() => liquidatePosition(position.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Liquidate
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {/* View details */}}
                              >
                                Details
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
                        No positions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
        
        {/* Settlement Cycles Tab */}
        <TabsContent value="settlement">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Settlement Cycles</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export History
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contracts Settled</TableHead>
                    <TableHead>Total Positions</TableHead>
                    <TableHead>Total P&L</TableHead>
                    <TableHead>Margin Calls</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlementCycles.map((cycle) => {
                    // Calculate duration if available
                    let duration = '';
                    if (cycle.startTime && cycle.endTime) {
                      const start = new Date(cycle.startTime);
                      const end = new Date(cycle.endTime);
                      const diff = (end.getTime() - start.getTime()) / 1000; // in seconds
                      duration = `${diff.toFixed(1)}s`;
                    }
                    
                    return (
                      <TableRow key={cycle.id}>
                        <TableCell className="font-medium">{cycle.date}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              cycle.status === 'completed' ? 'default' : 
                              cycle.status === 'in_progress' ? 'outline' : 
                              cycle.status === 'failed' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {cycle.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{cycle.contractsSettled}</TableCell>
                        <TableCell>{cycle.totalPositions}</TableCell>
                        <TableCell className={cycle.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {cycle.totalPnL >= 0 ? '+' : ''}{cycle.totalPnL.toLocaleString()} TZS
                        </TableCell>
                        <TableCell>{cycle.marginCalls}</TableCell>
                        <TableCell>{cycle.startTime ? new Date(cycle.startTime).toLocaleTimeString() : '-'}</TableCell>
                        <TableCell>{cycle.endTime ? new Date(cycle.endTime).toLocaleTimeString() : '-'}</TableCell>
                        <TableCell>{duration || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
        
        {/* Configuration Tab */}
        <TabsContent value="config">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Settlement Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="settlement-time">Daily Settlement Time</Label>
                    <Input id="settlement-time" type="time" defaultValue="16:00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settlement-cycle">Settlement Cycle</Label>
                    <Select defaultValue="T+1">
                      <SelectTrigger id="settlement-cycle">
                        <SelectValue placeholder="Select cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="T+0">T+0 (Same day)</SelectItem>
                        <SelectItem value="T+1">T+1 (Next day)</SelectItem>
                        <SelectItem value="T+2">T+2 (Two days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price-source">Settlement Price Source</Label>
                    <Select defaultValue="last_traded">
                      <SelectTrigger id="price-source">
                        <SelectValue placeholder="Select price source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last_traded">Last Traded Price</SelectItem>
                        <SelectItem value="vwap">Volume Weighted Average Price</SelectItem>
                        <SelectItem value="closing">Closing Price</SelectItem>
                        <SelectItem value="manual">Manual Input</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="margin-threshold">Margin Call Threshold (%)</Label>
                    <Input id="margin-threshold" type="number" defaultValue="80" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="liquidation-threshold">Liquidation Threshold (%)</Label>
                  <Input id="liquidation-threshold" type="number" defaultValue="50" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Positions will be automatically liquidated when margin falls below this percentage of maintenance margin.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-liquidation" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="auto-liquidation">Enable Automatic Liquidation</Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    When enabled, positions that fall below the liquidation threshold will be automatically liquidated.
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button>Save Configuration</Button>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Default Margin Requirements</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Agricultural Commodities</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="agri-initial" className="text-xs">Initial Margin (%)</Label>
                        <Input id="agri-initial" type="number" defaultValue="10" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="agri-maintenance" className="text-xs">Maintenance Margin (%)</Label>
                        <Input id="agri-maintenance" type="number" defaultValue="5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Metals</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="metals-initial" className="text-xs">Initial Margin (%)</Label>
                        <Input id="metals-initial" type="number" defaultValue="20" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="metals-maintenance" className="text-xs">Maintenance Margin (%)</Label>
                        <Input id="metals-maintenance" type="number" defaultValue="10" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Energy</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="energy-initial" className="text-xs">Initial Margin (%)</Label>
                        <Input id="energy-initial" type="number" defaultValue="15" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="energy-maintenance" className="text-xs">Maintenance Margin (%)</Label>
                        <Input id="energy-maintenance" type="number" defaultValue="7.5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Specialty</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="specialty-initial" className="text-xs">Initial Margin (%)</Label>
                        <Input id="specialty-initial" type="number" defaultValue="25" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="specialty-maintenance" className="text-xs">Maintenance Margin (%)</Label>
                        <Input id="specialty-maintenance" type="number" defaultValue="12.5" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button>Save Margin Requirements</Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
