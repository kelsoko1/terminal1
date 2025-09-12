import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart4, LineChart, PieChart, Settings, Plus, Edit, Trash2, Eye, Clock } from "lucide-react";
import Link from "next/link";

interface Ad {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  startDate: string;
  endDate?: string;
}

export function AccountAds() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'analytics' | 'settings'>('campaigns');
  
  // Sample ads data
  const [ads, setAds] = useState<Ad[]>([
    {
      id: 'ad1',
      name: 'Summer Investment Promotion',
      status: 'active',
      budget: 1000,
      spent: 450,
      impressions: 15000,
      clicks: 320,
      ctr: 2.13,
      startDate: '2025-04-01',
      endDate: '2025-06-30'
    },
    {
      id: 'ad2',
      name: 'New Investor Onboarding',
      status: 'paused',
      budget: 500,
      spent: 125,
      impressions: 4200,
      clicks: 85,
      ctr: 2.02,
      startDate: '2025-03-15',
      endDate: '2025-05-15'
    },
    {
      id: 'ad3',
      name: 'Premium Subscription Promo',
      status: 'draft',
      budget: 750,
      spent: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      startDate: '2025-05-01',
      endDate: '2025-07-31'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b">
        <button
          className={`px-6 py-3 font-medium text-center ${
            activeTab === 'campaigns'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('campaigns')}
        >
          Campaigns
        </button>
        <button
          className={`px-6 py-3 font-medium text-center ${
            activeTab === 'analytics'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`px-6 py-3 font-medium text-center ${
            activeTab === 'settings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Ad Campaigns</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Campaign
            </Button>
          </div>

          <div className="grid gap-4">
            {ads.map((ad) => (
              <Card key={ad.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">{ad.name}</CardTitle>
                    <CardDescription>
                      {ad.startDate} {ad.endDate ? `- ${ad.endDate}` : ''}
                    </CardDescription>
                  </div>
                  <Badge 
                    className={`${getStatusColor(ad.status)} text-white`}
                  >
                    {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium">{formatCurrency(ad.budget)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Spent</p>
                      <p className="font-medium">{formatCurrency(ad.spent)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="font-medium">{formatNumber(ad.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CTR</p>
                      <p className="font-medium">{ad.ctr}%</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(ad.spent / ad.budget) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-muted-foreground">
                      {Math.round((ad.spent / ad.budget) * 100)}% of budget spent
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {ad.status === 'active' && (
                    <Button variant="outline" size="sm">
                      <Clock className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  {ad.status === 'paused' && (
                    <Button variant="outline" size="sm" className="text-green-600">
                      <Clock className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {ads.length === 0 && (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">No Ad Campaigns</h3>
              <p className="text-muted-foreground mb-4">You haven't created any ad campaigns yet.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Campaign Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Impressions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">19,200</p>
                    <p className="text-sm text-green-600">+12.5% from last month</p>
                  </div>
                  <BarChart4 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Clicks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">405</p>
                    <p className="text-sm text-green-600">+8.3% from last month</p>
                  </div>
                  <LineChart className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">$575.00</p>
                    <p className="text-sm text-red-600">+15.2% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>Campaign metrics for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">Chart visualization would appear here</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center bg-muted/20 rounded-md">
                  <PieChart className="h-16 w-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ads.filter(ad => ad.status === 'active').map((ad) => (
                    <div key={ad.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{ad.name}</p>
                        <p className="text-sm text-muted-foreground">{formatNumber(ad.impressions)} impressions</p>
                      </div>
                      <p className="font-medium">{ad.ctr}% CTR</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Ad Account Settings</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your payment methods and billing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Billing Address</p>
                  <p className="text-sm text-muted-foreground">123 Main St, San Francisco, CA 94105</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Billing Threshold</p>
                  <p className="text-sm text-muted-foreground">You'll be charged when you reach $50.00</p>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive updates about your ad campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="budget-alerts">Budget Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications when your campaign reaches 50%, 75%, and 90% of budget</p>
                </div>
                <Switch id="budget-alerts" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="performance-reports">Weekly Performance Reports</Label>
                  <p className="text-sm text-muted-foreground">Get a summary of your ad performance every Monday</p>
                </div>
                <Switch id="performance-reports" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="campaign-end">Campaign End Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified 3 days before your campaigns end</p>
                </div>
                <Switch id="campaign-end" defaultChecked />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Default Campaign Settings</CardTitle>
              <CardDescription>Set default values for new ad campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Daily Budget</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">$</span>
                      <input
                        type="number"
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="50.00"
                        defaultValue="50.00"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Default Campaign Duration</Label>
                    <select className="w-full p-2 border rounded">
                      <option>7 days</option>
                      <option>14 days</option>
                      <option>30 days</option>
                      <option>Custom</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button>Save Default Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
