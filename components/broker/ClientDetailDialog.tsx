'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { ClientMessageDialog } from './ClientMessageDialog'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  DollarSign, 
  BarChart, 
  MessageSquare,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban
} from 'lucide-react'

interface ClientDetailProps {
  isOpen: boolean
  onClose: () => void
  client: {
    id: string
    firstName: string
    middleName?: string
    lastName: string
    email: string
    phone: string
    accountType: 'individual' | 'corporate' | 'institutional'
    status: 'active' | 'pending' | 'suspended'
    csd: string
    joinDate: string
    kycStatus: 'verified' | 'pending' | 'rejected'
    // Additional fields for detailed view
    accountNumber?: string
    taxId?: string
    address?: string
    city?: string
    country?: string
    occupation?: string
    employer?: string
    investmentProfile?: {
      riskTolerance: 'low' | 'medium' | 'high'
      investmentGoals: string[]
      investmentExperience: 'beginner' | 'intermediate' | 'advanced'
    }
  }
}

export function ClientDetailDialog({ isOpen, onClose, client }: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  
  // Generate initials for avatar
  const getInitials = () => {
    return `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`
  }
  
  // Format full name
  const getFullName = () => {
    return `${client.firstName} ${client.middleName ? client.middleName + ' ' : ''}${client.lastName}`
  }
  
  // Handle client actions
  const handleSuspendClient = () => {
    // In a real app, this would call an API to suspend the client
    console.log('Suspending client:', client.id)
    // Show confirmation and close dialog
    onClose()
  }
  
  const handleActivateClient = () => {
    // In a real app, this would call an API to activate the client
    console.log('Activating client:', client.id)
    // Show confirmation and close dialog
    onClose()
  }
  
  const handleApproveKYC = () => {
    // In a real app, this would call an API to approve KYC
    console.log('Approving KYC for client:', client.id)
    // Show confirmation and close dialog
    onClose()
  }
  
  const handleRejectKYC = () => {
    // In a real app, this would call an API to reject KYC
    console.log('Rejecting KYC for client:', client.id)
    // Show confirmation and close dialog
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Client Details</span>
              <Badge 
                variant={client.status === 'active' ? 'default' : 
                        client.status === 'pending' ? 'secondary' : 'destructive'}
              >
                {client.status.toUpperCase()}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col md:flex-row gap-6 py-4">
            {/* Client Header */}
            <div className="flex flex-col items-center md:items-start gap-2 md:w-1/3">
              <Avatar className="h-24 w-24">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getFullName()}`} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-bold mt-2">{getFullName()}</h2>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{client.email}</span>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{client.phone}</span>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Joined {client.joinDate}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowMessageDialog(true)}
                  className="gap-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
                
                {client.status === 'active' ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 gap-1"
                    onClick={handleSuspendClient}
                  >
                    <Ban className="h-4 w-4" />
                    Suspend
                  </Button>
                ) : client.status === 'suspended' ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-green-600 gap-1"
                    onClick={handleActivateClient}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Activate
                  </Button>
                ) : null}
                
                {client.kycStatus === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600 gap-1"
                      onClick={handleApproveKYC}
                    >
                      <FileCheck className="h-4 w-4" />
                      Approve KYC
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 gap-1"
                      onClick={handleRejectKYC}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Reject KYC
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {/* Client Details Tabs */}
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-3">Account Information</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-muted-foreground">Account Type</Label>
                        <p className="font-medium">
                          {client.accountType.charAt(0).toUpperCase() + client.accountType.slice(1)}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-muted-foreground">CSD Number</Label>
                        <p className="font-medium">{client.csd}</p>
                      </div>
                      
                      <div>
                        <Label className="text-muted-foreground">Account Number</Label>
                        <p className="font-medium">{client.accountNumber || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <Label className="text-muted-foreground">Tax ID</Label>
                        <p className="font-medium">{client.taxId || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <Label className="text-muted-foreground">KYC Status</Label>
                        <div className="flex items-center gap-1">
                          {client.kycStatus === 'verified' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : client.kycStatus === 'pending' ? (
                            <Clock className="h-4 w-4 text-amber-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {client.kycStatus.charAt(0).toUpperCase() + client.kycStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {client.address && (
                    <Card className="p-4">
                      <h3 className="font-medium mb-3">Contact Information</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-muted-foreground">Address</Label>
                          <p className="font-medium">{client.address}</p>
                        </div>
                        
                        <div>
                          <Label className="text-muted-foreground">City</Label>
                          <p className="font-medium">{client.city || 'N/A'}</p>
                        </div>
                        
                        <div>
                          <Label className="text-muted-foreground">Country</Label>
                          <p className="font-medium">{client.country || 'N/A'}</p>
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  {client.investmentProfile && (
                    <Card className="p-4">
                      <h3 className="font-medium mb-3">Investment Profile</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-muted-foreground">Risk Tolerance</Label>
                          <p className="font-medium capitalize">{client.investmentProfile.riskTolerance}</p>
                        </div>
                        
                        <div>
                          <Label className="text-muted-foreground">Experience</Label>
                          <p className="font-medium capitalize">{client.investmentProfile.investmentExperience}</p>
                        </div>
                        
                        <div className="col-span-2">
                          <Label className="text-muted-foreground">Investment Goals</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {client.investmentProfile.investmentGoals.map((goal, index) => (
                              <Badge key={index} variant="secondary">{goal}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4 mt-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-3">Client Documents</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <span>ID Document</span>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <span>Proof of Address</span>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <span>Account Agreement</span>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <span>Tax Declaration</span>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="transactions" className="space-y-4 mt-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-3">Recent Transactions</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <div className="font-medium">Buy CRDB</div>
                          <div className="text-sm text-muted-foreground">2024-04-10</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600">Completed</Badge>
                          <span className="font-medium">TZS 250,000</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <div className="font-medium">Sell TBL</div>
                          <div className="text-sm text-muted-foreground">2024-04-05</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600">Completed</Badge>
                          <span className="font-medium">TZS 180,000</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <div className="font-medium">Deposit</div>
                          <div className="text-sm text-muted-foreground">2024-04-01</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600">Completed</Badge>
                          <span className="font-medium">TZS 500,000</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <div className="font-medium">Dividend Payment</div>
                          <div className="text-sm text-muted-foreground">2024-03-25</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600">Completed</Badge>
                          <span className="font-medium">TZS 25,000</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" size="sm">
                        View All Transactions
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Message Dialog */}
      {showMessageDialog && (
        <ClientMessageDialog
          isOpen={showMessageDialog}
          onClose={() => setShowMessageDialog(false)}
          client={{
            id: client.id,
            firstName: client.firstName,
            middleName: client.middleName,
            lastName: client.lastName,
            email: client.email
          }}
        />
      )}
    </>
  )
}
