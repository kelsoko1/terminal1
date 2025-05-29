'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Wallet() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('all');
  const [walletData, setWalletData] = useState({
    summary: {
      availableBalance: 0,
      pendingDeposits: 0,
      pendingWithdrawals: 0
    },
    transactions: [],
    deposits: [],
    withdrawals: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/wallet/transactions?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch wallet data: ${response.status}`);
        }
        
        const data = await response.json();
        setWalletData(data);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWalletData();
  }, [user?.id]);

  // Handle deposit
  const handleDeposit = async () => {
    if (!user?.id || !depositAmount || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/wallet/transactions?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: depositAmount,
          type: 'deposit',
          description: 'Deposit'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to process deposit: ${response.status}`);
      }
      
      // Refresh wallet data
      const walletResponse = await fetch(`/api/wallet/transactions?userId=${user.id}`);
      const data = await walletResponse.json();
      setWalletData(data);
      
      // Reset form
      setDepositAmount('');
      setIsDepositOpen(false);
    } catch (error) {
      console.error('Error processing deposit:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!user?.id || !withdrawAmount || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/wallet/transactions?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          type: 'withdrawal',
          description: 'Withdrawal'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to process withdrawal: ${response.status}`);
      }
      
      // Refresh wallet data
      const walletResponse = await fetch(`/api/wallet/transactions?userId=${user.id}`);
      const data = await walletResponse.json();
      setWalletData(data);
      
      // Reset form
      setWithdrawAmount('');
      setIsWithdrawOpen(false);
    } catch (error) {
      console.error('Error processing withdrawal:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  // Get transactions based on active tab
  const getTransactions = () => {
    switch (activeTab) {
      case 'deposits':
        return walletData.deposits;
      case 'withdrawals':
        return walletData.withdrawals;
      default:
        return walletData.transactions;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <div className="flex gap-2">
          <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1">
                <ArrowUpIcon className="h-4 w-4" /> Deposit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deposit Funds</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium">Amount</label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleDeposit}
                  disabled={!depositAmount || isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Deposit'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1">
                <ArrowDownIcon className="h-4 w-4" /> Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium">Amount</label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || isProcessing || Number(withdrawAmount) > walletData.summary.availableBalance}
                >
                  {isProcessing ? 'Processing...' : 'Withdraw'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Available Balance</div>
            <div className="text-2xl font-bold">
              {formatCurrency(walletData.summary.availableBalance)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Pending Deposits</div>
            <div className="text-2xl font-bold">
              {formatCurrency(walletData.summary.pendingDeposits)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Pending Withdrawals</div>
            <div className="text-2xl font-bold">
              {formatCurrency(walletData.summary.pendingWithdrawals)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <h3 className="text-lg font-medium my-4">Transaction History</h3>
          <div className="space-y-2">
            {getTransactions().length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              getTransactions().map((transaction: any) => (
                <div 
                  key={transaction.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.amount > 0 ? (
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {transaction.amount > 0 ? 'Deposit' : 'Withdrawal'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className={`font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
