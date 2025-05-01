export type ChallengeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type ChallengeCategory = 'Performance' | 'Learning' | 'Community'
export type ChallengeStatus = 'Draft' | 'Active' | 'Completed' | 'Cancelled'

export interface Challenge {
  id: string
  title: string
  description: string
  reward: string
  progress: number
  startDate: string
  endDate: string
  participants: number
  difficulty: ChallengeDifficulty
  category: ChallengeCategory
  status: ChallengeStatus
  createdBy: string
  rules: string[]
  minimumBalance?: number
  targetReturn?: number
  maxParticipants?: number
  isJoined?: boolean
}

export interface ChallengeParticipant {
  userId: string
  username: string
  joinedAt: string
  progress: number
  currentReturn: number
  rank: number
  completed: boolean
}
