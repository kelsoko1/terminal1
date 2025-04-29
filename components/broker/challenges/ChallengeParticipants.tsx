'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Challenge, ChallengeParticipant } from '@/types/challenges'

interface ChallengeParticipantsProps {
  challenge: Challenge | null
  open: boolean
  onClose: () => void
}

export function ChallengeParticipants({ challenge, open, onClose }: ChallengeParticipantsProps) {
  // Mock data - replace with API call
  const participants: ChallengeParticipant[] = [
    {
      userId: '1',
      username: 'trader1',
      joinedAt: '2024-04-01',
      progress: 75,
      currentReturn: 12.5,
      rank: 1,
      completed: false
    },
    {
      userId: '2',
      username: 'trader2',
      joinedAt: '2024-04-01',
      progress: 60,
      currentReturn: 8.2,
      rank: 2,
      completed: false
    }
  ]

  if (!challenge) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{challenge.title} - Participants</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Current Return</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.userId}>
                    <TableCell>#{participant.rank}</TableCell>
                    <TableCell>{participant.username}</TableCell>
                    <TableCell>
                      {new Date(participant.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{participant.progress}%</TableCell>
                    <TableCell>
                      <span className={participant.currentReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {participant.currentReturn}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={participant.completed ? 'default' : 'secondary'}>
                        {participant.completed ? 'Completed' : 'In Progress'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
