import { NextRequest, NextResponse } from 'next/server';
import { PredictionMarket, PredictionOutcome, PredictionTrade, PredictionPosition } from '@/lib/prediction-market/types';
import { v4 as uuidv4 } from 'uuid';
// Import in-memory stores from the main route
import * as mainRoute from '../route';

// In-memory trades and positions (for demo)
const trades: PredictionTrade[] = [];
const positions: PredictionPosition[] = [];

// GET: Get market details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  // Access in-memory stores from main route
  // @ts-ignore
  const markets: PredictionMarket[] = mainRoute.markets;
  // @ts-ignore
  const outcomes: PredictionOutcome[] = mainRoute.outcomes;
  const market = markets.find(m => m.id === id);
  if (!market) {
    return NextResponse.json({ error: 'Market not found' }, { status: 404 });
  }
  const marketOutcomes = outcomes.filter(o => o.marketId === id);
  return NextResponse.json({ ...market, outcomes: marketOutcomes });
}

// POST: Handle trade (buy/sell shares)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id: marketId } = params;
  // Access in-memory stores from main route
  // @ts-ignore
  const markets: PredictionMarket[] = mainRoute.markets;
  // @ts-ignore
  const outcomes: PredictionOutcome[] = mainRoute.outcomes;
  const market = markets.find(m => m.id === marketId);
  if (!market) {
    return NextResponse.json({ error: 'Market not found' }, { status: 404 });
  }
  try {
    const body = await req.json();
    const { userId, outcomeId, type, shares, price } = body;
    if (!userId || !outcomeId || !['buy', 'sell'].includes(type) || !shares || shares <= 0 || !price || price < 0) {
      return NextResponse.json({ error: 'Invalid trade input' }, { status: 400 });
    }
    const outcome = outcomes.find(o => o.id === outcomeId && o.marketId === marketId);
    if (!outcome) {
      return NextResponse.json({ error: 'Outcome not found' }, { status: 404 });
    }
    // Update outcome shares
    if (type === 'buy') {
      outcome.shares += shares;
    } else if (type === 'sell') {
      // Check user position
      const userPos = positions.find(p => p.userId === userId && p.marketId === marketId && p.outcomeId === outcomeId);
      if (!userPos || userPos.shares < shares) {
        return NextResponse.json({ error: 'Not enough shares to sell' }, { status: 400 });
      }
      outcome.shares -= shares;
    }
    // Update user position
    let position = positions.find(p => p.userId === userId && p.marketId === marketId && p.outcomeId === outcomeId);
    if (!position) {
      position = { userId, marketId, outcomeId, shares: 0 };
      positions.push(position);
    }
    if (type === 'buy') {
      position.shares += shares;
    } else {
      position.shares -= shares;
    }
    // Store trade
    const trade: PredictionTrade = {
      id: uuidv4(),
      userId,
      marketId,
      outcomeId,
      type,
      shares,
      price,
      createdAt: new Date(),
    };
    trades.push(trade);
    // Return updated market and user position
    const marketOutcomes = outcomes.filter(o => o.marketId === marketId);
    return NextResponse.json({
      market: { ...market, outcomes: marketOutcomes },
      position,
      trade,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
} 