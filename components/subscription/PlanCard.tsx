import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    currency: string;
    interval: string;
    intervalCount: number;
    features: string[];
  };
  isCurrentPlan?: boolean;
  onSelect: (planId: string) => void;
}

export function PlanCard({ plan, isCurrentPlan, onSelect }: PlanCardProps) {
  const formatInterval = (interval: string, count: number) => {
    switch (interval) {
      case 'MONTHLY':
        return count === 1 ? 'month' : `${count} months`;
      case 'QUARTERLY':
        return count === 1 ? 'quarter' : `${count} quarters`;
      case 'YEARLY':
        return count === 1 ? 'year' : `${count} years`;
      default:
        return interval.toLowerCase();
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <Card className={`w-full max-w-sm ${isCurrentPlan ? 'border-primary' : ''}`}>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-3xl font-bold">{formatCurrency(plan.price, plan.currency)}</span>
          <span className="text-muted-foreground">/{formatInterval(plan.interval, plan.intervalCount)}</span>
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onSelect(plan.id)} 
          className="w-full" 
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
        </Button>
      </CardFooter>
    </Card>
  );
}
