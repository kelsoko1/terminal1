'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import { useWalletStore } from '@/lib/store/walletStore';
import { useToast } from '@/components/ui/use-toast';

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositDialog({ open, onOpenChange }: DepositDialogProps) {
  const { toast } = useToast();
  const { deposit, addTransaction, initiateUSSDDeposit, initiateAzamPesaDeposit, initiateCardDeposit } = useWalletStore();
  
  const [amount, setAmount] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCVC, setCardCVC] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit-card');
  const [mobileProvider, setMobileProvider] = useState<string>('mpesa');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card number with spaces every 4 digits
    const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    const formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formattedValue);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format expiry as MM/YY
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 2) {
      setCardExpiry(value);
    } else {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    }
  };

  const handleCreditCardDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to deposit",
        variant: "destructive",
      });
      return;
    }

    if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
      toast({
        title: "Missing information",
        description: "Please fill in all card details",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const cardDetails = {
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardExpiry,
        cardCVC,
        cardName,
      };
      const depositAmount = parseFloat(amount);
      const result = await initiateCardDeposit(cardDetails, depositAmount, email);
      if (result.success) {
        addTransaction({
          type: 'deposit',
          method: 'credit-card',
          amount: depositAmount,
          status: 'pending', // Mark as pending until confirmed
        });
        toast({
          title: "Deposit initiated",
          description: result.message,
        });
        resetForm();
        onOpenChange(false);
      } else {
        toast({
          title: "Deposit failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Credit card deposit error:', error);
      toast({
        title: "Deposit failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMobileMoneyDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to deposit",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber) {
      toast({
        title: "Missing information",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const depositAmount = parseFloat(amount);
      
      if (mobileProvider === 'azampesa') {
        const result = await initiateAzamPesaDeposit(phoneNumber, depositAmount, email);
        
        if (result.success) {
          toast({
            title: "Deposit initiated",
            description: result.message,
          });
          
          // Reset form and close dialog
          resetForm();
          onOpenChange(false);
        } else {
          toast({
            title: "Deposit failed",
            description: result.message,
            variant: "destructive",
          });
        }
      } else {
        // For other mobile money providers (mpesa, tigopesa, airtelmoney)
        const result = await initiateUSSDDeposit(mobileProvider, phoneNumber, depositAmount);
        
        if (result.success) {
          toast({
            title: "Deposit initiated",
            description: result.message,
          });
          
          // Reset form and close dialog
          resetForm();
          onOpenChange(false);
        } else {
          toast({
            title: "Deposit failed",
            description: result.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Mobile money deposit error:', error);
      toast({
        title: "Deposit failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setPhoneNumber('');
    setEmail('');
    setCardNumber('');
    setCardExpiry('');
    setCardCVC('');
    setCardName('');
    setPaymentMethod('credit-card');
    setMobileProvider('mpesa');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            Add money to your wallet using your preferred payment method.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="credit-card" value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credit-card" className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              Credit Card
            </TabsTrigger>
            <TabsTrigger value="mobile-money" className="flex items-center">
              <Smartphone className="mr-2 h-4 w-4" />
              Mobile Money
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4 mb-2">
            <Label htmlFor="deposit-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">Tsh</span>
              <Input
                id="deposit-amount"
                type="text"
                placeholder="0.00"
                className="pl-10"
                value={amount}
                onChange={handleAmountChange}
                disabled={isProcessing}
              />
            </div>
          </div>
          
          <TabsContent value="credit-card" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-name">Name on Card</Label>
              <Input
                id="card-name"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                disabled={isProcessing}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  maxLength={5}
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cardCVC}
                  onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  maxLength={3}
                  disabled={isProcessing}
                />
              </div>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-md flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <p className="text-sm text-amber-800">
                use a valid credit card information.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="mobile-money" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile-provider">Mobile Money Provider</Label>
              <select
                id="mobile-provider"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={mobileProvider}
                onChange={(e) => setMobileProvider(e.target.value)}
                disabled={isProcessing}
              >
                <option value="mpesa">M-Pesa</option>
                <option value="tigopesa">Tigo Pesa</option>
                <option value="airtelmoney">Airtel Money</option>
                <option value="azampesa">Azam Pesa</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                placeholder="+255 XXX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            
            {mobileProvider === 'azampesa' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            )}
            
            <div className="bg-blue-50 p-3 rounded-md flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <p className="text-sm text-blue-800">
                You will receive a prompt on your mobile device to confirm the payment.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={paymentMethod === 'credit-card' ? handleCreditCardDeposit : handleMobileMoneyDeposit}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              'Deposit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
