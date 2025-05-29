import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Stock, User, Trade } from './types';
import { databases, STOCKS_COLLECTION_ID, TRADES_COLLECTION_ID, DATABASE_ID } from './appwrite';
import { Query } from 'appwrite';

// Initialize with empty trades array
const initialTrades: Trade[] = [];

// Define audio stream interface
export interface AudioStream {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  recordingUrl?: string;
  isLive: boolean;
  listenerCount: number;
}

// Define video stream interface
export interface VideoStream {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  recordingUrl?: string;
  thumbnailUrl?: string;
  isLive: boolean;
  viewerCount: number;
  hasAudio: boolean;
  resolution?: string;
}

// Define media stream type for combined functionality
export type MediaStreamType = 'audio' | 'video';

interface StoreState {
  stocks: Stock[];
  user: User | null;
  trades: Trade[];
  isConnected: boolean;
  lastSyncTimestamp: number | null;
  isSyncing: boolean;
  audioStreams: AudioStream[];
  videoStreams: VideoStream[];
  currentAudioStream: AudioStream | null;
  currentVideoStream: VideoStream | null;
  updateStocks: (stocks: Stock[]) => void;
  setUser: (user: User | null) => void;
  addTrade: (trade: Trade) => Promise<void>;
  setConnectionStatus: (status: boolean) => void;
  setSyncStatus: (isSyncing: boolean) => void;
  updateLastSyncTimestamp: () => void;
  syncStocks: () => Promise<void>;
  syncTrades: () => Promise<void>;
  fetchTrades: (userId?: string) => Promise<Trade[]>;
  // Audio stream functions
  saveAudioStream: (stream: AudioStream) => void;
  updateAudioStream: (streamId: string, updates: Partial<AudioStream>) => void;
  endAudioStream: (streamId: string) => void;
  setCurrentAudioStream: (stream: AudioStream | null) => void;
  getAudioStreamById: (streamId: string) => AudioStream | undefined;
  // Video stream functions
  saveVideoStream: (stream: VideoStream) => void;
  updateVideoStream: (streamId: string, updates: Partial<VideoStream>) => void;
  endVideoStream: (streamId: string) => void;
  setCurrentVideoStream: (stream: VideoStream | null) => void;
  getVideoStreamById: (streamId: string) => VideoStream | undefined;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      stocks: [],
      user: null,
      trades: initialTrades,
      isConnected: true,
      lastSyncTimestamp: null,
      isSyncing: false,
      audioStreams: [],
      videoStreams: [],
      currentAudioStream: null,
      currentVideoStream: null,

      updateStocks: (stocks) => set({ stocks }),
      
      setUser: (user) => set({ user }),
      
      addTrade: async (trade) => {
        try {
          // Add trade to Appwrite
          await databases.createDocument(
            DATABASE_ID,
            TRADES_COLLECTION_ID,
            'unique()',
            {
              ...trade,
              timestamp: trade.timestamp.toISOString(),
              userId: get().user?.$id
            }
          );

          // Update local state
          set((state) => ({ 
            trades: [...state.trades, trade],
            lastSyncTimestamp: Date.now()
          }));
        } catch (error) {
          console.error('Failed to add trade:', error);
          throw error;
        }
      },

      setConnectionStatus: (status) => set({ isConnected: status }),
      
      setSyncStatus: (isSyncing) => set({ isSyncing }),
      
      updateLastSyncTimestamp: () => set({ lastSyncTimestamp: Date.now() }),

      syncStocks: async () => {
        try {
          set({ isSyncing: true });
          
          // Fetch stocks from the real API endpoint
          const response = await fetch('/api/market/stocks');
          
          if (!response.ok) {
            throw new Error(`Failed to fetch stocks: ${response.status}`);
          }
          
          const data = await response.json();
          
          set({ 
            stocks: data.stocks,
            lastSyncTimestamp: Date.now()
          });
        } catch (error) {
          console.error('Failed to sync stocks:', error);
        } finally {
          set({ isSyncing: false });
        }
      },
      
      // Fetch trades from the API
      fetchTrades: async (userId?: string) => {
        try {
          set({ isSyncing: true });
          
          // Build query parameters
          const params = new URLSearchParams();
          if (userId) {
            params.append('userId', userId);
          }
          
          // Fetch trades from the API endpoint
          const response = await fetch(`/api/trading/trades?${params.toString()}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch trades: ${response.status}`);
          }
          
          const data = await response.json();
          
          set({ 
            trades: data.trades,
            lastSyncTimestamp: Date.now()
          });
          
          return data.trades;
        } catch (error) {
          console.error('Failed to fetch trades:', error);
          return [];
        } finally {
          set({ isSyncing: false });
        }
      },

      syncTrades: async () => {
        const userId = get().user?.id;
        
        try {
          set({ isSyncing: true });
          
          // Use our fetchTrades function to get trades from the API
          await get().fetchTrades(userId);
          
        } catch (error) {
          console.error('Failed to sync trades:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      // Audio stream functions
      saveAudioStream: (stream) => {
        set((state) => ({ 
          audioStreams: [...state.audioStreams, stream],
          currentAudioStream: stream
        }));
      },

      updateAudioStream: (streamId, updates) => {
        set((state) => ({
          audioStreams: state.audioStreams.map(stream => 
            stream.id === streamId ? { ...stream, ...updates } : stream
          ),
          currentAudioStream: state.currentAudioStream?.id === streamId 
            ? { ...state.currentAudioStream, ...updates } 
            : state.currentAudioStream
        }));
      },

      endAudioStream: (streamId) => {
        const endTime = new Date();
        set((state) => ({
          audioStreams: state.audioStreams.map(stream => 
            stream.id === streamId 
              ? { 
                  ...stream, 
                  isLive: false, 
                  endTime,
                  duration: Math.floor((endTime.getTime() - new Date(stream.startTime).getTime()) / 1000)
                } 
              : stream
          ),
          currentAudioStream: null
        }));
      },

      setCurrentAudioStream: (stream) => {
        set({ currentAudioStream: stream });
      },

      getAudioStreamById: (streamId) => {
        return get().audioStreams.find(stream => stream.id === streamId);
      },

      // Video stream functions
      saveVideoStream: (stream) => {
        set((state) => ({ 
          videoStreams: [...state.videoStreams, stream],
          currentVideoStream: stream
        }));
      },

      updateVideoStream: (streamId, updates) => {
        set((state) => ({
          videoStreams: state.videoStreams.map(stream => 
            stream.id === streamId ? { ...stream, ...updates } : stream
          ),
          currentVideoStream: state.currentVideoStream?.id === streamId 
            ? { ...state.currentVideoStream, ...updates } 
            : state.currentVideoStream
        }));
      },

      endVideoStream: (streamId) => {
        const endTime = new Date();
        set((state) => ({
          videoStreams: state.videoStreams.map(stream => 
            stream.id === streamId 
              ? { 
                  ...stream, 
                  isLive: false, 
                  endTime,
                  duration: Math.floor((endTime.getTime() - new Date(stream.startTime).getTime()) / 1000)
                } 
              : stream
          ),
          currentVideoStream: null
        }));
      },

      setCurrentVideoStream: (stream) => {
        set({ currentVideoStream: stream });
      },

      getVideoStreamById: (streamId) => {
        return get().videoStreams.find(stream => stream.id === streamId);
      }
    }),
    {
      name: 'Terminal',
      partialize: (state) => ({
        user: state.user,
        lastSyncTimestamp: state.lastSyncTimestamp,
        audioStreams: state.audioStreams,
        videoStreams: state.videoStreams
      }),
    }
  )
);
