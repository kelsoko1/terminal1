import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  AlertTriangle,
  Globe,
  Calendar,
  Award,
  Briefcase,
  Trophy,
  Target,
  BookOpen,
} from 'lucide-react';

interface TraderStats {
  date: string;
  value: number;
}

interface TraderProfileProps {
  userId?: string;
}

const performanceData: TraderStats[] = [
  { date: 'Jan', value: 100 },
  { date: 'Feb', value: 112 },
  { date: 'Mar', value: 108 },
  { date: 'Apr', value: 125 },
  { date: 'May', value: 131 },
  { date: 'Jun', value: 142 },
];

const portfolioDistribution = [
  { name: 'Banking', percentage: 35 },
  { name: 'Consumer Goods', percentage: 25 },
  { name: 'Manufacturing', percentage: 20 },
  { name: 'REITs', percentage: 15 },
  { name: 'Others', percentage: 5 },
];

const achievements = [
  {
    id: '1',
    title: 'Banking Sector Expert',
    description: 'Achieved 20%+ returns in banking sector investments',
    icon: <Award className="h-5 w-5 text-yellow-500" />,
    date: 'March 2024',
  },
  {
    id: '2',
    title: 'Top Analysis Contributor',
    description: 'Shared 50+ high-quality market analyses',
    icon: <BookOpen className="h-5 w-5 text-blue-500" />,
    date: 'February 2024',
  },
  {
    id: '3',
    title: 'Risk Management Master',
    description: 'Maintained consistent returns with low volatility',
    icon: <Target className="h-5 w-5 text-green-500" />,
    date: 'January 2024',
  },
];

export function TraderProfile({ userId }: TraderProfileProps) {
  // In a real application, we would fetch the trader data based on userId
  // For now, we'll use the mock data
  
  return (
    <Card className="p-6">
      {/* Trader Header */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=johnmakala" />
          <AvatarFallback>JM</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">John Makala</h2>
            <span className="text-blue-500">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </span>
          </div>
          <div className="text-muted-foreground">@johnmakala</div>
          <div className="flex gap-4 mt-2">
            <Button variant="outline">Message</Button>
            <Button variant="outline">Follow</Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Challenges Won</div>
          <div className="text-2xl font-bold">12</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Return</div>
          <div className="text-2xl font-bold text-green-600">+156.8%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Risk Score</div>
          <div className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            4/10
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Trading Since</div>
          <div className="text-2xl font-bold">2021</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="achievements" className="flex-1">Achievements</TabsTrigger>
          <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
          <TabsTrigger value="portfolio" className="flex-1">Portfolio</TabsTrigger>
          <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <div className="space-y-4 mt-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="mt-1">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold">{achievement.title}</div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">{achievement.date}</div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="portfolio">
          <div className="space-y-4 mt-4">
            {portfolioDistribution.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="about">
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <span>Based in Dar es Salaam, Tanzania</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Member since January 2021</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Top 10 DSE Trader</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <span>Investment Strategy: Growth & Value</span>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Trading Strategy</h3>
              <p className="text-muted-foreground">
                Focus on fundamental analysis of DSE-listed companies with strong growth potential.
                Specializing in banking and consumer goods sectors. Long-term investment horizon
                with occasional swing trades based on technical analysis.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}