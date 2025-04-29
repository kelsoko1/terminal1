import { create } from 'zustand'

interface FollowState {
  following: Record<string, string[]> // userId -> array of followed userIds
  followers: Record<string, string[]> // userId -> array of follower userIds
  followUser: (followerId: string, targetId: string) => void
  unfollowUser: (followerId: string, targetId: string) => void
  getFollowing: (userId: string) => string[]
  getFollowers: (userId: string) => string[]
  isFollowing: (followerId: string, targetId: string) => boolean
}

export const useFollowStore = create<FollowState>((set, get) => ({
  following: {},
  followers: {},

  followUser: (followerId: string, targetId: string) => {
    set(state => ({
      following: {
        ...state.following,
        [followerId]: [...(state.following[followerId] || []), targetId],
      },
      followers: {
        ...state.followers,
        [targetId]: [...(state.followers[targetId] || []), followerId],
      },
    }))
  },

  unfollowUser: (followerId: string, targetId: string) => {
    set(state => ({
      following: {
        ...state.following,
        [followerId]: (state.following[followerId] || []).filter(id => id !== targetId),
      },
      followers: {
        ...state.followers,
        [targetId]: (state.followers[targetId] || []).filter(id => id !== followerId),
      },
    }))
  },

  getFollowing: (userId: string) => {
    return get().following[userId] || []
  },

  getFollowers: (userId: string) => {
    return get().followers[userId] || []
  },

  isFollowing: (followerId: string, targetId: string) => {
    return get().following[followerId]?.includes(targetId) || false
  },
}))
