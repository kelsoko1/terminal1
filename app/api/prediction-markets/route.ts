import { NextRequest, NextResponse } from 'next/server';
import { PredictionMarket, PredictionOutcome, PredictionMarketStatus } from '@/lib/prediction-market/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store (replace with DB in production)
const markets: PredictionMarket[] = [];
const outcomes: PredictionOutcome[] = [];

// GET: List all prediction markets
export async function GET(req: NextRequest) {
  // Return all markets with their outcomes
  const result = markets.map(market => ({
    ...market,
    outcomes: outcomes.filter(o => o.marketId === market.id),
  }));
  return NextResponse.json(result);
}

// POST: Create a new prediction market
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, outcomes: outcomeLabels, closeAt, creatorUserId } = body;
    if (!title || !description || !Array.isArray(outcomeLabels) || outcomeLabels.length < 2 || !closeAt) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const marketId = uuidv4();
    const now = new Date();
    const market: PredictionMarket = {
      id: marketId,
      title,
      description,
      creatorUserId: creatorUserId || 'demo-user', // Replace with real user ID from auth
      createdAt: now,
      closeAt: new Date(closeAt),
      status: 'open',
    };
    markets.push(market);
    // Create outcomes
    const marketOutcomes: PredictionOutcome[] = outcomeLabels.map((label: string) => ({
      id: uuidv4(),
      marketId,
      label,
      shares: 0,
    }));
    outcomes.push(...marketOutcomes);
    return NextResponse.json({ ...market, outcomes: marketOutcomes });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
} 