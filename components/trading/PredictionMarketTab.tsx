'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Star, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface Outcome {
  id: string;
  label: string;
  shares: number;
}

interface Market {
  id: string;
  title: string;
  description: string;
  status: string;
  closeAt: string;
  outcomes: Outcome[];
  priceHistory?: { date: string; price: number }[];
}

const DEMO_MARKETS: Market[] = [
  {
    id: 'demo-1',
    title: 'Will BTC close above $50,000 this month?',
    description: 'Predict if Bitcoin will close above $50,000 by the end of the month.',
    status: 'open',
    closeAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    outcomes: [
      { id: 'demo-1-yes', label: 'Yes', shares: 120 },
      { id: 'demo-1-no', label: 'No', shares: 80 },
    ],
    priceHistory: [
      { date: '2024-06-01', price: 0.45 },
      { date: '2024-06-02', price: 0.48 },
      { date: '2024-06-03', price: 0.51 },
      { date: '2024-06-04', price: 0.49 },
      { date: '2024-06-05', price: 0.53 },
      { date: '2024-06-06', price: 0.50 },
    ],
  },
  {
    id: 'demo-2',
    title: 'Will the S&P 500 rise this week?',
    description: 'Predict if the S&P 500 index will end the week higher than it started.',
    status: 'open',
    closeAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    outcomes: [
      { id: 'demo-2-yes', label: 'Yes', shares: 95 },
      { id: 'demo-2-no', label: 'No', shares: 105 },
    ],
    priceHistory: [
      { date: '2024-06-01', price: 0.52 },
      { date: '2024-06-02', price: 0.54 },
      { date: '2024-06-03', price: 0.50 },
      { date: '2024-06-04', price: 0.56 },
      { date: '2024-06-05', price: 0.55 },
      { date: '2024-06-06', price: 0.57 },
    ],
  },
  {
    id: 'demo-3',
    title: 'Will it rain in London tomorrow?',
    description: 'Predict if there will be measurable rainfall in London tomorrow.',
    status: 'open',
    closeAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    outcomes: [
      { id: 'demo-3-yes', label: 'Yes', shares: 60 },
      { id: 'demo-3-no', label: 'No', shares: 140 },
    ],
    priceHistory: [
      { date: '2024-06-01', price: 0.38 },
      { date: '2024-06-02', price: 0.41 },
      { date: '2024-06-03', price: 0.40 },
      { date: '2024-06-04', price: 0.43 },
      { date: '2024-06-05', price: 0.39 },
      { date: '2024-06-06', price: 0.42 },
    ],
  },
];

function statusColor(status: string) {
  if (status === 'open') return 'bg-green-100 text-green-800';
  if (status === 'closed') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-200 text-gray-600';
}

export default function PredictionMarketTab() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<{ [id: string]: boolean }>({});
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [trade, setTrade] = useState<{ outcomeId: string; shares: number; type: 'buy' | 'sell' } | null>(null);
  const [tradeResult, setTradeResult] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/prediction-markets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMarkets(data);
        } else {
          setMarkets(DEMO_MARKETS);
        }
        setLoading(false);
      })
      .catch(() => {
        setMarkets(DEMO_MARKETS);
        setLoading(false);
      });
  }, []);

  const handleFavorite = (id: string) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openSheet = (market: Market) => {
    setSelectedMarket(market);
    setShowSheet(true);
    setTrade(null);
    setTradeResult(null);
  };

  const handleTradeChange = (outcomeId: string, field: 'shares' | 'type', value: any) => {
    setTrade(prev => ({
      outcomeId,
      shares: field === 'shares' ? Number(value) : prev?.shares || 0,
      type: field === 'type' ? value : prev?.type || 'buy',
    }));
  };

  const handleTrade = () => {
    if (!trade || !trade.shares || !trade.outcomeId) {
      setTradeResult('Please select outcome and enter shares.');
      return;
    }
    setTradeResult('Demo: Trade placed!');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Prediction Markets</h2>
            <p className="text-muted-foreground">Trade on the outcome of real-world events. Click a contract to view details and trade.</p>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : markets.length === 0 ? (
          <div className="text-center py-8">No prediction markets found.</div>
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            {markets.map(market => {
              // Calculate price change for demo (last - first)
              const priceHistory = market.priceHistory || [];
              const priceChange = priceHistory.length > 1 ? ((priceHistory[priceHistory.length - 1].price - priceHistory[0].price) * 100) : 0;
              const priceChangePct = priceHistory.length > 1 ? (((priceHistory[priceHistory.length - 1].price - priceHistory[0].price) / priceHistory[0].price) * 100).toFixed(2) : '0.00';
              return (
                <div
                  key={market.id}
                  className={`relative flex flex-col sm:flex-row items-center bg-card backdrop-blur-md rounded-2xl cursor-pointer border-l-8 border-blue-600 hover:scale-[1.03] hover:shadow-2xl hover:bg-card/90 transition group px-6 py-4 shadow-lg mb-2 w-full max-w-3xl`}
                  onClick={() => openSheet(market)}
                  style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)', overflow: 'visible', position: 'relative' }}
                >
                  {/* Icon & Status */}
                  <div className="flex flex-col items-center mr-6">
                    <span className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 border-2 border-white/30 shadow-lg text-2xl">
                      <RefreshCw className="w-8 h-8 text-blue-400" />
                    </span>
                    <span className={`mt-3 px-2 py-1 rounded text-xs font-semibold ${statusColor(market.status)}`}>{market.status.charAt(0).toUpperCase() + market.status.slice(1)}</span>
                  </div>
                  {/* Main Info */}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-foreground text-lg leading-tight truncate max-w-[260px] drop-shadow-md">
                        {market.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {/* Favorite star */}
                        <button
                          className="ml-1 p-1 rounded-full hover:bg-background/20 transition"
                          onClick={e => { e.stopPropagation(); handleFavorite(market.id); }}
                          aria-label="Add to watchlist"
                          type="button"
                        >
                          <Star className={`w-5 h-5 ${favorites[market.id] ? 'text-yellow-400 fill-yellow-400' : 'text-foreground'}`} fill={favorites[market.id] ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-muted-foreground text-sm font-medium flex-wrap">
                      <span>Closes: {new Date(market.closeAt).toLocaleString()}</span>
                    </div>
                    {/* Short description */}
                    {market.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{market.description}</div>}
                    {/* Outcomes */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {market.outcomes.map(outcome => (
                        <span key={outcome.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {outcome.label} <span className="text-gray-500">({outcome.shares})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Mini Chart & Price */}
                  <div className="flex flex-col items-end ml-6 min-w-[90px]">
                    <span className={`flex items-center font-bold text-base ${priceChange > 0 ? 'text-green-400' : priceChange < 0 ? 'text-red-400' : 'text-foreground'}`}>
                      {priceChange > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : priceChange < 0 ? <ArrowDownRight className="w-4 h-4 mr-1" /> : null}
                      {priceChangePct}%
                    </span>
                    {/* Mini chart */}
                    <div className="w-24 h-8 mt-3 bg-muted/40 rounded-md flex items-center justify-center text-[11px] text-foreground">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceHistory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      {/* Side Sheet for Market Details & Trading */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent side="right" className="max-w-xl w-full bg-card backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-slide-in-right px-2 sm:px-6 py-4 flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-2xl font-extrabold text-foreground drop-shadow-lg tracking-tight truncate">
              {selectedMarket ? selectedMarket.title : ''}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground mb-2 text-base font-medium drop-shadow-sm bg-background/10 rounded-lg px-3 py-2" style={{ backdropFilter: 'blur(1px)' }}>
              {selectedMarket ? selectedMarket.description : ''}
            </SheetDescription>
          </SheetHeader>
          {selectedMarket && (
            <div className="mt-4 space-y-4">
              {/* Chart */}
              {selectedMarket.priceHistory && (
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-2">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={selectedMarket.priceHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={['auto', 'auto']} tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                      <RechartsTooltip contentStyle={{ background: 'hsl(var(--background))', border: 'none', color: 'hsl(var(--foreground))', fontSize: 12 }} formatter={(v: number) => v.toFixed(2)} />
                      <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-muted-foreground text-center mt-1">Price History</div>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                {selectedMarket.outcomes.map(outcome => (
                  <button
                    key={outcome.id}
                    className={`px-3 py-2 rounded-lg border text-sm font-semibold ${trade?.outcomeId === outcome.id ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200'} transition`}
                    onClick={() => handleTradeChange(outcome.id, 'type', trade?.type || 'buy')}
                  >
                    {outcome.label} <span className="text-xs text-gray-200">({outcome.shares})</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-end">
                <input
                  type="number"
                  min={1}
                  placeholder="Shares"
                  className="border rounded px-2 py-1 w-24"
                  value={trade?.shares || ''}
                  onChange={e => handleTradeChange(trade?.outcomeId || selectedMarket.outcomes[0].id, 'shares', e.target.value)}
                />
                <select
                  className="border rounded px-2 py-1"
                  value={trade?.type || 'buy'}
                  onChange={e => handleTradeChange(trade?.outcomeId || selectedMarket.outcomes[0].id, 'type', e.target.value)}
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
                <button
                  className="ml-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleTrade}
                >
                  Submit
                </button>
              </div>
              {tradeResult && <div className="mt-2 text-blue-700 text-sm">{tradeResult}</div>}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
} 