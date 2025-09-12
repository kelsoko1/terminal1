// Unified Challenge Service
// This service provides methods to manage all types of challenges across the application
// It handles both trading challenges and social media challenges in a unified way

import { Challenge as TradingChallenge, ChallengeParticipant } from '@/types/challenges'

// Define common challenge types
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'extreme'
export type ChallengeStatus = 'active' | 'completed' | 'expired' | 'draft'
export type ChallengeType = 'trading' | 'social'

// Define interfaces for challenge submissions
export interface ChallengeSubmission {
  id: string
  userId: string
  userName: string
  userAvatar: string
  submittedAt: string
  proofContent: string
  proofMedia?: string
  status: 'pending' | 'approved' | 'rejected'
}

// Unified challenge interface that works for both trading and social challenges
export interface UnifiedChallenge {
  id: string
  title: string
  description: string
  reward: number | string
  difficulty: ChallengeDifficulty
  category: string
  createdAt: string
  expiresAt: string
  participants: number
  status: ChallengeStatus
  type: ChallengeType
  createdBy: string
  rules: string[]
  // Trading-specific fields
  minimumBalance?: number
  targetReturn?: number
  maxParticipants?: number
  progress?: number
  // Social-specific fields
  proofRequired?: boolean
  submissions?: ChallengeSubmission[]
}

// In-memory storage for challenges (would be replaced with API calls in production)
let challenges: UnifiedChallenge[] = [
  {
    id: '1',
    title: 'Create a viral stock tip video',
    description: 'Create a 30-second video explaining your top stock pick and why it\'s a good investment. Must get at least 50 likes.',
    reward: 100,
    difficulty: 'medium',
    category: 'Content Creation',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    proofRequired: true,
    participants: 12,
    status: 'active',
    type: 'social',
    createdBy: 'Social Media Team',
    rules: ['Create a 30-second video', 'Must get at least 50 likes', 'Video must explain investment thesis'],
    submissions: [
      {
        id: 's1',
        userId: 'user1',
        userName: 'Sarah Johnson',
        userAvatar: '/placeholder-avatar.jpg',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        proofContent: 'Created a video about TSLA stock that got 78 likes and 15 comments',
        proofMedia: '/placeholder-media.jpg',
        status: 'pending'
      }
    ]
  },
  {
    id: '2',
    title: 'Host a live trading session',
    description: 'Host a 30-minute live trading session explaining your trades and strategy as you go.',
    reward: 250,
    difficulty: 'hard',
    category: 'Live Streaming',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    proofRequired: true,
    participants: 5,
    status: 'active',
    type: 'social',
    createdBy: 'Social Media Team',
    rules: ['Host a 30-minute live session', 'Explain trades in real-time', 'Answer viewer questions'],
    submissions: []
  },
  {
    id: '3',
    title: 'Daily market recap challenge',
    description: 'Post a daily market recap for 5 consecutive days highlighting key market moves and your analysis.',
    reward: 150,
    difficulty: 'medium',
    category: 'Education',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    proofRequired: true,
    participants: 8,
    status: 'expired',
    type: 'social',
    createdBy: 'Social Media Team',
    rules: ['Post daily for 5 consecutive days', 'Include key market moves', 'Add your own analysis'],
    submissions: [
      {
        id: 's2',
        userId: 'user2',
        userName: 'Michael Chen',
        userAvatar: '/placeholder-avatar.jpg',
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        proofContent: 'Completed all 5 daily recaps with screenshots of each post',
        proofMedia: '/placeholder-media.jpg',
        status: 'approved'
      }
    ]
  },
  {
    id: '4',
    title: 'DSE Trading Competition',
    description: 'Achieve highest returns in 30 days trading on the Dar es Salaam Stock Exchange',
    reward: '1,000,000 TZS',
    difficulty: 'medium',
    category: 'Performance',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    participants: 156,
    status: 'active',
    type: 'trading',
    createdBy: 'Broker A',
    rules: [
      'Minimum 10 trades',
      'Only DSE listed stocks',
      'No day trading'
    ],
    minimumBalance: 100000,
    targetReturn: 15,
    maxParticipants: 200,
    progress: 45
  },
  {
    id: '5',
    title: 'Beginner Investor Challenge',
    description: 'Learn the basics of investing while competing with other beginners',
    reward: '500,000 TZS',
    difficulty: 'easy',
    category: 'Learning',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    participants: 78,
    status: 'active',
    type: 'trading',
    createdBy: 'Broker B',
    rules: [
      'Complete all educational modules',
      'Make at least 5 trades',
      'Maintain positive returns'
    ],
    minimumBalance: 50000,
    targetReturn: 5,
    maxParticipants: 100,
    progress: 30
  }
];

// Unified Challenge Service Methods
export const getChallenges = async (type?: ChallengeType): Promise<UnifiedChallenge[]> => {
  if (type) {
    return challenges.filter(challenge => challenge.type === type);
  }
  return challenges;
};

export const getChallengeById = async (id: string): Promise<UnifiedChallenge | undefined> => {
  return challenges.find(challenge => challenge.id === id);
};

export const createChallenge = async (challenge: Partial<UnifiedChallenge>): Promise<UnifiedChallenge> => {
  const newChallenge: UnifiedChallenge = {
    id: `ch-${Date.now()}`,
    title: challenge.title || '',
    description: challenge.description || '',
    reward: challenge.reward || 0,
    difficulty: challenge.difficulty || 'medium',
    category: challenge.category || 'Performance',
    createdAt: new Date().toISOString(),
    expiresAt: challenge.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    participants: 0,
    status: challenge.status || 'active',
    type: challenge.type || 'trading',
    createdBy: challenge.createdBy || 'System',
    rules: challenge.rules || [challenge.description || ''],
    minimumBalance: challenge.minimumBalance,
    targetReturn: challenge.targetReturn,
    maxParticipants: challenge.maxParticipants,
    progress: challenge.progress || 0,
    proofRequired: challenge.proofRequired,
    submissions: challenge.type === 'social' ? [] : undefined
  };
  
  challenges = [newChallenge, ...challenges];
  return newChallenge;
};

export const updateChallenge = async (id: string, updates: Partial<UnifiedChallenge>): Promise<UnifiedChallenge | undefined> => {
  const index = challenges.findIndex(challenge => challenge.id === id);
  if (index === -1) return undefined;
  
  const updatedChallenge = {
    ...challenges[index],
    ...updates
  };
  
  challenges[index] = updatedChallenge;
  return updatedChallenge;
};

export const deleteChallenge = async (id: string): Promise<boolean> => {
  const initialLength = challenges.length;
  challenges = challenges.filter(challenge => challenge.id !== id);
  return challenges.length < initialLength;
};

export const submitChallengeProof = async (
  challengeId: string, 
  submission: Omit<ChallengeSubmission, 'id' | 'submittedAt' | 'status'>
): Promise<ChallengeSubmission | undefined> => {
  const challenge = await getChallengeById(challengeId);
  if (!challenge || challenge.type !== 'social' || !challenge.submissions) return undefined;
  
  const newSubmission: ChallengeSubmission = {
    id: `sub-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: 'pending',
    ...submission
  };
  
  challenge.submissions.push(newSubmission);
  challenge.participants += 1;
  
  return newSubmission;
};

export const updateSubmissionStatus = async (
  challengeId: string,
  submissionId: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<ChallengeSubmission | undefined> => {
  const challenge = await getChallengeById(challengeId);
  if (!challenge || challenge.type !== 'social' || !challenge.submissions) return undefined;
  
  const submission = challenge.submissions.find(sub => sub.id === submissionId);
  if (!submission) return undefined;
  
  submission.status = status;
  return submission;
};

// Conversion utilities for backward compatibility
export const convertLegacyTradingChallenge = (tradingChallenge: TradingChallenge): UnifiedChallenge => {
  // Map difficulty
  let difficulty: ChallengeDifficulty;
  switch (tradingChallenge.difficulty) {
    case 'Beginner': difficulty = 'easy'; break;
    case 'Intermediate': difficulty = 'medium'; break;
    case 'Advanced': difficulty = 'hard'; break;
    default: difficulty = 'medium';
  }
  
  // Map status
  let status: ChallengeStatus;
  switch (tradingChallenge.status) {
    case 'Active': status = 'active'; break;
    case 'Completed': status = 'completed'; break;
    case 'Cancelled': status = 'expired'; break;
    case 'Draft': status = 'draft'; break;
    default: status = 'active';
  }
  
  return {
    id: tradingChallenge.id,
    title: tradingChallenge.title,
    description: tradingChallenge.description,
    reward: tradingChallenge.reward,
    difficulty,
    category: tradingChallenge.category,
    createdAt: tradingChallenge.startDate,
    expiresAt: tradingChallenge.endDate,
    participants: tradingChallenge.participants,
    status,
    type: 'trading',
    createdBy: tradingChallenge.createdBy,
    rules: tradingChallenge.rules,
    minimumBalance: tradingChallenge.minimumBalance,
    targetReturn: tradingChallenge.targetReturn,
    maxParticipants: tradingChallenge.maxParticipants,
    progress: tradingChallenge.progress
  };
};

// Function to get legacy format for backward compatibility
export const getLegacyTradingChallenge = (unifiedChallenge: UnifiedChallenge): TradingChallenge => {
  // Map difficulty
  let difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  switch (unifiedChallenge.difficulty) {
    case 'easy': difficulty = 'Beginner'; break;
    case 'medium': difficulty = 'Intermediate'; break;
    case 'hard': case 'extreme': difficulty = 'Advanced'; break;
    default: difficulty = 'Intermediate';
  }
  
  // Map status
  let status: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
  switch (unifiedChallenge.status) {
    case 'active': status = 'Active'; break;
    case 'completed': status = 'Completed'; break;
    case 'expired': status = 'Completed'; break;
    case 'draft': status = 'Draft'; break;
    default: status = 'Active';
  }
  
  return {
    id: unifiedChallenge.id,
    title: unifiedChallenge.title,
    description: unifiedChallenge.description,
    reward: typeof unifiedChallenge.reward === 'number' ? 
      `${unifiedChallenge.reward.toLocaleString()} TZS` : unifiedChallenge.reward,
    progress: unifiedChallenge.progress || 0,
    startDate: unifiedChallenge.createdAt,
    endDate: unifiedChallenge.expiresAt,
    participants: unifiedChallenge.participants,
    difficulty,
    category: unifiedChallenge.category as any,
    status,
    createdBy: unifiedChallenge.createdBy,
    rules: unifiedChallenge.rules,
    minimumBalance: unifiedChallenge.minimumBalance || 0,
    targetReturn: unifiedChallenge.targetReturn || 0,
    maxParticipants: unifiedChallenge.maxParticipants || 100
  };
};

// Helper functions for specific challenge types
export const getSocialChallenges = async (): Promise<UnifiedChallenge[]> => {
  return challenges.filter(challenge => challenge.type === 'social');
};

export const getTradingChallenges = async (): Promise<UnifiedChallenge[]> => {
  return challenges.filter(challenge => challenge.type === 'trading');
};

export const createSocialChallenge = async (challenge: Partial<UnifiedChallenge>): Promise<UnifiedChallenge> => {
  return createChallenge({
    ...challenge,
    type: 'social',
    submissions: [],
    proofRequired: true
  });
};

export const createTradingChallenge = async (challenge: Partial<UnifiedChallenge>): Promise<UnifiedChallenge> => {
  return createChallenge({
    ...challenge,
    type: 'trading'
  });
};

// Export a unified challenge service
export const ChallengeService = {
  // Core unified methods
  getChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  
  // Social challenge specific methods
  getSocialChallenges,
  createSocialChallenge,
  submitChallengeProof,
  updateSubmissionStatus,
  
  // Trading challenge specific methods
  getTradingChallenges,
  createTradingChallenge,
  
  // Conversion utilities for backward compatibility
  convertLegacyTradingChallenge,
  getLegacyTradingChallenge
};
