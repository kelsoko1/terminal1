'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, Plus, Clock } from 'lucide-react';
import { DepositDialog } from '@/components/wallet/DepositDialog';
import { WithdrawDialog } from '@/components/wallet/WithdrawDialog';
import { useWalletStore } from '@/lib/store/walletStore';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

interface WalletData {
  balance: number;
  currency: string;
  pendingDeposits: number;
  pendingWithdrawals: number;
  transactions: Transaction[];
}

export default function WalletPage() {
  const { balance, totalDeposits, totalWithdrawals, transactions, lastDepositDate, lastWithdrawalDate } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  // Convert wallet store transactions to the format expected by the UI
  const mapTransactions = (): Transaction[] => {
    return transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      currency: 'TZS', // Default currency
      status: tx.status,
      date: tx.date
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={() => setDepositDialogOpen(true)}
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Deposit
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={() => setWithdrawDialogOpen(true)}
          >
            <ArrowDownLeft className="mr-2 h-4 w-4" />
            Withdraw
          </Button>
        </div>
      </div>

      <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${balance.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Deposits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${transactions.filter(tx => tx.type === 'deposit' && tx.status === 'pending').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${transactions.filter(tx => tx.type === 'withdrawal' && tx.status === 'pending').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mapTransactions().map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          {transaction.type === 'deposit' ? (
                            <div className="bg-green-100 p-2 rounded-full mr-4">
                              <ArrowUpRight className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="bg-red-100 p-2 rounded-full mr-4">
                              <ArrowDownLeft className="h-5 w-5 text-red-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className={`font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                          </div>
                          {transaction.status === 'pending' && (
                            <div className="ml-2 flex items-center text-amber-600">
                              <Clock className="h-4 w-4 mr-1" />
                              <span className="text-xs">Pending</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="deposits" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Deposits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mapTransactions()
                      .filter(t => t.type === 'deposit')
                      .map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-full mr-4">
                              <ArrowUpRight className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">Deposit</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="font-medium text-green-600">
                              +${transaction.amount.toLocaleString()}
                            </div>
                            {transaction.status === 'pending' && (
                              <div className="ml-2 flex items-center text-amber-600">
                                <Clock className="h-4 w-4 mr-1" />
                                <span className="text-xs">Pending</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="withdrawals" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Withdrawals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mapTransactions()
                      .filter(t => t.type === 'withdrawal')
                      .map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <div className="bg-red-100 p-2 rounded-full mr-4">
                              <ArrowDownLeft className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <div className="font-medium">Withdrawal</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="font-medium text-red-600">
                              -${transaction.amount.toLocaleString()}
                            </div>
                            {transaction.status === 'pending' && (
                              <div className="ml-2 flex items-center text-amber-600">
                                <Clock className="h-4 w-4 mr-1" />
                                <span className="text-xs">Pending</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </>
      {/* Deposit and Withdraw Dialogs */}
      <DepositDialog 
        open={depositDialogOpen} 
        onOpenChange={setDepositDialogOpen} 
      />
      
      <WithdrawDialog 
        open={withdrawDialogOpen} 
        onOpenChange={setWithdrawDialogOpen} 
      />
    </div>
  );
}
