'use client'

import { Card } from '@/components/ui/card'
import { Trophy, Users, TrendingUp } from 'lucide-react'

export function ChallengeStats() {
  // Mock data - replace with real API call
  const stats = [
    {
      title: 'Active Challenges',
      value: '12',
      change: '+2 this month',
      icon: Trophy,
      color: 'text-green-500'
    },
    {
      title: 'Total Participants',
      value: '1,234',
      change: '+123 this week',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Avg. Completion Rate',
      value: '76%',
      change: '+5% vs last month',
      icon: TrendingUp,
      color: 'text-purple-500'
    }
  ]

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">
                  {stat.value}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  )
}
