'use client'

import React from 'react'
import { PortfolioDetails } from '@/components/portfolio/PortfolioDetails'

interface PortfolioPageProps {
  params: {
    id: string
  }
}

export default function PortfolioPage({ params }: PortfolioPageProps) {
  const handleTradeClick = (symbol: string) => {
    console.log(`Trade clicked for ${symbol}`);
    // Here you would typically navigate to a trading page or open a modal
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Portfolio Details</h1>
      <PortfolioDetails portfolioId={params.id} onTradeClick={handleTradeClick} />
    </div>
  )
} 