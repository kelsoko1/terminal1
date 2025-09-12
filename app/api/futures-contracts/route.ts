import { NextRequest, NextResponse } from 'next/server'

// In-memory store for demonstration
let contracts: any[] = [
  { symbol: 'USD/TZS-JUN24', name: 'USD/TZS Futures', expiry: '2024-06-30', price: 2550, category: 'fx' },
  { symbol: 'EUR/USD-SEP24', name: 'EUR/USD Futures', expiry: '2024-09-30', price: 1.09, category: 'fx' },
  { symbol: 'COFFEE-DEC24', name: 'Coffee Futures', expiry: '2024-12-15', price: 3200, category: 'agriculture' },
  { symbol: 'COTTON-MAR25', name: 'Cotton Futures', expiry: '2025-03-20', price: 2100, category: 'agriculture' },
  { symbol: 'GOLD-JUN24', name: 'Gold Futures', expiry: '2024-06-30', price: 2875000, category: 'metals' },
  { symbol: 'SILVER-SEP24', name: 'Silver Futures', expiry: '2024-09-30', price: 35000, category: 'metals' },
  { symbol: 'TBILL-1Y-DEC24', name: '1Y Treasury Bill Futures', expiry: '2024-12-31', price: 98.5, category: 'rates' },
  { symbol: 'TBOND-10Y-JUN25', name: '10Y Treasury Bond Futures', expiry: '2025-06-30', price: 102.3, category: 'rates' },
  { symbol: 'BTC-USD-SEP24', name: 'Bitcoin Futures', expiry: '2024-09-30', price: 65000, category: 'crypto' },
  { symbol: 'ETH-USD-SEP24', name: 'Ethereum Futures', expiry: '2024-09-30', price: 3200, category: 'crypto' },
]

export async function GET() {
  return NextResponse.json({ contracts })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  contracts.push(data)
  return NextResponse.json({ success: true, contract: data })
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  contracts = contracts.map(c => c.symbol === data.symbol ? { ...c, ...data } : c)
  return NextResponse.json({ success: true, contract: data })
}

export async function DELETE(req: NextRequest) {
  const { symbol } = await req.json()
  contracts = contracts.filter(c => c.symbol !== symbol)
  return NextResponse.json({ success: true })
} 