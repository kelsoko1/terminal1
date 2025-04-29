import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, Award, Users, BookOpen } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  endDate: string;
  participants: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Performance' | 'Learning' | 'Community';
  isJoined?: boolean;
}

const initialChallenges: Challenge[] = [
  {
    id: '1',
    title: 'DSE Rookie Trader',
    description: 'Complete 10 successful trades with proper risk management',
    reward: 'Rookie Trader Badge + Trading Fee Discount',
    progress: 60,
    endDate: '2024-04-30',
    participants: 234,
    difficulty: 'Beginner',
    category: 'Learning',
    isJoined: false
  },
  {
    id: '2',
    title: 'Banking Sector Specialist',
    description: 'Achieve 15% return on banking sector investments',
    reward: 'Sector Specialist Badge + Premium Research Access',
    progress: 45,
    endDate: '2024-05-15',
    participants: 156,
    difficulty: 'Intermediate',
    category: 'Performance',
    isJoined: false
  },
  {
    id: '3',
    title: 'Community Mentor',
    description: 'Help 5 new investors by sharing detailed analysis',
    reward: 'Mentor Badge + Community Recognition',
    progress: 80,
    endDate: '2024-04-20',
    participants: 89,
    difficulty: 'Advanced',
    category: 'Community',
    isJoined: false
  }
];

export function TradingChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);

  const handleJoinChallenge = (challengeId: string) => {
    setChallenges(prevChallenges =>
      prevChallenges.map(challenge =>
        challenge.id === challengeId
          ? {
              ...challenge,
              isJoined: !challenge.isJoined,
              participants: challenge.isJoined
                ? challenge.participants - 1
                : challenge.participants + 1
            }
          : challenge
      )
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold">Trading Challenges</h2>
        </div>
        <Button variant="outline" size="sm">View All</Button>
      </div>

      <div className="space-y-6">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <Badge variant={
                    challenge.difficulty === 'Beginner' ? 'default' :
                    challenge.difficulty === 'Intermediate' ? 'secondary' : 'destructive'
                  }>
                    {challenge.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
              </div>
              <Button
                variant={challenge.isJoined ? "secondary" : "default"}
                size="sm"
                className="ml-4"
                onClick={() => handleJoinChallenge(challenge.id)}
              >
                {challenge.isJoined ? 'Leave' : 'Join'}
              </Button>
            </div>

            {challenge.isJoined && (
              <div className="flex items-center gap-2">
                <Progress value={challenge.progress} className="flex-1" />
                <span className="text-sm font-medium">{challenge.progress}%</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {challenge.participants}
                </span>
                <span className="text-muted-foreground">
                  Ends {new Date(challenge.endDate).toLocaleDateString()}
                </span>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                {challenge.category === 'Performance' && <TrendingUp className="h-3 w-3" />}
                {challenge.category === 'Learning' && <BookOpen className="h-3 w-3" />}
                {challenge.category === 'Community' && <Users className="h-3 w-3" />}
                {challenge.category}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Reward: {challenge.reward}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Complete challenges to earn badges, rewards, and improve your trading skills.
          New challenges are added regularly.
        </p>
      </div>
    </Card>
  );
}