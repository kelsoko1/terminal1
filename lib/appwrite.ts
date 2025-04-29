import { Client, Account, Databases, Storage } from 'appwrite';

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite Endpoint
  .setProject('Terminal'); // Your project ID

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database configuration
export const DATABASE_ID = 'social_feed';
export const COLLECTION_ID = 'statuses';
export const BUCKET_ID = 'status_videos';

// Types
export interface VideoStatus {
  id: string;
  user: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
  };
  videoUrl: string;
  thumbnail: string;
  duration: string;
  timestamp: string;
  views: number;
  isViewed: boolean;
  seenBy: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  isLive: boolean;
  liveViewers: number;
  liveComments: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
    content: string;
    timestamp: string;
  }>;
}