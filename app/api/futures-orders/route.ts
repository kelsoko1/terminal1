import { NextRequest, NextResponse } from 'next/server'

let orderBook: any[] = []
let trades: any[] = []

// Simple matching engine: match buy/sell at same price and symbol
function matchOrders() {
  const buys = orderBook.filter(o => o.side === 'buy')
  const sells = orderBook.filter(o => o.side === 'sell')
  for (const buy of buys) {
    for (const sell of sells) {
      if (buy.symbol === sell.symbol && buy.price >= sell.price && buy.quantity > 0 && sell.quantity > 0) {
        const matchedQty = Math.min(buy.quantity, sell.quantity)
        trades.push({
          symbol: buy.symbol,
          price: sell.price,
          quantity: matchedQty,
          buyUser: buy.user,
          sellUser: sell.user,
          status: 'open',
          timestamp: new Date().toISOString(),
        })
        buy.quantity -= matchedQty
        sell.quantity -= matchedQty
      }
    }
  }
  // Remove filled orders
  orderBook = orderBook.filter(o => o.quantity > 0)
}

export async function GET() {
  return NextResponse.json({ orderBook, trades })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  orderBook.push({ ...data, timestamp: new Date().toISOString() })
  matchOrders()
  return NextResponse.json({ success: true, orderBook, trades })
}

// (Optional) Settlement endpoint could be added here 