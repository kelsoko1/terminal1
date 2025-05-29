'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { useWalletStore } from '@/lib/store/walletStore';
import { useToast } from '@/components/ui/use-toast';

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawDialog({ open, onOpenChange }: WithdrawDialogProps) {
  const { toast } = useToast();
  const { balance, requestWithdrawal } = useWalletStore();
  
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('mpesa');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive",
      });
      return;
    }

    if (!accountNumber) {
      toast({
        title: "Missing information",
        description: "Please enter your account number or mobile number",
        variant: "destructive",
      });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount > balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough funds in your wallet",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await requestWithdrawal(
        withdrawAmount,
        paymentMethod,
        accountNumber,
        notes
      );
      
      if (result.success) {
        toast({
          title: "Withdrawal request submitted",
          description: result.message,
        });
        
        // Reset form and close dialog
        resetForm();
        onOpenChange(false);
      } else {
        toast({
          title: "Withdrawal failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal failed",
        description: "There was an error processing your withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setPaymentMethod('mpesa');
    setAccountNumber('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Withdraw money from your wallet to your preferred payment method.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">$</span>
              <Input
                id="withdraw-amount"
                type="text"
                placeholder="0.00"
                className="pl-7"
                value={amount}
                onChange={handleAmountChange}
                disabled={isProcessing}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Available balance: ${balance.toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="withdraw-method">Withdrawal Method</Label>
            <select
              id="withdraw-method"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={isProcessing}
            >
              <option value="mpesa">M-Pesa</option>
              <option value="Yas by Mixx">Yas by Mixx</option>
              <option value="airtelmoney">Airtel Money</option>
              <option value="azampesa">Azam Pesa</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="account-number">
              {paymentMethod === 'bank' ? 'Bank Account Number' : 'Mobile Number'}
            </Label>
            <Input
              id="account-number"
              placeholder={paymentMethod === 'bank' ? 'Enter your bank account number' : '+255 XXX XXX XXX'}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Add any additional information"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          
          <div className="bg-amber-50 p-3 rounded-md flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <p className="text-sm text-amber-800">
              Withdrawal requests are processed by brokers and may take up to 24 hours to complete.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              'Withdraw'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
