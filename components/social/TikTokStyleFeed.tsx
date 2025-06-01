'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import './TikTokStyleFeed.css'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
// Tabs removed
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { v4 as uuidv4 } from 'uuid'
// Streaming functionality
import { useMediaStream } from '@/hooks/useMediaStream'
import { 
  ShoppingBag, 
  Package, 
  Pencil, 
  Trash2, 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Video, 
  Mic, 
  Image as ImageIcon, 
  Link, 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  Bookmark, 
  BookmarkCheck, 
  ThumbsUp, 
  ThumbsDown, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  PenSquare, 
  VideoOff, 
  MicOff, 
  Loader2, 
  StopCircle, 
  Clock, 
  DollarSign, 
  Search, 
  RefreshCw, 
  Star,
  Trophy,
  Plus,
  ChevronUp,
  MoreVertical,
  Share
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
} from '@/components/ui/dropdown-menu'

// Import the ecommerce context
import { useEcommerce, Product } from '@/contexts/EcommerceContext'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger, 
} from '@/components/ui/dialog'
// Streaming functionality removed

// Types
interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: string
  likes: number
}

// Challenge interface for Nerve-like functionality
interface Challenge {
  id: string
  creatorId: string
  creatorName: string
  creatorAvatar: string
  title: string
  description: string
  prizeAmount: number
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme'
  timestamp: string
  expiresAt: string
  participants: number
  status: 'active' | 'completed' | 'expired'
  completedBy?: string[]
  proofRequired: boolean
  category: string
}

interface LeaderboardUser {
  id: string
  name: string
  avatar: string
  challengesCompleted: number
  totalEarnings: number
  rank: number
  isWatcher: boolean
}

interface StatusUpdate {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  hasLiked?: boolean
  hasDisliked?: boolean
  voteStatus?: 'upvoted' | 'downvoted' | 'none'
  mediaType?: 'image' | 'video' | 'audio' | 'none'
  mediaUrl?: string
  commentsList?: Comment[]
}

// LiveStream interface
interface LiveStream {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  viewers: number;
  isLive: boolean;
  startTime: string;
  mediaType: 'video' | 'audio';
  mediaUrl?: string; // URL to the recorded stream for ended streams
  duration?: number; // Duration in seconds for ended streams
}

// Format duration as HH:MM:SS
const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hrs > 0 ? hrs.toString() + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Format timestamp to relative time (e.g., "2 hours ago")
const formatRelativeTime = (timestamp: string) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

// API functions for production
async function fetchStatusUpdates(page: number = 1, limit: number = 10): Promise<StatusUpdate[]> {
  try {
    const response = await fetch(`/api/social/posts?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch status updates');
    }
    const data = await response.json();
    // Map the posts data to StatusUpdate format
    return data.posts.map((post: any) => ({
      id: post.id,
      userId: post.userId,
      userName: post.user?.name || 'Unknown User',
      userAvatar: post.user?.avatar || '',
      content: post.content,
      timestamp: post.createdAt,
      likes: post.likes || 0,
      comments: post.comments?.length || 0,
      shares: post.shares || 0,
      hasLiked: false,
      hasDisliked: false,
      voteStatus: 'none',
      mediaType: post.attachments?.length > 0 ? post.attachments[0].type : 'none',
      mediaUrl: post.attachments?.length > 0 ? post.attachments[0].url : undefined,
      commentsList: post.comments?.map((comment: any) => ({
        id: comment.id,
        userId: comment.userId,
        userName: comment.user?.name || 'Unknown User',
        userAvatar: comment.user?.avatar || '',
        content: comment.content,
        timestamp: comment.createdAt,
        likes: comment.likes || 0
      })) || []
    }));
  } catch (error) {
    console.error('Error fetching status updates:', error);
    return [];
  }
};

const likeStatus = async (statusId: string, liked: boolean): Promise<boolean> => {
  try {
    // Since we don't have a specific like endpoint yet, we'll log this action
    // TODO: Implement proper like endpoint at /api/social/posts/{id}/like
    console.log(`Like action: post ${statusId}, liked: ${liked}`);
    // For now, return true to simulate success
    return true;
  } catch (error) {
    console.error('Error liking status:', error);
    return false;
  }
};

const commentOnStatus = async (statusId: string, comment: string): Promise<boolean> => {
  try {
    // Since we don't have a specific comment endpoint yet, we'll log this action
    // TODO: Implement proper comment endpoint at /api/social/posts/{id}/comment
    console.log(`Comment action: post ${statusId}, comment: ${comment}`);
    // For now, return true to simulate success
    return true;
  } catch (error) {
    console.error('Error commenting on status:', error);
    return false;
  }
};

const shareStatus = async (statusId: string): Promise<boolean> => {
  try {
    // Since we don't have a specific share endpoint yet, we'll log this action
    // TODO: Implement proper share endpoint at /api/social/posts/{id}/share
    console.log(`Share action: post ${statusId}`);
    // For now, return true to simulate success
    return true;
  } catch (error) {
    console.error('Error sharing status:', error);
    return false;
  }
};

// Post creation functionality
async function createPost(content: string, attachments: any[] = []): Promise<StatusUpdate | null> {
  try {
    const response = await fetch('/api/social/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
      },
      body: JSON.stringify({ content, attachments })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
    
    const data = await response.json();
    return {
      id: data.post.id,
      userId: data.post.userId,
      userName: data.post.user.name,
      userAvatar: '/placeholder-avatar.jpg', // Placeholder avatar
      content: data.post.content,
      timestamp: data.post.createdAt,
      likes: 0,
      comments: 0,
      shares: 0,
      hasLiked: false,
      mediaType: attachments.length > 0 ? 'image' : 'none',
      mediaUrl: attachments.length > 0 ? attachments[0].url : undefined
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

// Vote API functions
async function voteOnPost(postId: string, voteType: 'upvote' | 'downvote' | 'none'): Promise<boolean> {
  try {
    // In a real app, this would call an API endpoint
    // For now, we'll just simulate a successful API call
    console.log(`Voting ${voteType} on post ${postId}`);
    return true;
  } catch (error) {
    console.error('Error voting on post:', error);
    return false;
  }
}

// Stream API functions
async function fetchStreams(page: number = 1, limit: number = 10, isLive?: boolean): Promise<LiveStream[]> {
  try {
    let url = `/api/social/streams?page=${page}&limit=${limit}`;
    if (isLive !== undefined) {
      url += `&isLive=${isLive}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch streams');
    }
    
    const data = await response.json();
    // Map the streams data to LiveStream format
    return data.streams.map((stream: any) => ({
      id: stream.id,
      userId: stream.userId,
      userName: stream.user?.name || 'Unknown User',
      userAvatar: stream.user?.image || '/placeholder-avatar.jpg',
      title: stream.title,
      viewers: stream.viewers || 0,
      isLive: stream.isLive,
      startTime: stream.startTime,
      mediaType: stream.mediaType.toLowerCase() as 'video' | 'audio',
      mediaUrl: stream.mediaUrl,
      duration: stream.duration
    }));
  } catch (error) {
    console.error('Error fetching streams:', error);
    return [];
  }
}

async function createStream(title: string, mediaType: 'VIDEO' | 'AUDIO', mediaUrl?: string): Promise<LiveStream | null> {
  try {
    const response = await fetch('/api/social/streams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
      },
      body: JSON.stringify({ title, mediaType, mediaUrl })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create stream');
    }
    
    const data = await response.json();
    return {
      id: data.stream.id,
      userId: data.stream.userId,
      userName: data.stream.user.name,
      userAvatar: data.stream.user.image || '/placeholder-avatar.jpg',
      title: data.stream.title,
      viewers: data.stream.viewers || 0,
      isLive: data.stream.isLive,
      startTime: data.stream.startTime,
      mediaType: data.stream.mediaType.toLowerCase() as 'video' | 'audio',
      mediaUrl: data.stream.mediaUrl
    };
  } catch (error) {
    console.error('Error creating stream:', error);
    return null;
  }
}

async function updateStream(id: string, data: { isLive?: boolean, viewers?: number, mediaUrl?: string, duration?: number, title?: string }): Promise<LiveStream | null> {
  try {
    const response = await fetch('/api/social/streams', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
      },
      body: JSON.stringify({ id, ...data })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update stream');
    }
    
    const responseData = await response.json();
    return {
      id: responseData.stream.id,
      userId: responseData.stream.userId,
      userName: responseData.stream.user.name,
      userAvatar: responseData.stream.user.image || '/placeholder-avatar.jpg',
      title: responseData.stream.title,
      viewers: responseData.stream.viewers || 0,
      isLive: responseData.stream.isLive,
      startTime: responseData.stream.startTime,
      mediaType: responseData.stream.mediaType.toLowerCase() as 'video' | 'audio',
      mediaUrl: responseData.stream.mediaUrl,
      duration: responseData.stream.duration
    };
  } catch (error) {
    console.error('Error updating stream:', error);
    return null;
  }
}

// Fetch comments for a post
async function fetchComments(postId: string): Promise<Comment[]> {
  try {
    // Call the API endpoint to fetch comments for the post
    const response = await fetch(`/api/social/posts/${postId}/comments`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map the API response to our Comment interface
    return data.comments.map((comment: any) => ({
      id: comment.id,
      userId: comment.userId,
      userName: comment.user?.name || 'Unknown User',
      userAvatar: comment.user?.avatar || '/placeholder-avatar.jpg',
      content: comment.content,
      timestamp: comment.createdAt,
      likes: comment.likes || 0
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

import { ProductFeedSection } from '@/components/ecommerce/ProductFeedSection'
import { ShopFeedSection } from '@/components/ecommerce/ShopFeedSection'

// Format time remaining until expiration
const formatTimeRemaining = (expiresAt: string) => {
  const now = new Date();
  const expiration = new Date(expiresAt);
  const diffInSeconds = Math.floor((expiration.getTime() - now.getTime()) / 1000);
  
  if (diffInSeconds < 0) return 'Expired';
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
};

export function TikTokStyleFeed() {
  // Use the ecommerce context
  const { products, shops, featuredProducts, addProduct } = useEcommerce();
  // Removed tabs functionality
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [isBookmarked, setIsBookmarked] = useState<Record<string, boolean>>({})
  const [postContent, setPostContent] = useState('')
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [showPostDialog, setShowPostDialog] = useState(false)
  
  // Soko product creation states
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    stock: 0,
    category: 'Digital Products',
    status: 'active',
    description: ''
  })
  const [voteStatus, setVoteStatus] = useState<Record<string, 'upvoted' | 'downvoted' | 'none'>>({}) 
  const [activePostId, setActivePostId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  
  // Media streaming states
  const [streamType, setStreamType] = useState<'video' | 'audio' | null>(null)
  const [streamTitle, setStreamTitle] = useState('')
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null)
  const [showStreamPreview, setShowStreamPreview] = useState(false)
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null)
  const [showStreamDialog, setShowStreamDialog] = useState(false)
  
  // Use the media stream hook
  const {
    stream,
    error: streamError,
    isLoading: isStreamLoading,
    startStream,
    stopStream,
    videoRef,
    audioRef,
    isStreamActive
  } = useMediaStream()
  
  const { toast } = useToast()
  
  // Toast notification hook
  
  // Handle starting a stream
  const handleStartStream = async (type: 'video' | 'audio') => {
    try {
      setStreamType(type);
      setShowStreamPreview(true);
      
      if (type === 'video') {
        await startStream({ video: true, audio: true });
      } else {
        await startStream({ video: false, audio: true });
      }
      
      // Create a new stream in the database via API
      const mediaType = type === 'video' ? 'VIDEO' : 'AUDIO';
      const title = streamTitle || `${type === 'video' ? 'Video' : 'Audio'} Stream`;
      
      const newStream = await createStream(title, mediaType);
      
      if (newStream) {
        setActiveStream(newStream);
        setLiveStreams(prev => [newStream, ...prev]);
        
        toast({
          title: 'Stream Started',
          description: `Your ${type} stream has started successfully`,
        });
      } else {
        // If API call fails, create a local stream object as fallback
        const fallbackStream: LiveStream = {
          id: uuidv4(),
          userId: 'current-user-id',
          userName: 'Current User',
          userAvatar: '/placeholder-avatar.jpg',
          title: title,
          viewers: 0,
          isLive: true,
          startTime: new Date().toISOString(),
          mediaType: type
        };
        
        setActiveStream(fallbackStream);
        setLiveStreams(prev => [fallbackStream, ...prev]);
        
        toast({
          title: 'Stream Started (Offline Mode)',
          description: `Your ${type} stream has started in offline mode`,
        });
      }
    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: 'Error',
        description: streamError || `Failed to start ${type} stream. Please check your permissions.`,
        variant: 'destructive',
      });
    }
  };
  
  // Handle stopping a stream
  const handleStopStream = async () => {
    stopStream();
    setStreamType(null);
    setShowStreamPreview(false);
    
    // Update the active stream status
    if (activeStream) {
      // In a real app, you would save the stream recording to a file/blob
      // and upload it to a storage service, then use the URL
      const mediaUrl = activeStream.mediaType === 'video' 
        ? '/placeholder-video.mp4' 
        : '/placeholder-audio.mp3';
      
      // Calculate duration - in a real app this would be the actual duration
      const startTime = new Date(activeStream.startTime).getTime();
      const endTime = new Date().getTime();
      const durationInSeconds = Math.floor((endTime - startTime) / 1000);
      
      try {
        // Update the stream in the database via API
        const updatedStream = await updateStream(activeStream.id, {
          isLive: false,
          mediaUrl,
          duration: durationInSeconds
        });
        
        if (updatedStream) {
          // Update the stream in the list with the response from the API
          setLiveStreams(prev => 
            prev.map(stream => 
              stream.id === updatedStream.id ? updatedStream : stream
            )
          );
        } else {
          // Fallback to local update if API call fails
          const localUpdatedStream = { 
            ...activeStream, 
            isLive: false,
            mediaUrl,
            duration: durationInSeconds
          };
          
          // Update the stream in the list
          setLiveStreams(prev => 
            prev.map(stream => 
              stream.id === localUpdatedStream.id ? localUpdatedStream : stream
            )
          );
        }
      } catch (error) {
        console.error('Error updating stream:', error);
        
        // Fallback to local update if API call fails
        const localUpdatedStream = { 
          ...activeStream, 
          isLive: false,
          mediaUrl,
          duration: durationInSeconds
        };
        
        // Update the stream in the list
        setLiveStreams(prev => 
          prev.map(stream => 
            stream.id === localUpdatedStream.id ? localUpdatedStream : stream
          )
        );
      }
      
      setActiveStream(null);
    }
    
    toast({
      title: 'Stream Ended',
      description: 'Your stream has ended',
    });
  };
  
  // Handle post creation with optional media stream
  const handleCreatePost = async () => {
    if (!postContent.trim() && !isStreamActive) {
      toast({
        title: 'Error',
        description: 'Post content or active stream is required',
        variant: 'destructive',
      });
      return;
    }
    
    setIsCreatingPost(true);
    
    try {
      // Determine media type for the post
      let mediaType: 'image' | 'video' | 'audio' | 'none' = 'none';
      let mediaUrl = '';
      
      if (isStreamActive && stream) {
        // In a real app, you would save the stream recording to a file/blob
        // and upload it to a storage service, then use the URL
        mediaType = streamType === 'video' ? 'video' : 'audio';
        mediaUrl = '/placeholder-media.mp4'; // Placeholder for demo
        
        // Stop the stream after posting
        handleStopStream();
      }
      
      // For demo purposes, create a local post if API call fails
      const newPost = await createPost(postContent) || {
        id: uuidv4(),
        userId: 'current-user-id',
        userName: 'Current User',
        userAvatar: '/placeholder-avatar.jpg',
        content: postContent,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        hasLiked: false,
        mediaType,
        mediaUrl
      };
      
      setStatusUpdates(prev => [newPost, ...prev]);
      setPostContent('');
      setShowPostDialog(false);
      
      toast({
        title: 'Success',
        description: 'Your post has been created successfully',
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingPost(false);
    }
  };
  
  // Ref for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useRef<HTMLDivElement | null>(null)
  
  // Fetch streams from the API on component mount
  useEffect(() => {
    const loadStreams = async () => {
      try {
        // Fetch both live and recorded streams
        const streams = await fetchStreams(1, 10);
        if (streams.length > 0) {
          setLiveStreams(streams);
        }
      } catch (error) {
        console.error('Error loading streams:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load streams. Please try again later.',
        });
      }
    };
    
    loadStreams();
  }, []);
  
  // Auto-update timer
  useEffect(() => {
    const updateInterval = setInterval(async () => {
      try {
        const latestUpdates = await fetchStatusUpdates(1, 3);
        
        const newUpdates = latestUpdates.filter(
          update => !statusUpdates.some(existing => existing.id === update.id)
        );
        
        if (newUpdates.length > 0) {
          setStatusUpdates(prev => [...newUpdates, ...prev]);
          
          toast({
            title: "New content",
            description: `${newUpdates.length} new update${newUpdates.length > 1 ? 's' : ''} available in your feed.`,
            duration: 3000
          });
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(updateInterval);
  }, [statusUpdates]);
  
  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (isLoading) return
    
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreContent()
      }
    })
    
    if (lastElementRef.current) {
      observerRef.current.observe(lastElementRef.current)
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [isLoading, hasMore])
  
  // Load more content function for infinite scroll
  const loadMoreContent = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const newUpdates = await fetchStatusUpdates(page);
      
      if (newUpdates.length > 0) {
        setStatusUpdates(prev => [...prev, ...newUpdates]);
        setPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load more content. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle like status update
  const handleLike = async (statusId: string) => {
    const status = statusUpdates.find(s => s.id === statusId);
    if (!status) return;
    
    const newLikedState = !status.hasLiked;
    
    setStatusUpdates(prev => prev.map(s => {
      if (s.id === statusId) {
        return {
          ...s,
          hasLiked: newLikedState,
          likes: newLikedState ? s.likes + 1 : s.likes - 1
        };
      }
      return s;
    }));
    
    try {
      await likeStatus(statusId, newLikedState);
    } catch (error) {
      console.error('Error liking status:', error);
      
      setStatusUpdates(prev => prev.map(s => {
        if (s.id === statusId) {
          return {
            ...s,
            hasLiked: !newLikedState,
            likes: !newLikedState ? s.likes + 1 : s.likes - 1
          };
        }
        return s;
      }));
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update like status. Please try again.',
      });
    }
  };
  
  // Handle bookmark status
  const handleBookmark = (statusId: string) => {
    setIsBookmarked(prev => {
      const newState = { ...prev };
      newState[statusId] = !prev[statusId];
      return newState;
    });
    
    toast({
      title: isBookmarked[statusId] ? 'Removed from bookmarks' : 'Added to bookmarks',
      description: isBookmarked[statusId] 
        ? 'Post has been removed from your bookmarks' 
        : 'Post has been saved to your bookmarks',
      duration: 1500,
    });
  };
  
  // Handle post click to view comments
  const handlePostClick = async (statusId: string) => {
    // If already viewing this post, close it
    if (activePostId === statusId) {
      setActivePostId(null);
      return;
    }
    
    setActivePostId(statusId);
    setIsLoadingComments(true);
    
    try {
      // Check if we already have comments for this post
      const post = statusUpdates.find(s => s.id === statusId);
      if (post && !post.commentsList) {
        // Fetch comments if we don't have them yet
        const comments = await fetchComments(statusId);
        
        // Update the post with comments
        setStatusUpdates(prev => prev.map(s => {
          if (s.id === statusId) {
            return {
              ...s,
              commentsList: comments
            };
          }
          return s;
        }));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load comments. Please try again.',
      });
    } finally {
      setIsLoadingComments(false);
    }
  };
  
  // Handle comment on status
  const handleComment = async (statusId: string, comment: string) => {
    if (!comment.trim()) return;
    
    // Create a new comment object
    const newComment: Comment = {
      id: `comment-new-${Date.now()}`,
      userId: 'current-user-id',
      userName: 'Current User',
      userAvatar: '/placeholder-avatar.jpg',
      content: comment,
      timestamp: new Date().toISOString(),
      likes: 0
    };
    
    // Update UI immediately
    setStatusUpdates(prev => prev.map(s => {
      if (s.id === statusId) {
        return {
          ...s,
          comments: s.comments + 1,
          commentsList: s.commentsList ? [newComment, ...s.commentsList] : [newComment]
        };
      }
      return s;
    }));
    
    // Clear comment text
    setCommentText('');
    
    try {
      await commentOnStatus(statusId, comment);
      
      toast({
        title: 'Comment posted',
        description: 'Your comment has been posted successfully.',
      });
    } catch (error) {
      console.error('Error commenting on status:', error);
      
      // Revert UI changes if API call fails
      setStatusUpdates(prev => prev.map(s => {
        if (s.id === statusId) {
          return {
            ...s,
            comments: s.comments - 1,
            commentsList: s.commentsList?.filter(c => c.id !== newComment.id)
          };
        }
        return s;
      }));
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
      });
    }
  };
  
  // Handle share status
  const handleShare = async (statusId: string) => {
    setStatusUpdates(prev => prev.map(s => {
      if (s.id === statusId) {
        return {
          ...s,
          shares: s.shares + 1
        };
      }
      return s;
    }));
    
    try {
      await shareStatus(statusId);
    } catch (error) {
      console.error('Error sharing status:', error);
      
      setStatusUpdates(prev => prev.map(s => {
        if (s.id === statusId) {
          return {
            ...s,
            shares: s.shares - 1
          };
        }
        return s;
      }));
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to share status. Please try again.',
      });
    }
  };
  
  // Post upgrade feature removed
  
  // Handle copy link to status
  const handleCopyLink = (statusId: string) => {
    const statusLink = `${window.location.origin}/status/${statusId}`;
    navigator.clipboard.writeText(statusLink);
    
    toast({
      title: 'Link copied',
      description: 'Status link copied to clipboard',
      duration: 1500,
    });
    
    handleShare(statusId);
  };
  
  // Handle upvote
  const handleUpvote = async (statusId: string) => {
    const status = statusUpdates.find(s => s.id === statusId);
    if (!status) return;
    
    const currentVoteStatus = voteStatus[statusId] || 'none';
    let newVoteStatus: 'upvoted' | 'downvoted' | 'none';
    let likesChange = 0;
    
    // Determine the new vote status and likes change
    if (currentVoteStatus === 'upvoted') {
      // If already upvoted, remove the upvote
      newVoteStatus = 'none';
      likesChange = -1;
    } else if (currentVoteStatus === 'downvoted') {
      // If downvoted, change to upvoted (2 point swing)
      newVoteStatus = 'upvoted';
      likesChange = 2;
    } else {
      // If no vote, add upvote
      newVoteStatus = 'upvoted';
      likesChange = 1;
    }
    
    // Update UI immediately for responsive feel
    setVoteStatus(prev => ({
      ...prev,
      [statusId]: newVoteStatus
    }));
    
    setStatusUpdates(prev => prev.map(s => {
      if (s.id === statusId) {
        return {
          ...s,
          likes: s.likes + likesChange
        };
      }
      return s;
    }));
    
    // Call API
    try {
      await voteOnPost(statusId, newVoteStatus === 'upvoted' ? 'upvote' : 'none');
    } catch (error) {
      console.error('Error upvoting post:', error);
      
      // Revert UI changes if API call fails
      setVoteStatus(prev => ({
        ...prev,
        [statusId]: currentVoteStatus
      }));
      
      setStatusUpdates(prev => prev.map(s => {
        if (s.id === statusId) {
          return {
            ...s,
            likes: s.likes - likesChange
          };
        }
        return s;
      }));
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update vote. Please try again.',
      });
    }
  };
  
  // Handle downvote
  const handleDownvote = async (statusId: string) => {
    const status = statusUpdates.find(s => s.id === statusId);
    if (!status) return;
    
    const currentVoteStatus = voteStatus[statusId] || 'none';
    let newVoteStatus: 'upvoted' | 'downvoted' | 'none';
    let likesChange = 0;
    
    // Determine the new vote status and likes change
    if (currentVoteStatus === 'downvoted') {
      // If already downvoted, remove the downvote
      newVoteStatus = 'none';
      likesChange = 1; // Removing a downvote increases the count
    } else if (currentVoteStatus === 'upvoted') {
      // If upvoted, change to downvoted (2 point swing)
      newVoteStatus = 'downvoted';
      likesChange = -2;
    } else {
      // If no vote, add downvote
      newVoteStatus = 'downvoted';
      likesChange = -1;
    }
    
    // Update UI immediately for responsive feel
    setVoteStatus(prev => ({
      ...prev,
      [statusId]: newVoteStatus
    }));
    
    setStatusUpdates(prev => prev.map(s => {
      if (s.id === statusId) {
        return {
          ...s,
          likes: s.likes + likesChange
        };
      }
      return s;
    }));
    
    // Call API
    try {
      await voteOnPost(statusId, newVoteStatus === 'downvoted' ? 'downvote' : 'none');
    } catch (error) {
      console.error('Error downvoting post:', error);
      
      // Revert UI changes if API call fails
      setVoteStatus(prev => ({
        ...prev,
        [statusId]: currentVoteStatus
      }));
      
      setStatusUpdates(prev => prev.map(s => {
        if (s.id === statusId) {
          return {
            ...s,
            likes: s.likes - likesChange
          };
        }
        return s;
      }));
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update vote. Please try again.',
      });
    }
  };

  // Handle playing a stream
  const handlePlayStream = (stream: LiveStream) => {
    setSelectedStream(stream);
    setShowStreamDialog(true);
  };
  
  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const updates = await fetchStatusUpdates(1);
        
        // Initialize with default vote status
        const initialVoteStatus: Record<string, 'upvoted' | 'downvoted' | 'none'> = {};
        updates.forEach(update => {
          initialVoteStatus[update.id] = 'none';
        });
        setVoteStatus(initialVoteStatus);
        
        setStatusUpdates(updates);
        setPage(1);
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load content. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [toast]);
  
  // Filter content based on selected content type
  const [contentType, setContentType] = useState<'feeds' | 'video' | 'audio' | 'soko' | 'challenges'>('feeds');
  
  // State for leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([
    {
      id: '1',
      name: 'Sydney',
      avatar: '/placeholder-avatar.jpg',
      challengesCompleted: 12,
      totalEarnings: 1250,
      rank: 1,
      isWatcher: false
    },
    {
      id: '2',
      name: 'Vee',
      avatar: '/placeholder-avatar.jpg',
      challengesCompleted: 10,
      totalEarnings: 980,
      rank: 2,
      isWatcher: true
    },
    {
      id: '3',
      name: 'Tommy',
      avatar: '/placeholder-avatar.jpg',
      challengesCompleted: 8,
      totalEarnings: 720,
      rank: 3,
      isWatcher: false
    },
    {
      id: '4',
      name: 'Current User',
      avatar: '/placeholder-avatar.jpg',
      challengesCompleted: 3,
      totalEarnings: 175,
      rank: 4,
      isWatcher: false
    }
  ]);
  
  // State for challenges
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  
  // Load challenges from the challenge service
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const socialChallenges = await ChallengeService.getSocialChallenges();
        // Convert social challenges to the Challenge format used in the component
        const formattedChallenges = socialChallenges.map(sc => ({
          id: sc.id,
          creatorId: 'creator-id',
          creatorName: 'Challenge Creator',
          creatorAvatar: '/placeholder-avatar.jpg',
          title: sc.title,
          description: sc.description,
          prizeAmount: sc.prizeAmount,
          difficulty: sc.difficulty,
          timestamp: sc.createdAt,
          expiresAt: sc.expiresAt,
          participants: sc.participants,
          status: sc.status,
          completedBy: sc.submissions.filter(s => s.status === 'approved').map(s => s.userId),
          proofRequired: sc.proofRequired,
          category: sc.category
        }));
        
        setChallenges(formattedChallenges);
      } catch (error) {
        console.error('Error loading challenges:', error);
        toast({
          title: 'Error',
          description: 'Failed to load challenges. Please try again.',
          variant: 'destructive',
        });
      }
    };
    
    loadChallenges();
  }, [toast]);
  
  // State for challenge creation and interaction
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [newChallenge, setNewChallenge] = useState<Partial<Challenge>>({
    title: '',
    description: '',
    prizeAmount: 50,
    difficulty: 'medium',
    proofRequired: true,
    category: 'Performance'
  });
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const [isAcceptingChallenge, setIsAcceptingChallenge] = useState(false);
  const [proofContent, setProofContent] = useState('');
  
  const filteredStatusUpdates = useMemo(() => {
    if (contentType === 'feeds') {
      return statusUpdates;
    } else if (contentType === 'video') {
      return statusUpdates.filter(status => status.mediaType === 'video');
    } else if (contentType === 'audio') {
      return statusUpdates.filter(status => status.mediaType === 'audio');
    } else if (contentType === 'challenges') {
      // When in challenges tab, we'll show posts related to challenges
      // but the actual challenges will be shown separately
      return statusUpdates.filter(status => 
        status.content.toLowerCase().includes('challenge') ||
        status.content.toLowerCase().includes('#nerve')
      );
    }
    return statusUpdates;
  }, [statusUpdates, contentType]);
  
  return (
    <div className="responsive-layout w-full gap-0 mx-auto max-w-full px-0 py-0 bg-background tiktok-feed-container safe-area-inset safe-area-bottom">
      {/* Left Sidebar */}
      <div className="left-sidebar hidden lg:block w-72 flex-shrink-0 sidebar-column">
        <Card className="sticky top-4 border-0 shadow-sm rounded-xl overflow-hidden">
          {/* Live Stream Preview Section */}
          {isStreamActive && (
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold mb-2">Your Live Stream</h3>
              <div className="rounded-lg overflow-hidden bg-muted mb-2">
                {streamType === 'video' ? (
                  <div className="relative aspect-video bg-black">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      muted 
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                      LIVE
                    </div>
                  </div>
                ) : streamType === 'audio' ? (
                  <div className="p-4 flex items-center justify-between bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Mic className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Audio Stream</p>
                        <p className="text-xs text-muted-foreground">Live</p>
                      </div>
                    </div>
                    <audio ref={audioRef} className="hidden" autoPlay />
                  </div>
                ) : null}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {streamTitle || `${streamType === 'video' ? 'Video' : 'Audio'} Stream`}
                </p>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="h-7 text-xs"
                  onClick={handleStopStream}
                >
                  End Stream
                </Button>
              </div>
            </div>
          )}
          
          {/* Live Streams List - WhatsApp Status Style */}
          {liveStreams.length > 0 && (
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold mb-3">Live Stories</h3>
              <div className="flex flex-col space-y-4">
                {/* Active stream at the top if exists */}
                {isStreamActive && activeStream && (
                  <div className="relative">
                    <div className="rounded-lg overflow-hidden border-2 border-primary shadow-md">
                      {streamType === 'video' ? (
                        <div className="aspect-[9/16] bg-black relative">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            muted 
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 border-2 border-primary">
                                <AvatarImage src="/placeholder-avatar.jpg" alt="Your Avatar" />
                                <AvatarFallback className="bg-primary/10 text-primary">YA</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium text-foreground">{streamTitle || 'Your Live Stream'}</p>
                                <p className="text-xs text-muted-foreground">Live now</p>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2">
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-7 w-7 p-0 rounded-full"
                              onClick={handleStopStream}
                            >
                              <StopCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : streamType === 'audio' ? (
                        <div className="aspect-[9/16] bg-gradient-to-b from-primary/10 to-background relative p-4 flex flex-col justify-between">
                          <div className="flex-1 flex items-center justify-center">
                            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                              <Mic className="h-10 w-10 text-primary" />
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 border-2 border-primary">
                                <AvatarImage src="/placeholder-avatar.jpg" alt="Your Avatar" />
                                <AvatarFallback className="bg-primary/10 text-primary">YA</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium text-foreground">{streamTitle || 'Your Audio Stream'}</p>
                                <p className="text-xs text-muted-foreground">Live now</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                      <span className="text-[10px] text-primary-foreground font-bold">LIVE</span>
                    </div>
                  </div>
                )}
                
                {/* Other live streams */}
                {liveStreams.filter(stream => stream.isLive && (!activeStream || stream.id !== activeStream.id)).map((stream, index) => (
                  <div 
                    key={stream.id} 
                    className="relative cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handlePlayStream(stream)}
                  >
                    <div className="rounded-lg overflow-hidden border-2 border-muted shadow-sm">
                      {stream.mediaType === 'video' ? (
                        <div className="aspect-[9/16] bg-gradient-to-b from-muted to-card relative">
                          {/* Placeholder for video thumbnail */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="h-10 w-10 text-muted-foreground/50" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 border-2 border-muted-foreground/30">
                                <AvatarImage src={stream.userAvatar} alt={stream.userName} />
                                <AvatarFallback className="bg-primary/10 text-primary">{stream.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium text-foreground">{stream.title}</p>
                                <p className="text-xs text-muted-foreground">{stream.userName}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[9/16] bg-gradient-to-b from-primary/5 to-background relative p-4 flex flex-col justify-between">
                          <div className="flex-1 flex items-center justify-center">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                              <Mic className="h-10 w-10 text-primary/70" />
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 border-2 border-muted-foreground/30">
                                <AvatarImage src={stream.userAvatar} alt={stream.userName} />
                                <AvatarFallback className="bg-primary/10 text-primary">{stream.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium text-foreground">{stream.title}</p>
                                <p className="text-xs text-muted-foreground">{stream.userName}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                      <span className="text-[10px] text-primary-foreground font-bold">LIVE</span>
                    </div>
                  </div>
                ))}
                
                {/* Past streams (not live) */}
                {liveStreams.filter(stream => !stream.isLive).map((stream, index) => (
                  <div 
                    key={stream.id} 
                    className="relative cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handlePlayStream(stream)}
                  >
                    <div className="rounded-lg overflow-hidden border-2 border-muted/30 shadow-sm">
                      {stream.mediaType === 'video' ? (
                        <div className="aspect-[9/16] bg-gradient-to-b from-muted/50 to-card/50 relative">
                          {/* Placeholder for video thumbnail */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="h-10 w-10 text-muted-foreground/40" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 border-2 border-muted-foreground/20">
                                <AvatarImage src={stream.userAvatar} alt={stream.userName} />
                                <AvatarFallback className="bg-primary/5 text-primary/70">{stream.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium text-foreground/80">{stream.title}</p>
                                <p className="text-xs text-muted-foreground/70">{stream.userName}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[9/16] bg-gradient-to-b from-muted/30 to-background relative p-4 flex flex-col justify-between">
                          <div className="flex-1 flex items-center justify-center">
                            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                              <Mic className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 border-2 border-muted-foreground/20">
                                <AvatarImage src={stream.userAvatar} alt={stream.userName} />
                                <AvatarFallback className="bg-primary/5 text-primary/70">{stream.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium text-foreground/80">{stream.title}</p>
                                <p className="text-xs text-muted-foreground/70">{stream.userName}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-muted-foreground border-2 border-background flex items-center justify-center">
                      <span className="text-[10px] text-background font-bold">END</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          

        </Card>
      </div>
      
      {/* Center Feed Area */}
      <div className="main-column flex-1 min-w-0 w-full max-w-3xl mx-auto md:mx-0">
        <Card className="border-0 shadow-md rounded-lg bg-card dark:bg-card/90 backdrop-blur-sm overflow-hidden h-full">
          <div className="p-6">
            {/* Create Post Button */}
            <div className="flex items-center gap-2 mb-4">
              <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm"
                    className="rounded-full px-3 py-1 h-8 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
                  >
                    <PenSquare className="h-3 w-3" />
                    Create Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-xl border-0 shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Create a post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8 border border-muted">
                        <AvatarImage src="/placeholder-avatar.jpg" alt="Your Avatar" />
                        <AvatarFallback className="bg-primary/10 text-primary">YA</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Current User</span>
                    </div>
                    
                    {/* Stream Preview */}
                    {showStreamPreview && (
                      <div className="rounded-lg overflow-hidden bg-muted mb-2">
                        {streamType === 'video' ? (
                          <div className="relative aspect-video bg-black">
                            <video 
                              ref={videoRef} 
                              autoPlay 
                              muted 
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 right-2">
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-7 w-7 p-0 rounded-full"
                                onClick={handleStopStream}
                              >
                                <StopCircle className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                              LIVE
                            </div>
                          </div>
                        ) : streamType === 'audio' ? (
                          <div className="p-4 flex items-center justify-between bg-muted/50">
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <Mic className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Audio Stream</p>
                                <p className="text-xs text-muted-foreground">Recording...</p>
                              </div>
                            </div>
                            <audio ref={audioRef} className="hidden" autoPlay />
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-7 w-7 p-0 rounded-full"
                              onClick={handleStopStream}
                            >
                              <StopCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    )}
                    
                    <Textarea 
                      placeholder="What would you like to share?" 
                      className="min-h-[120px] text-sm"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                    />
                    
                    {/* Stream title input when streaming */}
                    {isStreamActive && (
                      <Input
                        placeholder="Add a title to your stream"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        className="text-sm"
                      />
                    )}
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full h-7 text-xs"
                        disabled={isStreamActive}
                      >
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Image
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full h-7 text-xs"
                        disabled={isStreamActive}
                      >
                        <Link className="h-3 w-3 mr-1" />
                        Link
                      </Button>

                      {/* Soko product creation button */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full h-7 text-xs bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={() => setShowProductDialog(true)}
                        disabled={isStreamActive}
                      >
                        <ShoppingBag className="h-3 w-3 mr-1" />
                        Soko Product
                      </Button>
                      
                      {/* Challenges button - now opens challenge creation dialog */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full h-7 text-xs bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={() => {
                          setShowChallengeDialog(true);
                          setShowPostDialog(false);
                        }}
                        disabled={isStreamActive}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Challenge
                      </Button>
                      
                      {/* Video streaming button */}
                      {!isStreamActive ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full h-7 text-xs"
                          onClick={() => handleStartStream('video')}
                          disabled={isStreamLoading}
                        >
                          <Video className="h-3 w-3 mr-1" />
                          Video Stream
                        </Button>
                      ) : streamType === 'video' ? (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="rounded-full h-7 text-xs"
                          onClick={handleStopStream}
                        >
                          <VideoOff className="h-3 w-3 mr-1" />
                          Stop Video
                        </Button>
                      ) : null}
                      
                      {/* Audio streaming button */}
                      {!isStreamActive ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full h-7 text-xs"
                          onClick={() => handleStartStream('audio')}
                          disabled={isStreamLoading}
                        >
                          <Mic className="h-3 w-3 mr-1" />
                          Audio Stream
                        </Button>
                      ) : streamType === 'audio' ? (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="rounded-full h-7 text-xs"
                          onClick={handleStopStream}
                        >
                          <MicOff className="h-3 w-3 mr-1" />
                          Stop Audio
                        </Button>
                      ) : null}
                    </div>
                    
                    {/* Stream error message */}
                    {streamError && (
                      <div className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {streamError}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (isStreamActive) {
                          handleStopStream();
                        }
                        setShowPostDialog(false);
                      }}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleCreatePost}
                      disabled={isCreatingPost || (!postContent.trim() && !isStreamActive)}
                      className="h-8 text-xs"
                    >
                      {isCreatingPost ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Posting...
                        </>
                      ) : 'Post'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Product Creation Dialog */}
              <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogContent className="sm:max-w-[500px] rounded-xl border-0 shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Create Soko Product</DialogTitle>
                    <DialogDescription>
                      Create a new product to sell in your Soko store
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-3">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="product-name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct((prev: Partial<Product>) => ({ ...prev, name: e.target.value }))}
                        className="col-span-3"
                        placeholder="Product name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product-price" className="text-right">
                        Price
                      </Label>
                      <div className="col-span-3 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                        <Input
                          id="product-price"
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct((prev: Partial<Product>) => ({ ...prev, price: parseFloat(e.target.value) }))}
                          className="flex-1"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product-stock" className="text-right">
                        Stock
                      </Label>
                      <Input
                        id="product-stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct((prev: Partial<Product>) => ({ ...prev, stock: parseInt(e.target.value) }))}
                        className="col-span-3"
                        placeholder="0"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product-category" className="text-right">
                        Category
                      </Label>
                      <Input
                        id="product-category"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct((prev: Partial<Product>) => ({ ...prev, category: e.target.value }))}
                        className="col-span-3"
                        placeholder="Digital Products"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product-status" className="text-right">
                        Status
                      </Label>
                      <select
                        id="product-status"
                        value={newProduct.status}
                        onChange={(e) => setNewProduct((prev: Partial<Product>) => ({ ...prev, status: e.target.value as 'active' | 'draft' | 'out-of-stock' }))}
                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="out-of-stock">Out of Stock</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="product-description" className="text-right pt-2">
                        Description
                      </Label>
                      <Textarea
                        id="product-description"
                        value={newProduct.description || ''}
                        onChange={(e) => setNewProduct((prev: Partial<Product>) => ({ ...prev, description: e.target.value }))}
                        className="col-span-3"
                        placeholder="Product description"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowProductDialog(false);
                        setNewProduct({
                          name: '',
                          price: 0,
                          stock: 0,
                          category: 'Digital Products',
                          status: 'active',
                          description: ''
                        });
                      }}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setIsCreatingProduct(true);
                        if (newProduct.name && newProduct.price !== undefined) {
                          addProduct(newProduct as Omit<Product, 'id'>);
                          setShowProductDialog(false);
                          setPostContent(prev => {
                            const productInfo = `Just created a new product: ${newProduct.name} - $${newProduct.price}\n`;
                            return prev ? prev + '\n' + productInfo : productInfo;
                          });
                          toast({
                            title: 'Product Created',
                            description: `${newProduct.name} has been added to your Soko store`,
                          });
                          setNewProduct({
                            name: '',
                            price: 0,
                            stock: 0,
                            category: 'Digital Products',
                            status: 'active',
                            description: ''
                          });
                        } else {
                          toast({
                            title: 'Error',
                            description: 'Product name and price are required',
                            variant: 'destructive',
                          });
                        }
                        setIsCreatingProduct(false);
                      }}
                      disabled={isCreatingProduct || !newProduct.name || newProduct.price === undefined}
                      className="h-8 text-xs"
                    >
                      {isCreatingProduct ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Creating...
                        </>
                      ) : 'Create Product'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Challenge Creation Dialog */}
              <Dialog open={showChallengeDialog} onOpenChange={setShowChallengeDialog}>
                <DialogContent className="sm:max-w-[500px] rounded-xl border-0 shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Create a NERVE Challenge
                    </DialogTitle>
                    <DialogDescription>
                      Create a challenge with a cash prize for others to complete
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8 border border-muted">
                        <AvatarImage src="/placeholder-avatar.jpg" alt="Your Avatar" />
                        <AvatarFallback className="bg-primary/10 text-primary">YA</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Current User</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-3 items-center">
                        <Label htmlFor="challenge-title" className="text-sm">
                          Title
                        </Label>
                        <Input
                          id="challenge-title"
                          className="col-span-3"
                          placeholder="What's your challenge?"
                          value={newChallenge.title}
                          onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 items-start">
                        <Label htmlFor="challenge-description" className="text-sm">
                          Description
                        </Label>
                        <Textarea
                          id="challenge-description"
                          className="col-span-3"
                          placeholder="Describe what participants need to do"
                          rows={3}
                          value={newChallenge.description}
                          onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 items-center">
                        <Label htmlFor="challenge-prize" className="text-sm">
                          Prize Amount
                        </Label>
                        <div className="col-span-3 relative">
                          <DollarSign className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="challenge-prize"
                            type="number"
                            min="5"
                            step="5"
                            className="pl-9"
                            value={newChallenge.prizeAmount}
                            onChange={(e) => setNewChallenge(prev => ({ ...prev, prizeAmount: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 items-center">
                        <Label htmlFor="challenge-difficulty" className="text-sm">
                          Difficulty
                        </Label>
                        <div className="col-span-3">
                          <div className="flex gap-2">
                            {(['easy', 'medium', 'hard', 'extreme'] as const).map(level => (
                              <Button 
                                key={level}
                                type="button"
                                variant={newChallenge.difficulty === level ? 'default' : 'outline'}
                                className={`flex-1 text-xs capitalize ${newChallenge.difficulty === level ? '' : 'text-muted-foreground'}`}
                                onClick={() => setNewChallenge(prev => ({ ...prev, difficulty: level }))}
                              >
                                {level}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 items-center">
                        <Label htmlFor="challenge-category" className="text-sm">
                          Category
                        </Label>
                        <div className="col-span-3">
                          <select
                            id="challenge-category"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={newChallenge.category}
                            onChange={(e) => setNewChallenge(prev => ({ ...prev, category: e.target.value }))}
                          >
                            <option value="Performance">Performance</option>
                            <option value="Physical">Physical</option>
                            <option value="Food">Food</option>
                            <option value="Social">Social</option>
                            <option value="Skill">Skill</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 items-center">
                        <Label className="text-sm">
                          Proof Required
                        </Label>
                        <div className="col-span-3 flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="challenge-proof"
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                            checked={newChallenge.proofRequired}
                            onChange={(e) => setNewChallenge(prev => ({ ...prev, proofRequired: e.target.checked }))}
                          />
                          <Label htmlFor="challenge-proof" className="text-sm font-normal">
                            Require video/photo proof of completion
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowChallengeDialog(false);
                        setNewChallenge({
                          title: '',
                          description: '',
                          prizeAmount: 50,
                          difficulty: 'medium',
                          proofRequired: true,
                          category: 'Performance'
                        });
                      }}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      className="h-8 text-xs bg-gradient-to-r from-yellow-500 to-red-500 text-white hover:from-yellow-600 hover:to-red-600"
                      onClick={async () => {
                        setIsCreatingChallenge(true);
                        if (newChallenge.title && newChallenge.description && newChallenge.prizeAmount) {
                          // Create a new challenge using the challenge service
                          try {
                            const socialChallenge = {
                              title: newChallenge.title,
                              description: newChallenge.description || '',
                              prizeAmount: newChallenge.prizeAmount || 50,
                              difficulty: newChallenge.difficulty || 'medium',
                              expiresAt: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
                              proofRequired: newChallenge.proofRequired !== false,
                              category: newChallenge.category || 'Performance',
                              status: 'active'
                            };
                            
                            // Create the challenge via the service
                            const createdChallenge = await ChallengeService.createChallenge({...socialChallenge, type: 'social'});
                            
                            // Convert to UI challenge format
                            const challenge = {
                              id: createdChallenge.id,
                              creatorId: 'current-user-id',
                              creatorName: 'Current User',
                              creatorAvatar: '/placeholder-avatar.jpg',
                              title: createdChallenge.title,
                              description: createdChallenge.description,
                              prizeAmount: createdChallenge.prizeAmount,
                              difficulty: createdChallenge.difficulty,
                              timestamp: createdChallenge.createdAt,
                              expiresAt: createdChallenge.expiresAt,
                              participants: 0,
                              status: createdChallenge.status,
                              completedBy: [],
                              proofRequired: createdChallenge.proofRequired,
                              category: createdChallenge.category
                            };
                            
                            // Add the challenge to the list
                            setChallenges(prev => [challenge, ...prev]);
                          
                          // Create a post about the challenge
                          setPostContent(`#NERVE I just created a new challenge: "${challenge.title}" with a $${challenge.prizeAmount} prize! Check it out in the Challenges tab.`);
                          // We'll call handleCreatePost after setting the content
                          setTimeout(() => {
                            handleCreatePost();
                          }, 100);
                          
                          // Reset the form and close the dialog
                          setNewChallenge({
                            title: '',
                            description: '',
                            prizeAmount: 50,
                            difficulty: 'medium',
                            proofRequired: true,
                            category: 'Performance'
                          });
                          setShowChallengeDialog(false);
                          
                          // Show a toast
                          toast({
                            title: 'Challenge Created',
                            description: `Your challenge "${newChallenge.title}" has been created with a $${newChallenge.prizeAmount} prize.`,
                          });
                          } catch (error) {
                            console.error('Error creating challenge:', error);
                            toast({
                              title: 'Error',
                              description: 'Failed to create challenge. Please try again.',
                              variant: 'destructive',
                            });
                          }
                          
                          // Switch to challenges tab
                          setContentType('challenges');
                        } else {
                          toast({
                            title: 'Error',
                            description: 'Please fill in all required fields',
                            variant: 'destructive',
                          });
                        }
                        setIsCreatingChallenge(false);
                      }}
                      disabled={isCreatingChallenge || !newChallenge.title || !newChallenge.description || !newChallenge.prizeAmount}
                    >
                      {isCreatingChallenge ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Creating...
                        </>
                      ) : 'Create Challenge'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Challenge Acceptance Dialog */}
              <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
                <DialogContent className="sm:max-w-[500px] rounded-xl border-0 shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Accept NERVE Challenge
                    </DialogTitle>
                    <DialogDescription>
                      {currentChallenge ? (
                        <span className="text-sm font-medium">"{currentChallenge.title}" - ${currentChallenge.prizeAmount} prize</span>
                      ) : 'Accept a challenge and win cash prizes'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {currentChallenge && (
                    <div className="space-y-4 py-3">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm mb-2">{currentChallenge.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">{currentChallenge.category}</Badge>
                          <Badge variant="secondary" className="text-xs">{currentChallenge.difficulty.charAt(0).toUpperCase() + currentChallenge.difficulty.slice(1)}</Badge>
                          <Badge variant="secondary" className="text-xs">Expires in {formatTimeRemaining(currentChallenge.expiresAt)}</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Challenge Rules</h3>
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${currentChallenge.prizeAmount} Prize
                          </Badge>
                        </div>
                        
                        <ul className="text-xs space-y-2 list-disc pl-4">
                          <li>Complete the challenge exactly as described</li>
                          <li>Submit proof of completion (video/photo required)</li>
                          <li>Prize will be awarded after verification</li>
                          <li>Challenge must be completed before expiration</li>
                          <li>By accepting, you agree to NERVE's terms and conditions</li>
                        </ul>
                        
                        {currentChallenge.proofRequired && (
                          <div className="mt-4">
                            <Label htmlFor="proof-content" className="text-sm font-medium">
                              Proof of Completion
                            </Label>
                            <div className="mt-2 space-y-2">
                              <Textarea
                                id="proof-content"
                                placeholder="Describe how you'll complete this challenge..."
                                className="min-h-[80px] text-sm"
                                value={proofContent}
                                onChange={(e) => setProofContent(e.target.value)}
                              />
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-full h-7 text-xs w-full"
                                >
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  Add Photo Proof
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-full h-7 text-xs w-full"
                                >
                                  <Video className="h-3 w-3 mr-1" />
                                  Add Video Proof
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowAcceptDialog(false);
                        setCurrentChallenge(null);
                        setProofContent('');
                      }}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      className="h-8 text-xs bg-gradient-to-r from-yellow-500 to-red-500 text-white hover:from-yellow-600 hover:to-red-600"
                      onClick={async () => {
                        if (!currentChallenge) return;
                        
                        setIsAcceptingChallenge(true);
                        
                        // Update the challenge with a new participant using the challenge service
                        try {
                          // Submit proof to the challenge
                          const submission = {
                            userId: 'current-user-id',
                            userName: 'Current User',
                            userAvatar: '/placeholder-avatar.jpg',
                            proofContent: proofContent || 'Challenge accepted',
                            proofMedia: undefined
                          };
                          
                          // Submit the proof via the service
                          await ChallengeService.submitChallengeProof(currentChallenge.id, submission);
                          
                          // Update the local state
                          setChallenges(prev => 
                            prev.map(challenge => {
                              if (challenge.id === currentChallenge.id) {
                                return {
                                  ...challenge,
                                  participants: challenge.participants + 1
                                };
                              }
                              return challenge;
                            })
                          );
                        } catch (error) {
                          console.error('Error submitting challenge proof:', error);
                          toast({
                            title: 'Error',
                            description: 'Failed to submit challenge proof. Please try again.',
                            variant: 'destructive',
                          });
                        }
                        
                        // Create a post about accepting the challenge
                        setPostContent(`#NERVE I just accepted the "${currentChallenge.title}" challenge for $${currentChallenge.prizeAmount}! Watch me complete it! 🔥`);
                        
                        // We'll call handleCreatePost after setting the content
                        setTimeout(() => {
                          handleCreatePost();
                        }, 100);
                        
                        // Show a toast
                        toast({
                          title: 'Challenge Accepted',
                          description: `You've accepted "${currentChallenge.title}". Good luck!`,
                        });
                        
                        // Reset and close dialog
                        setShowAcceptDialog(false);
                        setCurrentChallenge(null);
                        setProofContent('');
                        setIsAcceptingChallenge(false);
                        
                        // Switch to challenges tab
                        setContentType('challenges');
                      }}
                      disabled={isAcceptingChallenge || !currentChallenge}
                    >
                      {isAcceptingChallenge ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Accepting...
                        </>
                      ) : 'Accept Challenge'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Content Type Filtering */}
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                <Button 
                  variant="ghost" 
                  className={`px-3 py-1 sm:px-4 sm:py-2 h-auto rounded-full text-xs sm:text-sm font-medium ${contentType === 'feeds' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'} touch-manipulation`}
                  onClick={() => setContentType('feeds')}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                  Feeds
                </Button>
                <Button 
                  variant="ghost" 
                  className={`px-3 py-1 sm:px-4 sm:py-2 h-auto rounded-full text-xs sm:text-sm font-medium ${contentType === 'video' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'} touch-manipulation`}
                  onClick={() => setContentType('video')}
                >
                  <Video className="h-3.5 w-3.5 mr-1.5" />
                  Video
                </Button>
                <Button 
                  variant="ghost" 
                  className={`px-3 py-1 sm:px-4 sm:py-2 h-auto rounded-full text-xs sm:text-sm font-medium ${contentType === 'audio' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'} touch-manipulation`}
                  onClick={() => setContentType('audio')}
                >
                  <Mic className="h-3.5 w-3.5 mr-1.5" />
                  Audio
                </Button>
                <Button 
                  variant="ghost" 
                  className={`px-3 py-1 sm:px-4 sm:py-2 h-auto rounded-full text-xs sm:text-sm font-medium ${contentType === 'soko' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'} touch-manipulation`}
                  onClick={() => setContentType('soko')}
                >
                  <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                  Soko
                </Button>
                <Button 
                  variant="ghost" 
                  className={`px-3 py-1 sm:px-4 sm:py-2 h-auto rounded-full text-xs sm:text-sm font-medium ${contentType === 'challenges' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'} touch-manipulation`}
                  onClick={() => setContentType('challenges')}
                >
                  <Star className="h-3.5 w-3.5 mr-1.5" />
                  Challenges
                </Button>
              </div>
            </div>
            
            <div className="space-y-4 md:space-y-6 mobile-bottom-safe">
            {/* E-commerce sections - only shown when soko tab is selected */}
            {contentType === 'soko' && (
              <>
                {/* Product Feed Section */}
                <ProductFeedSection />
                
                {/* Shop Feed Section - Tiny Bar */}
                <ShopFeedSection />
              </>
            )}
            
            {/* Challenges section - only shown when challenges tab is selected */}
            {contentType === 'challenges' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Active Challenges
                  </h2>
                  <Button 
                    size="sm" 
                    className="h-8 text-xs rounded-full px-3 bg-gradient-to-r from-yellow-500 to-red-500 text-white hover:from-yellow-600 hover:to-red-600"
                    onClick={() => setShowChallengeDialog(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create Challenge
                  </Button>
                </div>
                
                {/* NERVE Leaderboard */}
                <div className="mb-6 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      NERVE Leaderboard
                    </h3>
                    <Badge variant="outline" className="text-xs bg-black/10 dark:bg-white/5">
                      Top Players
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {leaderboard.map((user) => (
                      <div key={user.id} className="flex items-center justify-between bg-background/60 backdrop-blur-sm rounded-md p-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-xs font-bold">
                            {user.rank}
                          </div>
                          <Avatar className="h-6 w-6 border border-muted">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium flex items-center gap-1">
                              {user.name}
                              {user.isWatcher && (
                                <Badge variant="outline" className="text-[10px] h-4 bg-blue-500/10 text-blue-500 border-blue-500/20">
                                  Watcher
                                </Badge>
                              )}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {user.challengesCompleted} challenges completed
                            </p>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-primary flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {user.totalEarnings}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 flex justify-center">
                    <Button variant="ghost" size="sm" className="text-xs h-7 w-full">
                      View Full Leaderboard
                    </Button>
                  </div>
                </div>
                
                {challenges.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
                      <Star className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No challenges found</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      Be the first to create a NERVE challenge with a cash prize!
                    </p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-yellow-500 to-red-500 text-white hover:from-yellow-600 hover:to-red-600"
                      onClick={() => setShowChallengeDialog(true)}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Create a Challenge
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {challenges.map(challenge => (
                      <Card key={challenge.id} className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-200">
                        <div className="flex flex-col md:flex-row">
                          <div className={`w-full md:w-2 ${challenge.difficulty === 'easy' ? 'bg-green-500' : challenge.difficulty === 'medium' ? 'bg-yellow-500' : challenge.difficulty === 'hard' ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                          <div className="flex-1 p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 border-2 border-primary">
                                  <AvatarImage src={challenge.creatorAvatar} alt={challenge.creatorName} />
                                  <AvatarFallback>{challenge.creatorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-bold text-base">{challenge.title}</h3>
                                  <p className="text-xs text-muted-foreground">by {challenge.creatorName} • {formatRelativeTime(challenge.timestamp)}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${challenge.prizeAmount}
                              </Badge>
                            </div>
                            
                            <p className="text-sm mb-3">{challenge.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="secondary" className="text-xs">{challenge.category}</Badge>
                              <Badge variant="secondary" className="text-xs">{challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}</Badge>
                              <Badge variant="secondary" className="text-xs">{challenge.participants} participants</Badge>
                              <Badge variant="secondary" className="text-xs">Expires in {formatTimeRemaining(challenge.expiresAt)}</Badge>
                            </div>
                            
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center gap-2">
                                {challenge.completedBy && challenge.completedBy.length > 0 && (
                                  <div className="flex -space-x-2">
                                    {[...Array(Math.min(3, challenge.completedBy.length))].map((_, i) => (
                                      <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                        <AvatarFallback className="text-[10px] bg-primary/10">U{i+1}</AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {challenge.completedBy.length > 3 && (
                                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">+{challenge.completedBy.length - 3}</div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-gradient-to-r from-yellow-500 to-red-500 text-white hover:from-yellow-600 hover:to-red-600"
                                onClick={() => {
                                  setCurrentChallenge(challenge);
                                  setShowAcceptDialog(true);
                                }}
                              >
                                Accept Challenge
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                
                {filteredStatusUpdates.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-base font-medium mb-4">Challenge Updates</h3>
                  </div>
                )}
              </div>
            )}

            {/* Empty State for filtered content - only shown for non-soko and non-challenges tabs with no content */}
            {filteredStatusUpdates.length === 0 && contentType !== 'soko' && contentType !== 'challenges' && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
                  {contentType === 'video' ? (
                    <Video className="h-8 w-8 text-muted-foreground" />
                  ) : contentType === 'audio' ? (
                    <Mic className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-lg font-medium mb-2">No {contentType} content found</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  {contentType === 'video' ? 
                    "There are no video posts to display. Create a video post or check back later." :
                    contentType === 'audio' ? 
                    "There are no audio posts to display. Create an audio post or check back later." :
                    "There are no posts to display. Create a post or check back later."}
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setShowPostDialog(true)}
                >
                  <PenSquare className="h-4 w-4 mr-2" />
                  Create a Post
                </Button>
              </div>
            )}
            
            {/* Status Updates */}
            {filteredStatusUpdates.map((status, index) => (
              <div 
                key={status.id} 
                ref={index === filteredStatusUpdates.length - 1 ? lastElementRef : null}
              >
                <Card 
                  className="mobile-full-width overflow-hidden border shadow-sm rounded-xl hover:shadow-md transition-all duration-300 bg-card dark:bg-card/95 cursor-pointer"
                  onClick={() => handlePostClick(status.id)}
                >
                  <div className="flex">
                    {/* Reddit-style voting buttons */}
                    <div className="flex flex-col items-center bg-muted/20 dark:bg-muted/10 px-1 sm:px-2 py-3 rounded-l-xl">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 w-8 sm:h-7 sm:w-7 p-0 rounded-full hover:bg-muted transition-colors duration-200 touch-manipulation ${voteStatus[status.id] === 'upvoted' ? 'text-orange-500' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleUpvote(status.id); }}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <span className={`font-medium text-xs py-1 ${voteStatus[status.id] === 'upvoted' ? 'text-orange-500' : voteStatus[status.id] === 'downvoted' ? 'text-blue-500' : ''}`}>
                        {status.likes}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 w-8 sm:h-7 sm:w-7 p-0 rounded-full hover:bg-muted transition-colors duration-200 touch-manipulation ${voteStatus[status.id] === 'downvoted' ? 'text-blue-500' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleDownvote(status.id); }}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex-1 p-3 sm:p-4">
                      <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                      <Avatar className="h-8 w-8 border border-muted">
                        <AvatarImage src={status.userAvatar} alt={status.userName} />
                        <AvatarFallback className="bg-primary/10 text-primary">{status.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-sm">{status.userName}</h3>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(status.timestamp)}</p>
                      </div>
                    </div>
                    
                    <p className="mb-2 sm:mb-3 text-sm leading-relaxed break-words">{status.content}</p>
                    
                    {/* Media Content */}
                    {status.mediaType === 'image' && status.mediaUrl && (
                      <div className="rounded-xl overflow-hidden mb-4 bg-muted dark:bg-muted/30 h-72 flex items-center justify-center">
                        <div className="h-12 w-12 text-muted-foreground dark:text-muted-foreground/50 opacity-30 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                            <circle cx="9" cy="9" r="2"/>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                          </svg>
                        </div>
                        {/* In a real app, this would be an actual image */}
                        {/* <img src={status.mediaUrl} alt="Status media" className="w-full h-full object-cover" /> */}
                      </div>
                    )}
                    
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted/50">
                      <div className="flex items-center space-x-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1.5 rounded-md px-2 h-7 text-xs font-medium hover:bg-muted/50"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the card click
                            handlePostClick(status.id);
                          }}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {status.comments} Comments
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1.5 rounded-md px-2 h-7 text-xs font-medium hover:bg-muted/50"
                          onClick={() => handleCopyLink(status.id)}
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          Share
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1.5 rounded-md px-2 h-7 text-xs font-medium hover:bg-muted/50"
                          onClick={() => handleBookmark(status.id)}
                        >
                          <Bookmark className="h-3.5 w-3.5" fill={isBookmarked[status.id] ? 'currentColor' : 'none'} />
                          Save
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-full h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuItem className="text-xs cursor-pointer">
                            <Bookmark className="h-3.5 w-3.5 mr-2" />
                            Save Post
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs cursor-pointer">
                            <Link className="h-3.5 w-3.5 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs cursor-pointer">
                            <AlertCircle className="h-3.5 w-3.5 mr-2" />
                            Report Post
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-xs cursor-pointer text-red-500 focus:text-red-500"
                            onClick={() => {
                              // Remove post from UI
                              setStatusUpdates(prev => prev.filter(s => s.id !== status.id));
                              
                              // Show toast
                              toast({
                                title: 'Post deleted',
                                description: 'The post has been successfully deleted',
                              });
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
                
                {/* Comments section - shown when post is clicked */}
                {activePostId === status.id && (
                  <div className="mt-1 mb-4 border border-muted rounded-lg bg-card dark:bg-card/95 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4" />
                        Comments ({status.comments})
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 rounded-full"
                        onClick={() => setActivePostId(null)}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Comment input */}
                    <div className="mb-4">
                      <div className="flex items-start gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder-avatar.jpg" alt="Your Avatar" />
                          <AvatarFallback className="bg-primary/10 text-primary">YA</AvatarFallback>
                        </Avatar>
                        <Textarea 
                          placeholder="Add a comment..." 
                          className="min-h-[60px] text-xs flex-1"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          size="sm"
                          className="h-7 text-xs"
                          disabled={!commentText.trim()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComment(status.id, commentText);
                          }}
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                    
                    {/* Comments list */}
                    {isLoadingComments ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : status.commentsList && status.commentsList.length > 0 ? (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {status.commentsList.map(comment => (
                          <div key={comment.id} className="border-b border-muted/50 pb-3">
                            <div className="flex items-start gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                                <AvatarFallback className="bg-primary/10 text-primary">{comment.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold">{comment.userName}</span>
                                  <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.timestamp)}</span>
                                </div>
                                <p className="text-xs mt-1">{comment.content}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Button variant="ghost" size="sm" className="h-5 px-1 text-xs text-muted-foreground">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {comment.likes}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-5 px-1 text-xs text-muted-foreground">
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-xs">
                        No comments yet. Be the first to comment!
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
            )}
            
            {!hasMore && filteredStatusUpdates.length > 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm font-medium">
                No more content to load
              </div>
            )}
          </div>
        </div>
      </Card>
      </div>
      
      {/* Stream Playback Dialog */}
      <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto rounded-xl border-0 shadow-lg w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {selectedStream?.title || 'Stream'}
            </DialogTitle>
            <DialogDescription>
              {selectedStream?.isLive ? 'Live stream by ' : 'Recorded by '}
              <span className="font-medium">{selectedStream?.userName}</span>
              {!selectedStream?.isLive && selectedStream?.duration && (
                <span className="ml-2 text-xs text-muted-foreground">
                  Duration: {formatDuration(selectedStream.duration)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Stream Content */}
            <div className="rounded-lg overflow-hidden bg-black">
              {selectedStream?.mediaType === 'video' ? (
                <div className="aspect-video relative">
                  {selectedStream.isLive ? (
                    <div className="flex items-center justify-center h-full bg-black text-white">
                      <div className="text-center">
                        <div className="animate-pulse flex items-center justify-center mb-2">
                          <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                          <span className="text-sm font-medium">LIVE</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Connecting to live stream...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <video 
                      controls 
                      className="w-full h-full object-contain"
                      src={selectedStream.mediaUrl}
                      poster="/video-thumbnail.jpg"
                    />
                  )}
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-b from-primary/10 to-background p-6 flex flex-col items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Mic className="h-12 w-12 text-primary" />
                  </div>
                  
                  {selectedStream?.isLive ? (
                    <div className="text-center">
                      <div className="animate-pulse flex items-center justify-center mb-2">
                        <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                        <span className="text-sm font-medium">LIVE AUDIO</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Connecting to live audio stream...
                      </p>
                    </div>
                  ) : (
                    <audio 
                      controls 
                      className="w-full mt-4" 
                      src={selectedStream?.mediaUrl}
                    />
                  )}
                </div>
              )}
            </div>
            
            {/* Stream Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-muted">
                <AvatarImage src={selectedStream?.userAvatar} alt={selectedStream?.userName} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedStream?.userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h4 className="text-sm font-medium">{selectedStream?.userName}</h4>
                <p className="text-xs text-muted-foreground">
                  {selectedStream?.isLive ? 'Started ' : 'Recorded '}
                  {formatRelativeTime(selectedStream?.startTime || '')}
                </p>
              </div>
              
              {selectedStream?.isLive && (
                <Badge className="bg-red-500 text-white">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse mr-1"></span>
                  LIVE
                </Badge>
              )}
            </div>
            
            {/* Stream Description - in a real app, you would have this data */}
            <p className="text-sm text-muted-foreground">
              {selectedStream?.title}
              {selectedStream?.isLive ? ' - Watch this live stream about financial insights and market trends.' : ' - Replay this recording about financial insights and market trends.'}
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStreamDialog(false)}>
              Close
            </Button>
            {!selectedStream?.isLive && (
              <Button>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Post upgrade feature removed */}
    </div>
  )
}
