export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'extreme'
export type ChallengeCategory = 'Performance' | 'Learning' | 'Community' | 'Content Creation' | 'Live Streaming' | 'Education'
export type ChallengeStatus = 'active' | 'completed' | 'expired' | 'draft'

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
