'use client';

import { useState } from 'react';
import axios from 'axios';
import { useStore } from '@/lib/store';
import { Stock } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface TradeModalProps {
  stock: Stock;
  type: 'buy' | 'sell';
  onClose: () => void;
}

export function TradeModal({ stock, type, onClose }: TradeModalProps) {
  const [quantity, setQuantity] = useState('1');
  const { user, setUser, addTrade } = useStore();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleTrade = async () => {
    if (!user) return;

    const qty = parseInt(quantity);
    const total = qty * stock.price;
    
    setIsProcessing(true);

    try {
      // Validate the trade
      if (type === 'buy') {
        if (total > user.balance) {
          toast({
            title: 'Insufficient funds',
            description: 'You do not have enough balance for this trade.',
            variant: 'destructive',
          });
          return;
        }
      } else {
        // For sell orders, check if user has enough shares
        const currentQty = user.portfolio[stock.symbol]?.quantity || 0;
        if (qty > currentQty) {
          toast({
            title: 'Insufficient shares',
            description: 'You do not have enough shares for this trade.',
            variant: 'destructive',
          });
          return;
        }
      }

      // Submit the trade to the API
      const response = await axios.post('/api/trading/trades', {
        userId: user.id,
        symbol: stock.symbol,
        quantity: qty,
        price: stock.price,
        type: type.toUpperCase(),
      });
      
      // Add the trade to the local state
      addTrade({
        id: response.data.id,
        userId: user.id,
        symbol: stock.symbol,
        quantity: qty,
        price: stock.price,
        type: type.toUpperCase(),
        timestamp: new Date().toISOString(),
      });

      // Update local state based on trade type
      if (type === 'buy') {
        setUser({
          ...user,
          balance: user.balance - total,
          portfolio: {
            ...user.portfolio,
            [stock.symbol]: {
              quantity: (user.portfolio[stock.symbol]?.quantity || 0) + qty,
              averagePrice:
                ((user.portfolio[stock.symbol]?.averagePrice || 0) *
                  (user.portfolio[stock.symbol]?.quantity || 0) +
                  total) /
                ((user.portfolio[stock.symbol]?.quantity || 0) + qty),
            },
          },
        });
      } else {
        const currentQty = user.portfolio[stock.symbol]?.quantity || 0;
        const newQty = currentQty - qty;
        const newPortfolio = { ...user.portfolio };
        
        if (newQty === 0) {
          delete newPortfolio[stock.symbol];
        } else {
          newPortfolio[stock.symbol] = {
            ...newPortfolio[stock.symbol],
            quantity: newQty,
          };
        }

        setUser({
          ...user,
          balance: user.balance + total,
          portfolio: newPortfolio,
        });
      }

      // Add the trade to the store
      await addTrade({
        symbol: stock.symbol,
        quantity: qty,
        price: stock.price,
        type,
        timestamp: new Date(),
      });

      toast({
        title: 'Trade executed',
        description: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${qty} shares of ${stock.symbol}`,
      });

      onClose();
    } catch (error) {
      console.error('Error executing trade:', error);
      toast({
        title: 'Trade failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'buy' ? 'Buy' : 'Sell'} {stock.symbol}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="quantity">Quantity</label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="text-sm">
            Total: TZS {(parseInt(quantity) * stock.price).toFixed(2)}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleTrade} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : type === 'buy' ? 'Buy' : 'Sell'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}