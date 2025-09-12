'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, Medal } from 'lucide-react'

interface Competitor {
  rank: number
  name: string
  profit: number
  winRate: number
  challengesWon: number
}

const mockLeaderboard: Competitor[] = [
  {
    rank: 1,
    name: 'John Makala',
    profit: 2850000,
    winRate: 78,
    challengesWon: 5
  },
  {
    rank: 2,
    name: 'Sarah Kimaro',
    profit: 2250000,
    winRate: 72,
    challengesWon: 4
  },
  {
    rank: 3,
    name: 'David Msangi',
    profit: 1950000,
    winRate: 68,
    challengesWon: 3
  },
  {
    rank: 4,
    name: 'Maria Joseph',
    profit: 1650000,
    winRate: 65,
    challengesWon: 3
  },
  {
    rank: 5,
    name: 'Peter Mushi',
    profit: 1450000,
    winRate: 62,
    challengesWon: 2
  }
]

export function CompetitionLeaderboard() {
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold">Top Traders</h2>
        </div>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800">
          Monthly Rankings
        </Badge>
      </div>

      <div className="space-y-4">
        {mockLeaderboard.map((trader) => (
          <div 
            key={trader.rank}
            className="p-4 rounded-lg bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${trader.rank === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                    trader.rank === 2 ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300' :
                    trader.rank === 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300'}
                `}>
                  {trader.rank === 1 ? (
                    <Trophy className="h-4 w-4" />
                  ) : trader.rank === 2 ? (
                    <Medal className="h-4 w-4" />
                  ) : trader.rank === 3 ? (
                    <Medal className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{trader.rank}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{trader.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {trader.challengesWon} challenges won
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-medium">
                    +TZS {trader.profit.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {trader.winRate}% win rate
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 