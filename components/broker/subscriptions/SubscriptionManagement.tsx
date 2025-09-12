import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Edit, Plus, Search, Trash2, Users, CreditCard, CalendarDays, ArrowUpDown, Download, FileText } from "lucide-react";

// Define subscription plan interface
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  features: string[];
  isActive: boolean;
  subscriberCount: number;
  createdAt: string;
}

// Define subscriber interface
interface Subscriber {
  id: string;
  name: string;
  email: string;
  planId: string;
  planName: string;
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PENDING';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  totalPaid: number;
}

// Define revenue data interface
interface RevenueData {
  month: string;
  revenue: number;
  subscribers: number;
  churnRate: number;
}

export function SubscriptionManagement() {
  const [activeTab, setActiveTab] = useState<'plans' | 'subscribers' | 'analytics'>('plans');
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false);
  const [showEditPlanDialog, setShowEditPlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample subscription plans data
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([
    {
      id: 'rafiki',
      name: 'Rafiki',
      description: 'Essential access to Rafiki features',
      price: 9.99,
      currency: 'USD',
      interval: 'MONTHLY',
      features: [
        'Access to core features',
        'Standard support',
        'Monthly newsletter'
      ],
      isActive: true,
      subscriberCount: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rafiki_plus',
      name: 'Rafiki+',
      description: 'Premium access to all Rafiki+ features',
      price: 99.90,
      currency: 'USD',
      interval: 'MONTHLY',
      features: [
        'All Rafiki features',
        'Priority support',
        'Exclusive premium content',
        'Early access to new features'
      ],
      isActive: true,
      subscriberCount: 0,
      createdAt: new Date().toISOString()
    }
  ]);

  // Sample subscribers data
  const [subscribers, setSubscribers] = useState<Subscriber[]>([
    {
      id: 'sub_001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      planId: 'plan_premium',
      planName: 'Premium Investor',
      status: 'ACTIVE',
      startDate: '2025-02-15',
      endDate: '2026-02-15',
      autoRenew: true,
      totalPaid: 99.99
    },
    {
      id: 'sub_002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      planId: 'plan_basic',
      planName: 'Basic Investor',
      status: 'ACTIVE',
      startDate: '2025-03-01',
      endDate: '2025-06-01',
      autoRenew: true,
      totalPaid: 89.97
    },
    {
      id: 'sub_003',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      planId: 'plan_enterprise',
      planName: 'Enterprise Investor',
      status: 'ACTIVE',
      startDate: '2025-01-10',
      endDate: '2026-01-10',
      autoRenew: false,
      totalPaid: 299.99
    },
    {
      id: 'sub_004',
      name: 'Emily Williams',
      email: 'emily.williams@example.com',
      planId: 'plan_basic',
      planName: 'Basic Investor',
      status: 'CANCELED',
      startDate: '2025-01-05',
      endDate: '2025-04-05',
      autoRenew: false,
      totalPaid: 59.98
    },
    {
      id: 'sub_005',
      name: 'David Lee',
      email: 'david.lee@example.com',
      planId: 'plan_premium',
      planName: 'Premium Investor',
      status: 'EXPIRED',
      startDate: '2024-11-15',
      endDate: '2025-02-15',
      autoRenew: false,
      totalPaid: 299.97
    }
  ]);

  // Sample revenue data
  const revenueData: RevenueData[] = [
    { month: 'Jan 2025', revenue: 12500, subscribers: 350, churnRate: 2.1 },
    { month: 'Feb 2025', revenue: 13800, subscribers: 385, churnRate: 1.8 },
    { month: 'Mar 2025', revenue: 15200, subscribers: 415, churnRate: 2.0 },
    { month: 'Apr 2025', revenue: 16500, subscribers: 450, churnRate: 1.5 }
  ];

  const formatCurrency = (amount: number, currency: string = 'TZS') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAddPlan = () => {
    // In a real application, this would make an API call to create the plan
    setShowAddPlanDialog(false);
  };

  // Edit plan dialog state
  const [editPlanFields, setEditPlanFields] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    interval: 'MONTHLY',
    features: '',
    isActive: true
  });

  useEffect(() => {
    if (selectedPlan && showEditPlanDialog) {
      setEditPlanFields({
        name: selectedPlan.name,
        description: selectedPlan.description,
        price: selectedPlan.price.toString(),
        currency: selectedPlan.currency,
        interval: selectedPlan.interval,
        features: selectedPlan.features.join('\n'),
        isActive: selectedPlan.isActive
      });
    }
  }, [selectedPlan, showEditPlanDialog]);

  const handleEditPlan = () => {
    if (!selectedPlan) return;
    setSubscriptionPlans(plans => plans.map(plan => plan.id === selectedPlan.id ? {
      ...plan,
      name: editPlanFields.name,
      description: editPlanFields.description,
      price: parseFloat(editPlanFields.price),
      currency: editPlanFields.currency,
      interval: editPlanFields.interval as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
      features: editPlanFields.features.split('\n').map(f => f.trim()).filter(Boolean),
      isActive: editPlanFields.isActive
    } : plan));
    setShowEditPlanDialog(false);
  };

  const handleTogglePlanStatus = (planId: string) => {
    setSubscriptionPlans(plans => 
      plans.map(plan => 
        plan.id === planId 
          ? { ...plan, isActive: !plan.isActive } 
          : plan
      )
    );
  };

  const filteredSubscribers = subscribers.filter(subscriber => 
    subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscriber.planName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Subscription Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="bg-transparent border rounded-lg p-1">
          <TabsTrigger 
            value="plans"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
          >
            Subscription Plans
          </TabsTrigger>
          <TabsTrigger 
            value="subscribers"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
          >
            Subscribers
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Manage Subscription Plans</CardTitle>
              <CardDescription>
                Create, edit, and manage your subscription plans for investors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Interval</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{plan.name}</div>
                          <div className="text-sm text-muted-foreground">{plan.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(plan.price, plan.currency)}</TableCell>
                      <TableCell>{plan.interval.charAt(0) + plan.interval.slice(1).toLowerCase()}</TableCell>
                      <TableCell>{plan.subscriberCount}</TableCell>
                      <TableCell>
                        <Badge className={plan.isActive ? "bg-green-500" : "bg-gray-500"}>
                          {plan.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setShowEditPlanDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={plan.isActive ? "outline" : "default"} 
                            size="sm"
                            onClick={() => handleTogglePlanStatus(plan.id)}
                          >
                            {plan.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {subscriptionPlans.length} plans
              </div>
              <Button 
                onClick={() => {
                  setSelectedPlan(null);
                  setShowAddPlanDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Plan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscriber Management</CardTitle>
                  <CardDescription>
                    View and manage all your subscription customers
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscribers..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Auto-Renew</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.name}</TableCell>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell>{subscriber.planName}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            subscriber.status === 'ACTIVE' ? "bg-green-500" : 
                            subscriber.status === 'CANCELED' ? "bg-yellow-500" : 
                            subscriber.status === 'EXPIRED' ? "bg-gray-500" : 
                            "bg-blue-500"
                          }
                        >
                          {subscriber.status.charAt(0) + subscriber.status.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(subscriber.startDate)}</TableCell>
                      <TableCell>{formatDate(subscriber.endDate)}</TableCell>
                      <TableCell>{subscriber.autoRenew ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredSubscribers.length} of {subscribers.length} subscribers
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export List
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{formatCurrency(58000)}</p>
                    <p className="text-sm text-green-600">+12.5% from last month</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">450</p>
                    <p className="text-sm text-green-600">+8.4% from last month</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Avg. Subscription Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{formatCurrency(128.89)}</p>
                    <p className="text-sm text-green-600">+3.2% from last month</p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription Revenue</CardTitle>
              <CardDescription>Monthly revenue and subscriber growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">Revenue chart visualization would appear here</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center bg-muted/20 rounded-md">
                  <p className="text-muted-foreground">Plan distribution chart would appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Subscribers</TableHead>
                      <TableHead>Churn Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueData.map((data) => (
                      <TableRow key={data.month}>
                        <TableCell>{data.month}</TableCell>
                        <TableCell>{formatCurrency(data.revenue)}</TableCell>
                        <TableCell>{data.subscribers}</TableCell>
                        <TableCell>{data.churnRate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Plan Dialog */}
      <Dialog open={showAddPlanDialog} onOpenChange={setShowAddPlanDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Subscription Plan</DialogTitle>
            <DialogDescription>
              Add a new subscription plan for your investors.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input id="name" placeholder="e.g. Premium Investor" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Brief description of the plan" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" placeholder="99.99" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select defaultValue="USD">
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interval">Billing Interval</Label>
              <Select defaultValue="MONTHLY">
                <SelectTrigger id="interval">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <textarea 
                id="features" 
                className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Access to premium content&#10;Priority support&#10;Advanced analytics"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPlanDialog(false)}>Cancel</Button>
            <Button onClick={handleAddPlan}>Create Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={showEditPlanDialog} onOpenChange={setShowEditPlanDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the details of your subscription plan.
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Plan Name</Label>
                <Input id="edit-name" value={editPlanFields.name} onChange={e => setEditPlanFields(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input id="edit-description" value={editPlanFields.description} onChange={e => setEditPlanFields(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Price</Label>
                  <Input id="edit-price" type="number" value={editPlanFields.price} onChange={e => setEditPlanFields(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-currency">Currency</Label>
                  <Select value={editPlanFields.currency} onValueChange={val => setEditPlanFields(f => ({ ...f, currency: val }))}>
                    <SelectTrigger id="edit-currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-interval">Billing Interval</Label>
                <Select value={editPlanFields.interval} onValueChange={val => setEditPlanFields(f => ({ ...f, interval: val }))}>
                  <SelectTrigger id="edit-interval">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-features">Features (one per line)</Label>
                <textarea 
                  id="edit-features" 
                  className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editPlanFields.features}
                  onChange={e => setEditPlanFields(f => ({ ...f, features: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="edit-active" checked={editPlanFields.isActive} onCheckedChange={val => setEditPlanFields(f => ({ ...f, isActive: val }))} />
                <Label htmlFor="edit-active">Plan is active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPlanDialog(false)}>Cancel</Button>
            <Button onClick={handleEditPlan}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
