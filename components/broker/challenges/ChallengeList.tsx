'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Users, Trophy, Calendar, ArrowUpRight } from 'lucide-react'
import { Challenge, ChallengeStatus } from '@/types/challenges'
import { ChallengeParticipants } from '@/components/broker/challenges/ChallengeParticipants'

interface ChallengeListProps {
  status: ChallengeStatus
}

export function ChallengeList({ status }: ChallengeListProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [showParticipants, setShowParticipants] = useState(false)

  // Mock data - replace with real API call
  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'DSE Trading Competition',
      description: 'Achieve highest returns in 30 days',
      reward: '1,000,000 TZS + Premium Account',
      progress: 45,
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      participants: 156,
      difficulty: 'Intermediate',
      category: 'Performance',
      status: 'Active',
      createdBy: 'Broker A',
      rules: [
        'Minimum 10 trades',
        'Only DSE listed stocks',
        'No margin trading'
      ],
      minimumBalance: 1000000,
      targetReturn: 15,
      maxParticipants: 200
    }
  ]

  const handleViewParticipants = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setShowParticipants(true)
  }

  const getStatusColor = (status: ChallengeStatus) => {
    switch (status) {
      case 'Active':
        return 'status-bg-active status-active hover:status-bg-active'
      case 'Draft':
        return 'status-bg-pending status-pending hover:status-bg-pending'
      case 'Completed':
        return 'investor-bg-info investor-info hover:investor-bg-info'
      default:
        return 'status-bg-expired status-expired hover:status-bg-expired'
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">Challenge Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {challenges.filter(c => c.status === status).map((challenge) => (
              <TableRow key={challenge.id} className="group">
                <TableCell>
                  <div>
                    <div className="font-medium group-hover:text-primary transition-colors">
                      {challenge.title}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {challenge.description}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {challenge.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {challenge.reward}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {challenge.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="w-[120px]">
                    <Progress value={challenge.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {challenge.progress}% Complete
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{challenge.participants}</span>
                    {challenge.maxParticipants && (
                      <span className="text-muted-foreground text-sm">
                        / {challenge.maxParticipants}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="text-sm">
                      Starts: {new Date(challenge.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Ends: {new Date(challenge.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(challenge.status)}>
                    {challenge.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => handleViewParticipants(challenge)}>
                        <Users className="h-4 w-4 mr-2" />
                        Participants
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trophy className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {challenge.status === 'Draft' && (
                        <DropdownMenuItem>
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ChallengeParticipants 
        open={showParticipants}
        onClose={() => setShowParticipants(false)}
        challenge={selectedChallenge}
      />
    </>
  )
}
