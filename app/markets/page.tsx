import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { FinancialAdvisorChat } from '@/components/markets/FinancialAdvisorChat';

export default function MarketsPage() {
  return (
    <div className="h-screen">
      <FinancialAdvisorChat />
    </div>
  );
}