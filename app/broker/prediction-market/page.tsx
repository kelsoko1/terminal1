'use client';
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Download, Trash2, Eye } from 'lucide-react';

// Demo data
const demoMarkets = [
  {
    id: 'demo-1',
    title: 'Will BTC close above $50,000 this month?',
    status: 'open',
    closeAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Predict if Bitcoin will close above $50,000 by the end of the month.',
    category: 'Crypto',
    resolutionType: 'official',
    resolutionDetails: 'CoinGecko BTC price',
    outcomes: ['Yes', 'No'],
    flagged: false,
  },
  {
    id: 'demo-2',
    title: 'Will the S&P 500 rise this week?',
    status: 'open',
    closeAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Predict if the S&P 500 index will end the week higher than it started.',
    category: 'Finance',
    resolutionType: 'ai',
    resolutionDetails: 'AI checks news headlines',
    outcomes: ['Yes', 'No'],
    flagged: true,
  },
];
const leaderboardData = [
  { rank: 1, name: 'Alice', volume: 12000, profit: 3400 },
  { rank: 2, name: 'Bob', volume: 9500, profit: 2100 },
  { rank: 3, name: 'Carol', volume: 8700, profit: 1800 },
  { rank: 4, name: 'David', volume: 8000, profit: 1200 },
  { rank: 5, name: 'Eve', volume: 7200, profit: 900 },
];
const RESOLUTION_OPTIONS = [
  { value: 'official', label: 'Official Data Feed/API' },
  { value: 'ai', label: 'AI-Assisted' },
  { value: 'proof', label: 'User-Submitted Proof (image, doc, link)' },
  { value: 'vote', label: 'Community Vote' },
  { value: 'other', label: 'Other' },
];

type PredictionMarketForm = {
  title: string;
  description: string;
  outcomes: string[];
  category: string;
  resolutionType: string;
  resolutionDetails: string;
  resolutionFile: File | null;
  endDate: string;
};

export default function BrokerPredictionMarketPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [markets, setMarkets] = useState(demoMarkets);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<PredictionMarketForm>({
    title: '',
    description: '',
    outcomes: ['Yes', 'No'],
    category: '',
    resolutionType: '',
    resolutionDetails: '',
    resolutionFile: null,
    endDate: '',
  });
  const [formError, setFormError] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const leaderboardByVolume = [...leaderboardData].sort((a, b) => b.volume - a.volume);
  const leaderboardByProfit = [...leaderboardData].sort((a, b) => b.profit - a.profit);

  const handleFormChange = (field: string, value: any) => {
    setForm((prev: PredictionMarketForm) => ({ ...prev, [field]: value }));
  };
  const handleOutcomeChange = (idx: number, value: string) => {
    setForm((prev: PredictionMarketForm) => ({ ...prev, outcomes: prev.outcomes.map((o, i) => i === idx ? value : o) }));
  };
  const addOutcome = () => setForm((prev: PredictionMarketForm) => ({ ...prev, outcomes: [...prev.outcomes, ''] }));
  const removeOutcome = (idx: number) => {
    if (form.outcomes.length <= 2) return;
    setForm((prev: PredictionMarketForm) => ({ ...prev, outcomes: prev.outcomes.filter((_, i) => i !== idx) }));
  };
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      outcomes: ['Yes', 'No'],
      category: '',
      resolutionType: '',
      resolutionDetails: '',
      resolutionFile: null,
      endDate: '',
    });
    setFormError('');
  };
  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setForm: React.Dispatch<React.SetStateAction<PredictionMarketForm>>
  ) {
    setForm((prev: PredictionMarketForm) => ({ ...prev, resolutionFile: e.target.files?.[0] || null }));
  }
  const handleCreateMarket = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim() || !form.description.trim() || !form.category || !form.resolutionType || !form.endDate) {
      setFormError('Please fill all required fields.');
      return;
    }
    if (form.outcomes.length < 2 || form.outcomes.some(o => !o.trim())) {
      setFormError('Please provide at least 2 unique outcomes.');
      return;
    }
    if (new Set(form.outcomes.map(o => o.trim().toLowerCase())).size !== form.outcomes.length) {
      setFormError('Outcomes must be unique.');
      return;
    }
    if (new Date(form.endDate) <= new Date()) {
      setFormError('End date must be in the future.');
      return;
    }
    setMarkets(prev => [
      ...prev,
      {
        id: `demo-${prev.length + 1}`,
        title: form.title,
        status: 'open',
        closeAt: form.endDate,
        description: form.description,
        category: form.category,
        resolutionType: form.resolutionType,
        resolutionDetails: form.resolutionDetails,
        outcomes: form.outcomes,
        flagged: false,
      },
    ]);
    setShowCreateModal(false);
    resetForm();
  };
  const handleDeleteMarket = (id: string) => {
    setMarkets(prev => prev.filter(m => m.id !== id));
  };
  const handleResolveMarket = (id: string) => {
    setMarkets(prev => prev.map(m => m.id === id ? { ...m, status: 'resolved' } : m));
  };
  const handleRefundMarket = (id: string) => {
    setMarkets(prev => prev.map(m => m.id === id ? { ...m, status: 'refunded' } : m));
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-full md:max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Broker Prediction Markets</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Markets</TabsTrigger>
          <TabsTrigger value="create">Create Market</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="space-y-4">
            {/* Flagged Markets Section */}
            {markets.some(m => m.flagged && m.status !== 'refunded') && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-yellow-700 mb-2">Flagged Markets (Manual Review Required)</h3>
                <div className="space-y-2">
                  {markets.filter(m => m.flagged && m.status !== 'refunded').map(market => (
                    <div key={market.id} className="border-2 border-yellow-400 rounded-lg p-4 bg-yellow-50 shadow flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{market.title}</div>
                        <div className="text-xs text-gray-500">Status: {market.status}</div>
                        <div className="text-xs text-gray-500">Closes: {new Date(market.closeAt).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Category: {market.category}</div>
                        <div className="text-xs text-gray-500">Resolution: {market.resolutionType} {market.resolutionDetails && `- ${market.resolutionDetails}`}</div>
                      </div>
                      <div className="flex gap-2 mt-3 md:mt-0 md:ml-4">
                        <button
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 text-xs"
                          onClick={() => handleResolveMarket(market.id)}
                          disabled={market.status === 'resolved'}
                          title="Resolve"
                        >
                          <Eye className="w-4 h-4" /> Resolve
                        </button>
                        <button
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded text-red-700 text-xs"
                          onClick={() => handleRefundMarket(market.id)}
                          disabled={market.status === 'refunded'}
                          title="Refund"
                        >
                          <Trash2 className="w-4 h-4" /> Refund
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* All Markets Section */}
            {markets.length === 0 ? (
              <div className="text-muted-foreground">No prediction markets found.</div>
            ) : (
              <div className="space-y-2">
                {markets.filter(m => !m.flagged).map(market => (
                  <div key={market.id} className="border rounded-lg p-4 bg-white shadow flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{market.title}</div>
                      <div className="text-xs text-gray-500">Status: {market.status}</div>
                      <div className="text-xs text-gray-500">Closes: {new Date(market.closeAt).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Category: {market.category}</div>
                      <div className="text-xs text-gray-500">Resolution: {market.resolutionType} {market.resolutionDetails && `- ${market.resolutionDetails}`}</div>
                    </div>
                    <div className="flex gap-2 mt-3 md:mt-0 md:ml-4">
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 text-xs"
                        onClick={() => handleResolveMarket(market.id)}
                        disabled={market.status === 'resolved'}
                        title="Resolve"
                      >
                        <Eye className="w-4 h-4" /> Resolve
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded text-red-700 text-xs"
                        onClick={() => handleDeleteMarket(market.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="create">
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-4">Create Prediction Market</h2>
            <form onSubmit={handleCreateMarket} className="space-y-4 mt-4">
              <div>
                <label className="block font-medium mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={form.title}
                  onChange={e => handleFormChange('title', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Description <span className="text-red-500">*</span></label>
                <Textarea
                  className="border rounded px-3 py-2 w-full"
                  value={form.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Outcomes <span className="text-red-500">*</span></label>
                {form.outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-center mb-2">
                    <input
                      className="border rounded px-2 py-1 flex-1"
                      value={outcome}
                      onChange={e => handleOutcomeChange(idx, e.target.value)}
                      required
                    />
                    {form.outcomes.length > 2 && (
                      <button type="button" className="ml-2 text-red-600" onClick={() => removeOutcome(idx)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="mt-1 text-blue-600" onClick={addOutcome}>
                  + Add Outcome
                </button>
              </div>
              <div>
                <label className="block font-medium mb-1">Category <span className="text-red-500">*</span></label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={form.category}
                  onChange={e => handleFormChange('category', e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Politics">Politics</option>
                  <option value="Sports">Sports</option>
                  <option value="Weather">Weather</option>
                  <option value="Finance">Finance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Resolution Source <span className="text-red-500">*</span></label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={form.resolutionType}
                  onChange={e => handleFormChange('resolutionType', e.target.value)}
                  required
                >
                  <option value="">Select resolution method</option>
                  {RESOLUTION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {/* Show relevant input based on selection */}
                {form.resolutionType === 'official' && (
                  <input
                    className="border rounded px-3 py-2 w-full mt-2"
                    value={form.resolutionDetails}
                    onChange={e => handleFormChange('resolutionDetails', e.target.value)}
                    placeholder="e.g. CoinGecko BTC price, Official election results"
                    required
                  />
                )}
                {form.resolutionType === 'ai' && (
                  <input
                    className="border rounded px-3 py-2 w-full mt-2"
                    value={form.resolutionDetails}
                    onChange={e => handleFormChange('resolutionDetails', e.target.value)}
                    placeholder="Describe what the AI should look for (e.g. news headlines, web search)"
                    required
                  />
                )}
                {form.resolutionType === 'proof' && (
                  <div className="mt-2 space-y-2">
                    <input
                      className="border rounded px-3 py-2 w-full"
                      value={form.resolutionDetails}
                      onChange={e => handleFormChange('resolutionDetails', e.target.value)}
                      placeholder="Describe the required proof (e.g. upload image, link to doc)"
                      required
                    />
                    <input
                      type="file"
                      className="border rounded px-3 py-2 w-full"
                      onChange={e => handleFileChange(e, setForm)}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                  </div>
                )}
                {form.resolutionType === 'vote' && (
                  <div className="mt-2 text-muted-foreground text-sm">Outcome will be decided by community vote.</div>
                )}
                {form.resolutionType === 'other' && (
                  <input
                    className="border rounded px-3 py-2 w-full mt-2"
                    value={form.resolutionDetails}
                    onChange={e => handleFormChange('resolutionDetails', e.target.value)}
                    placeholder="Describe the resolution method"
                    required
                  />
                )}
              </div>
              <div>
                <label className="block font-medium mb-1">End Date <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  className="border rounded px-3 py-2 w-full"
                  value={form.endDate}
                  onChange={e => handleFormChange('endDate', e.target.value)}
                  required
                />
              </div>
              {formError && <div className="text-red-600 text-sm mt-2">{formError}</div>}
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
              >
                Create Market
              </button>
            </form>
          </div>
        </TabsContent>
        <TabsContent value="leaderboard">
          <div className="max-w-lg mx-auto">
            <Tabs defaultValue="volume" className="w-full mt-2">
              <TabsList className="mb-4 w-full grid grid-cols-2">
                <TabsTrigger value="volume">By Volume</TabsTrigger>
                <TabsTrigger value="profit">By Profit</TabsTrigger>
              </TabsList>
              <TabsContent value="volume">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left">Rank</th>
                        <th className="px-3 py-2 text-left">User</th>
                        <th className="px-3 py-2 text-right">Volume</th>
                        <th className="px-3 py-2 text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardByVolume.map((user, i) => (
                        <tr key={user.name} className="border-b last:border-b-0">
                          <td className="px-3 py-2 font-bold">{i + 1}</td>
                          <td className="px-3 py-2">{user.name}</td>
                          <td className="px-3 py-2 text-right">${user.volume.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-green-600 font-semibold">${user.profit.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="profit">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left">Rank</th>
                        <th className="px-3 py-2 text-left">User</th>
                        <th className="px-3 py-2 text-right">Profit</th>
                        <th className="px-3 py-2 text-right">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardByProfit.map((user, i) => (
                        <tr key={user.name} className="border-b last:border-b-0">
                          <td className="px-3 py-2 font-bold">{i + 1}</td>
                          <td className="px-3 py-2">{user.name}</td>
                          <td className="px-3 py-2 text-right text-green-600 font-semibold">${user.profit.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right">${user.volume.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 