import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, ArrowDownIcon, PlusIcon, MinusIcon } from 'lucide-react';
import { recordTransaction, getSymbolColor, getMarketStatus } from '@/lib/utils/market-colors';
import { Input } from '@/components/ui/input';

export default function AccountBalance() {
  const [balance, setBalance] = useState(10000);
  const [previousBalance, setPreviousBalance] = useState(10000);
  const [amount, setAmount] = useState(1000);
  const [recentAction, setRecentAction] = useState<'deposit' | 'withdrawal' | null>(null);
  const accountId = 'main-account'; // Unique identifier for the account
  
  // Calculate the change percentage
  const changePercent = previousBalance !== 0 
    ? ((balance - previousBalance) / Math.abs(previousBalance)) * 100 
    : 0;
  
  // Handle deposit
  const handleDeposit = () => {
    setPreviousBalance(balance);
    setBalance(prev => prev + amount);
    recordTransaction(accountId, 'deposit');
    setRecentAction('deposit');
    
    // Reset the action after the effect duration
    setTimeout(() => {
      setRecentAction(null);
    }, 1000);
  };
  
  // Handle withdrawal
  const handleWithdrawal = () => {
    setPreviousBalance(balance);
    setBalance(prev => prev - amount);
    recordTransaction(accountId, 'withdrawal');
    setRecentAction('withdrawal');
    
    // Reset the action after the effect duration
    setTimeout(() => {
      setRecentAction(null);
    }, 1000);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Account Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Current Balance:</span>
            <span className="text-2xl font-bold">
              TZS {balance.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Change:</span>
            <span 
              className={`flex items-center ${getSymbolColor(accountId, changePercent, getMarketStatus())}`}
            >
              {changePercent >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(changePercent).toFixed(2)}%
            </span>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                className="flex-1 flex items-center justify-center" 
                onClick={handleDeposit}
              >
                <PlusIcon className="h-4 w-4 mr-2" /> Deposit
              </Button>
              <Button 
                className="flex-1 flex items-center justify-center" 
                variant="outline"
                onClick={handleWithdrawal}
              >
                <MinusIcon className="h-4 w-4 mr-2" /> Withdraw
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
