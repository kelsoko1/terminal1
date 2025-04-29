import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Stock, User, Trade } from './types';
import { initialStocks } from './mockData';
import { databases, STOCKS_COLLECTION_ID, TRADES_COLLECTION_ID, DATABASE_ID } from './appwrite';
import { Query } from 'appwrite';

// Initial mock trades for DSE stocks
const initialTrades: Trade[] = [
  {
    symbol: 'CRDB',
    quantity: 1000,
    price: 400,
    type: 'buy',
    timestamp: new Date('2024-03-15T10:30:00'),
  },
  {
    symbol: 'NMB',
    quantity: 500,
    price: 3900,
    type: 'buy',
    timestamp: new Date('2024-03-15T11:15:00'),
  },
  {
    symbol: 'TBL',
    quantity: 200,
    price: 10900,
    type: 'sell',
    timestamp: new Date('2024-03-15T13:45:00'),
  },
  {
    symbol: 'TPCC',
    quantity: 300,
    price: 4200,
    type: 'buy',
    timestamp: new Date('2024-03-15T14:20:00'),
  },
];

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
      stocks: initialStocks,
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
          const response = await databases.listDocuments(
            DATABASE_ID,
            STOCKS_COLLECTION_ID
          );
          set({ 
            stocks: response.documents as Stock[],
            lastSyncTimestamp: Date.now()
          });
        } catch (error) {
          console.error('Failed to sync stocks:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      syncTrades: async () => {
        const userId = get().user?.$id;
        if (!userId) return;

        try {
          set({ isSyncing: true });
          const response = await databases.listDocuments(
            DATABASE_ID,
            TRADES_COLLECTION_ID,
            [Query.equal('userId', userId)]
          );
          
          const trades = response.documents.map(doc => ({
            ...doc,
            timestamp: new Date(doc.timestamp)
          })) as Trade[];

          set({ 
            trades,
            lastSyncTimestamp: Date.now()
          });
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
