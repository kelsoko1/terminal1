'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { AudioLiveStream } from './audio/AudioLiveStream'
import { MediaStreamStatus } from './MediaStreamStatus'
import {
  Mic,
  Video,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Users,
  Radio,
  Clock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Send,
  Image as ImageIcon,
  Camera,
  Bookmark,
  Repeat,
  Activity,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useMediaStream } from '@/hooks/use-media-stream'

// Types
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
  mediaType?: 'image' | 'video' | 'audio' | 'none'
  mediaUrl?: string
}

interface LiveStream {
  id: string
  userId: string
  userName: string
  userAvatar: string
  title: string
  description: string
  viewers: number
  duration: number
  isLive: boolean
  type: 'audio' | 'video'
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
const fetchStatusUpdates = async (page: number = 1, limit: number = 10): Promise<StatusUpdate[]> => {
  try {
    // In production, this would be a real API call
    const response = await fetch(`/api/status?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch status updates');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching status updates:', error);
    return [];
  }
};

const fetchLiveStreams = async (): Promise<LiveStream[]> => {
  try {
    // In production, this would be a real API call
    const response = await fetch('/api/livestreams');
    if (!response.ok) {
      throw new Error('Failed to fetch live streams');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching live streams:', error);
    return [];
  }
};

const likeStatus = async (statusId: string, liked: boolean): Promise<boolean> => {
  try {
    // In production, this would be a real API call
    const response = await fetch(`/api/status/${statusId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ liked }),
    });
    if (!response.ok) {
      throw new Error('Failed to like status');
    }
    return true;
  } catch (error) {
    console.error('Error liking status:', error);
    return false;
  }
};

const commentOnStatus = async (statusId: string, comment: string): Promise<boolean> => {
  try {
    // In production, this would be a real API call
    const response = await fetch(`/api/status/${statusId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });
    if (!response.ok) {
      throw new Error('Failed to comment on status');
    }
    return true;
  } catch (error) {
    console.error('Error commenting on status:', error);
    return false;
  }
};

const shareStatus = async (statusId: string): Promise<boolean> => {
  try {
    // In production, this would be a real API call
    const response = await fetch(`/api/status/${statusId}/share`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to share status');
    }
    return true;
  } catch (error) {
    console.error('Error sharing status:', error);
    return false;
  }
};

const createStatus = async (content: string, mediaType?: string, mediaUrl?: string): Promise<StatusUpdate | null> => {
  try {
    // In production, this would be a real API call
    const response = await fetch('/api/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, mediaType, mediaUrl }),
    });
    if (!response.ok) {
      throw new Error('Failed to create status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating status:', error);
    return null;
  }
};

export function TikTokStyleFeed() {
  const [activeTab, setActiveTab] = useState('feeds')
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([])
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [newStatusText, setNewStatusText] = useState('')
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [showAudioStream, setShowAudioStream] = useState(false)
  const [showVideoStream, setShowVideoStream] = useState(false)
  const [selectedLiveStream, setSelectedLiveStream] = useState<LiveStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [showStreamingDialog, setShowStreamingDialog] = useState(false)
  const [page, setPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mediaUpload, setMediaUpload] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'none'>('none')
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const { getMediaStream, stopMediaStream } = useMediaStream()
  const [streamError, setStreamError] = useState<string | null>(null)
  const [isStreamActive, setIsStreamActive] = useState(false)
  
  // Ref for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useRef<HTMLDivElement | null>(null)
  
  // Auto-update timer
  useEffect(() => {
    // In a production app, this would be replaced with WebSockets or server-sent events
    const updateInterval = setInterval(async () => {
      try {
        // Check for new content
        const latestUpdates = await fetchStatusUpdates(1, 3);
        
        // Check if there are any new updates not in our current list
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
    
    // Optimistic update
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
      
      // Revert on error
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
  
  // Handle comment on status
  const handleComment = async (statusId: string, comment: string) => {
    if (!comment.trim()) return;
    
    // Optimistic update
    setStatusUpdates(prev => prev.map(s => {
      if (s.id === statusId) {
        return {
          ...s,
          comments: s.comments + 1
        };
      }
      return s;
    }));
    
    try {
      await commentOnStatus(statusId, comment);
      
      toast({
        title: 'Comment posted',
        description: 'Your comment has been posted successfully.',
      });
    } catch (error) {
      console.error('Error commenting on status:', error);
      
      // Revert on error
      setStatusUpdates(prev => prev.map(s => {
        if (s.id === statusId) {
          return {
            ...s,
            comments: s.comments - 1
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
    // Optimistic update
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
      
      // Revert on error
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
  
  // Handle media upload
  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB',
      });
      return;
    }
    
    // Determine media type
    if (file.type.startsWith('image/')) {
      setMediaType('image');
    } else if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else if (file.type.startsWith('audio/')) {
      setMediaType('audio');
    } else {
      toast({
        variant: 'destructive',
        title: 'Unsupported file type',
        description: 'Please upload an image, video, or audio file',
      });
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setMediaUpload(file);
  };
  
  // Clear media upload
  const clearMediaUpload = () => {
    setMediaUpload(null);
    setMediaPreview(null);
    setMediaType('none');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle post new status
  const handlePostStatus = async () => {
    if (!newStatusText.trim() && mediaType === 'none') {
      toast({
        variant: 'destructive',
        title: 'Empty status',
        description: 'Please enter some content or attach media for your status update.',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload media if present
      let mediaUrl = '';
      if (mediaUpload) {
        // In production, this would upload to a server/CDN
        // For now, we'll create an object URL
        mediaUrl = URL.createObjectURL(mediaUpload);
      }
      
      const newStatus = await createStatus(newStatusText, mediaType, mediaUrl);
      
      if (newStatus) {
        setStatusUpdates([newStatus, ...statusUpdates]);
        setNewStatusText('');
        setShowPostDialog(false);
        clearMediaUpload();
        
        toast({
          title: 'Status posted',
          description: 'Your status update has been posted successfully.',
        });
      } else {
        throw new Error('Failed to create status');
      }
    } catch (error) {
      console.error('Error posting status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to post status. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle copy link to status
  const handleCopyLink = (statusId: string) => {
    // In a real app, this would be a proper URL to the status
    const statusLink = `${window.location.origin}/status/${statusId}`;
    navigator.clipboard.writeText(statusLink);
    
    toast({
      title: 'Link copied',
      description: 'Status link copied to clipboard',
      duration: 1500,
    });
    
    // Also increment share count
    handleShare(statusId);
  };
  
  // Handle share to Twitter
  const handleShareToTwitter = (statusId: string, statusText: string) => {
    const status = statusUpdates.find(s => s.id === statusId);
    if (!status) return;
    
    const tweetText = encodeURIComponent(`${statusText.substring(0, 100)}${statusText.length > 100 ? '...' : ''}`);
    const tweetUrl = encodeURIComponent(`${window.location.origin}/status/${statusId}`);
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;
    
    window.open(twitterShareUrl, '_blank');
    
    // Update the share count
    handleShare(statusId);
  };
  
  // Handle join live stream
  const handleJoinLiveStream = (stream: LiveStream) => {
    setSelectedLiveStream(stream);
    if (stream.type === 'audio') {
      setShowAudioStream(true);
    } else {
      setShowVideoStream(true);
    }
  };
  
  // Handle start live video
  const handleStartLiveVideo = async () => {
    try {
      setStreamError(null);
      setShowVideoStream(true);
      setShowStreamingDialog(false);
      
      const stream = await getMediaStream({ video: true, audio: true });
      
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
      }
    } catch (error) {
      console.error('Error starting video stream:', error);
      setStreamError('Failed to access camera. Please check your permissions and try again.');
      toast({
        variant: 'destructive',
        title: 'Stream Error',
        description: 'Failed to access camera. Please check your permissions and try again.',
      });
    }
  };
  
  // Handle start live audio
  const handleStartLiveAudio = () => {
    setShowAudioStream(true);
    setShowStreamingDialog(false);
  };
  
  // Handle end stream
  const handleEndStream = () => {
    if (isStreamActive) {
      stopMediaStream();
      setIsStreamActive(false);
    }
    setShowVideoStream(false);
    setShowAudioStream(false);
  };
  
  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [updates, streams] = await Promise.all([
          fetchStatusUpdates(),
          fetchLiveStreams()
        ]);
        
        setStatusUpdates(updates);
        setLiveStreams(streams);
        setPage(2); // Next page to load would be page 2
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load feed data. Please try refreshing the page.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Clean up media streams when component unmounts
  useEffect(() => {
    return () => {
      if (isStreamActive) {
        stopMediaStream();
      }
    };
  }, [isStreamActive, stopMediaStream]);
  
  // Filter content based on active tab
  const filteredContent = () => {
    switch (activeTab) {
      case 'feeds':
        return { statusUpdates, liveStreams: [] }
      case 'status':
        return { statusUpdates, liveStreams }
      default:
        return { statusUpdates, liveStreams: [] }
    }
  }
  
  const { statusUpdates: filteredStatusUpdates, liveStreams: filteredLiveStreams } = filteredContent()
  
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm bg-background/60 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight"></h2>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPostDialog(true)}
                className="rounded-full px-4 hover:bg-primary/10 border-none shadow-sm"
              >
                Post Update
              </Button>
              <Button 
                variant="default" 
                size="sm"
                className="rounded-full px-4 shadow-sm"
                onClick={() => setShowStreamingDialog(true)}
              >
                Streaming
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 rounded-full h-12 p-1 bg-muted/50">
              <TabsTrigger value="feeds" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Feeds
              </TabsTrigger>
              <TabsTrigger value="status" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Status
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="space-y-6">
            {/* Live Streams */}
            {filteredLiveStreams.length > 0 && (
              <div className="space-y-5">
                {filteredLiveStreams.map(stream => (
                  <Card key={stream.id} className="overflow-hidden border-0 shadow-md rounded-xl">
                    <div className="relative">
                      {/* Stream Preview */}
                      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-56 flex items-center justify-center">
                        {stream.type === 'audio' ? (
                          <div className="text-center">
                            <Radio className="h-16 w-16 text-white opacity-90 mb-2" />
                            <div className="flex justify-center space-x-2">
                              {[1, 2, 3, 4, 5].map(i => (
                                <div 
                                  key={i} 
                                  className="bg-white w-1 rounded-full animate-pulse" 
                                  style={{
                                    height: `${Math.random() * 40 + 10}px`,
                                    animationDuration: `${Math.random() * 1 + 0.5}s`
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Video className="h-16 w-16 text-white opacity-90" />
                        )}
                      </div>
                      
                      {/* Live Badge */}
                      <Badge 
                        variant="destructive" 
                        className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full font-medium"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        LIVE
                      </Badge>
                      
                      {/* Viewers Count */}
                      <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                        <Users className="h-3 w-3" />
                        {stream.viewers}
                      </div>
                      
                      {/* Duration */}
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                        <Clock className="h-3 w-3" />
                        {formatDuration(stream.duration)}
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="border-2 border-background h-10 w-10">
                            <AvatarImage src={stream.userAvatar} alt={stream.userName} />
                            <AvatarFallback className="bg-primary/10 text-primary">{stream.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-base">{stream.title}</h3>
                            <p className="text-sm text-muted-foreground">{stream.userName}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleJoinLiveStream(stream)}
                          className="rounded-full px-4 shadow-sm"
                        >
                          Join Stream
                        </Button>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{stream.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Status Updates */}
            {filteredStatusUpdates.map((status, index) => (
              <div 
                key={status.id} 
                ref={index === filteredStatusUpdates.length - 1 ? lastElementRef : null}
              >
                <Card className="overflow-hidden border-0 shadow-sm rounded-xl hover:shadow-md transition-shadow duration-200">
                  <div className="p-5">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-10 w-10 border border-muted">
                        <AvatarImage src={status.userAvatar} alt={status.userName} />
                        <AvatarFallback className="bg-primary/10 text-primary">{status.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-base">{status.userName}</h3>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(status.timestamp)}</p>
                      </div>
                    </div>
                    
                    <p className="mb-4 text-base leading-relaxed">{status.content}</p>
                    
                    {/* Media Content */}
                    {status.mediaType === 'image' && status.mediaUrl && (
                      <div className="rounded-xl overflow-hidden mb-4 bg-muted h-72 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground opacity-30" />
                        {/* In a real app, this would be an actual image */}
                        {/* <img src={status.mediaUrl} alt="Status media" className="w-full h-full object-cover" /> */}
                      </div>
                    )}
                    
                    {status.mediaType === 'video' && status.mediaUrl && (
                      <div className="rounded-xl overflow-hidden mb-4 bg-muted h-72 flex items-center justify-center relative">
                        <Video className="h-12 w-12 text-muted-foreground opacity-30" />
                        <Button variant="ghost" size="icon" className="absolute inset-0 m-auto rounded-full bg-black/40 hover:bg-black/60 h-16 w-16">
                          <Play className="h-8 w-8 text-white" />
                        </Button>
                        {/* In a real app, this would be an actual video player */}
                      </div>
                    )}
                    
                    {status.mediaType === 'audio' && status.mediaUrl && (
                      <div className="rounded-xl overflow-hidden mb-4 bg-muted/50 p-4 flex items-center space-x-3">
                        <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 hover:bg-primary/20 h-10 w-10">
                          <Play className="h-5 w-5 text-primary" />
                        </Button>
                        <div className="flex-1">
                          <div className="h-2 bg-primary/20 rounded-full">
                            <div className="h-2 bg-primary rounded-full w-1/3"></div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">1:24</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-muted/50">
                      <div className="flex items-center space-x-5">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`flex items-center gap-1.5 rounded-full px-3 ${status.hasLiked ? 'text-red-500 bg-red-500/10' : ''}`}
                          onClick={() => handleLike(status.id)}
                        >
                          <Heart className="h-4 w-4" fill={status.hasLiked ? 'currentColor' : 'none'} />
                          {status.likes}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1.5 rounded-full px-3">
                              <MessageSquare className="h-4 w-4" />
                              {status.comments}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px] rounded-xl border-0 shadow-lg">
                            <DialogHeader>
                              <DialogTitle className="text-xl">Add Comment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <Textarea 
                                placeholder="Write your comment..." 
                                className="min-h-[100px]"
                                id={`comment-${status.id}`}
                              />
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => document.getElementById(`dialog-close-${status.id}`)?.click()}
                              >
                                Cancel
                              </Button>
                              <Button onClick={() => {
                                const textarea = document.getElementById(`comment-${status.id}`) as HTMLTextAreaElement;
                                if (textarea && textarea.value) {
                                  handleComment(status.id, textarea.value);
                                  document.getElementById(`dialog-close-${status.id}`)?.click();
                                }
                              }}>
                                Post Comment
                              </Button>
                            </DialogFooter>
                            <button id={`dialog-close-${status.id}`} className="hidden" />
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1.5 rounded-full px-3">
                              <Share2 className="h-4 w-4" />
                              {status.shares}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[400px] rounded-xl border-0 shadow-lg">
                            <DialogHeader>
                              <DialogTitle className="text-xl">Share Post</DialogTitle>
                              <DialogDescription>
                                Share this post with your network
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => {
                                  handleCopyLink(status.id);
                                  document.getElementById(`share-close-${status.id}`)?.click();
                                }}
                              >
                                Copy Link
                              </Button>
                              <Button 
                                className="w-full"
                                onClick={() => {
                                  handleShareToTwitter(status.id, status.content);
                                  document.getElementById(`share-close-${status.id}`)?.click();
                                }}
                              >
                                Share to Twitter
                              </Button>
                            </div>
                            <button id={`share-close-${status.id}`} className="hidden" />
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`flex items-center gap-1.5 rounded-full px-3 ${isBookmarked[status.id] ? 'text-yellow-500 bg-yellow-500/10' : ''}`}
                          onClick={() => handleBookmark(status.id)}
                        >
                          <Bookmark className="h-4 w-4" fill={isBookmarked[status.id] ? 'currentColor' : 'none'} />
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
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
      
      {/* Post Status Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-xl border-0 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Create Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea 
              value={newStatusText}
              onChange={(e) => setNewStatusText(e.target.value)}
              placeholder="What's happening in the market today?"
              className="min-h-[120px] resize-none focus-visible:ring-primary"
            />
            
            {mediaPreview && (
              <div className="relative rounded-lg overflow-hidden bg-muted/50">
                {mediaType === 'image' && (
                  <img 
                    src={mediaPreview} 
                    alt="Upload preview" 
                    className="w-full max-h-[200px] object-contain"
                  />
                )}
                {mediaType === 'video' && (
                  <div className="aspect-video bg-black/10 flex items-center justify-center">
                    <video 
                      src={mediaPreview} 
                      controls 
                      className="max-h-[200px] max-w-full"
                    />
                  </div>
                )}
                {mediaType === 'audio' && (
                  <div className="p-4 flex items-center space-x-3">
                    <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 hover:bg-primary/20 h-10 w-10">
                      <Play className="h-5 w-5 text-primary" />
                    </Button>
                    <div className="flex-1">
                      <div className="h-2 bg-primary/20 rounded-full">
                        <div className="h-2 bg-primary rounded-full w-1/3"></div>
                      </div>
                    </div>
                    <audio src={mediaPreview} className="hidden" />
                  </div>
                )}
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={clearMediaUpload}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleMediaUpload}
                  accept="image/*,video/*,audio/*"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary/80"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-5 w-5 mr-1" />
                  Media
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPostDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handlePostStatus}
                  disabled={isSubmitting || (!newStatusText.trim() && mediaType === 'none')}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Posting...
                    </>
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Streaming Features Dialog */}
      <Dialog open={showStreamingDialog} onOpenChange={setShowStreamingDialog}>
        <DialogContent className="sm:max-w-[400px] rounded-xl border-0 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Go Live</DialogTitle>
            <DialogDescription>
              Share your insights with your followers in real-time
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-28 p-4"
              onClick={handleStartLiveAudio}
            >
              <Mic className="h-8 w-8 mb-2 text-primary" />
              <span>Audio Stream</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-28 p-4"
              onClick={handleStartLiveVideo}
            >
              <Video className="h-8 w-8 mb-2 text-primary" />
              <span>Video Stream</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Audio Live Stream Dialog */}
      {showAudioStream && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-background rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/avatars/default.png" alt="You" />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">Your Live Audio Stream</h3>
                    <p className="text-sm text-muted-foreground">Broadcasting live to your followers</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full"
                  onClick={() => setShowAudioStream(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="bg-muted/50 rounded-xl p-8 flex flex-col items-center justify-center">
                <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Mic className="h-12 w-12 text-primary" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-pulse"></span>
                </div>
                
                <div className="w-full max-w-sm">
                  <div className="flex justify-center space-x-2 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                      <div 
                        key={i} 
                        className="bg-primary w-1 rounded-full animate-pulse" 
                        style={{
                          height: `${Math.random() * 40 + 10}px`,
                          animationDuration: `${Math.random() * 1 + 0.5}s`
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Live
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {Math.floor(Math.random() * 100) + 1} listeners
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      00:00:00
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <Button 
                  variant="destructive" 
                  className="rounded-full px-6"
                  onClick={() => setShowAudioStream(false)}
                >
                  End Stream
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Video Stream Modal */}
      {showVideoStream && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-background rounded-xl overflow-hidden">
            {streamError ? (
              <div className="aspect-video bg-black flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                  <p className="text-lg font-medium">Stream Error</p>
                  <p className="text-sm opacity-70 mt-2">{streamError}</p>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-black flex items-center justify-center">
                {isStreamActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-white">
                    <Loader2 className="h-16 w-16 mx-auto mb-4 opacity-50 animate-spin" />
                    <p className="text-lg font-medium">Starting video stream...</p>
                    <p className="text-sm opacity-70">Please wait while we set up your camera</p>
                  </div>
                )}
              </div>
            )}
            <div className="p-4 flex items-center justify-between bg-background/90 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="flex items-center gap-1 bg-red-500/10 text-red-500 border-red-500/20">
                  <Activity className="h-3 w-3" />
                  Live
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {Math.floor(Math.random() * 100) + 1} viewers
                </Badge>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleEndStream}
              >
                End Stream
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
