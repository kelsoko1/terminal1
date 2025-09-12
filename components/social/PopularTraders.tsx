import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, AlertTriangle } from 'lucide-react';

interface Trader {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isVerified: boolean;
  stats: {
    monthlyReturn: number;
    totalReturn: number;
    riskScore: number;
    copyInvestors: number;
    tags: string[];
  };
}

const mockTraders: Trader[] = [
  {
    id: '1',
    name: 'John Makala',
    handle: '@johnmakala',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johnmakala',
    isVerified: true,
    stats: {
      monthlyReturn: 12.5,
      totalReturn: 156.8,
      riskScore: 4,
      copyInvestors: 156,
      tags: ['Stocks', 'Long-term'],
    },
  },
  {
    id: '2',
    name: 'Sarah Kimaro',
    handle: '@sarahkimaro',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarahkimaro',
    isVerified: true,
    stats: {
      monthlyReturn: 8.7,
      totalReturn: 89.4,
      riskScore: 3,
      copyInvestors: 89,
      tags: ['Technical', 'Swing'],
    },
  },
  {
    id: '3',
    name: 'David Msangi',
    handle: '@davidmsangi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=davidmsangi',
    isVerified: true,
    stats: {
      monthlyReturn: 15.2,
      totalReturn: 203.6,
      riskScore: 7,
      copyInvestors: 234,
      tags: ['Aggressive', 'Growth'],
    },
  },
];

const TraderCard = ({ trader }: { trader: Trader }) => {
  return (
    <Card className="p-4 mb-4">
      <div className="flex items-start space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={trader.avatar} />
          <AvatarFallback>{trader.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">{trader.name}</span>
            {trader.isVerified && (
              <span className="text-blue-500">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </span>
            )}
            <span className="text-gray-500">{trader.handle}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <div className="text-sm text-gray-500">Monthly Return</div>
              <div className={`font-semibold ${trader.stats.monthlyReturn >= 0 ? 'investor-success' : 'investor-danger'}`}>
                {trader.stats.monthlyReturn >= 0 ? '+' : ''}{trader.stats.monthlyReturn}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Risk Score</div>
              <div className="flex items-center">
                <AlertTriangle className={`h-4 w-4 mr-1 ${
                  trader.stats.riskScore <= 3 ? 'investor-success' :
                  trader.stats.riskScore <= 6 ? 'investor-warning' : 'investor-danger'
                }`} />
                <span>{trader.stats.riskScore}/10</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Return</div>
              <div className={`font-semibold ${trader.stats.totalReturn >= 0 ? 'investor-success' : 'investor-danger'}`}>
                {trader.stats.totalReturn >= 0 ? '+' : ''}{trader.stats.totalReturn}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Copy Investors</div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{trader.stats.copyInvestors}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {trader.stats.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>

          <Button className="w-full mt-4" size="sm">
            Copy Trader
          </Button>
        </div>
      </div>
    </Card>
  );
};

export function PopularTraders() {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Popular Traders</h2>
        <Button variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {mockTraders.map((trader) => (
          <TraderCard key={trader.id} trader={trader} />
        ))}
      </div>
    </Card>
  );
} 