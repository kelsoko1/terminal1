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
  Activity
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

// Mock data
const mockStatusUpdates: StatusUpdate[] = [
  {
    id: 'status1',
    userId: 'user1',
    userName: 'Sarah Trader',
    userAvatar: '/avatars/sarah.png',
    content: 'Just closed a great position on CRDB! +15% return in just two weeks. The banking sector is showing strong momentum.',
    timestamp: '2025-04-12T07:15:00Z',
    likes: 42,
    comments: 7,
    shares: 3,
    hasLiked: false,
    mediaType: 'image',
    mediaUrl: '/images/chart-banking.jpg'
  },
  {
    id: 'status2',
    userId: 'user2',
    userName: 'Michael Investor',
    userAvatar: '/avatars/michael.png',
    content: 'Market analysis: The DSE index is showing strong support at current levels. I expect a breakout in the coming weeks, especially in the telecom sector.',
    timestamp: '2025-04-12T06:30:00Z',
    likes: 28,
    comments: 12,
    shares: 5,
    hasLiked: true,
    mediaType: 'none'
  },
  {
    id: 'status3',
    userId: 'user3',
    userName: 'Emma Analyst',
    userAvatar: '/avatars/emma.png',
    content: "Check out my latest technical analysis of the DSE market trends. I've identified some interesting patterns in the manufacturing sector.",
    timestamp: '2025-04-11T18:45:00Z',
    likes: 76,
    comments: 23,
    shares: 15,
    hasLiked: false,
    mediaType: 'video',
    mediaUrl: '/videos/market-analysis.mp4'
  },
  {
    id: 'status4',
    userId: 'user4',
    userName: 'David Portfolio',
    userAvatar: '/avatars/david.png',
    content: 'I\'ve been tracking the cement industry closely. With the government\'s infrastructure push, companies like Twiga Cement are positioned for growth.',
    timestamp: '2025-04-11T15:20:00Z',
    likes: 34,
    comments: 8,
    shares: 2,
    hasLiked: false,
    mediaType: 'none'
  },
];

const mockLiveStreams: LiveStream[] = [
  {
    id: 'live1',
    userId: 'user5',
    userName: 'John Expert',
    userAvatar: '/avatars/john.png',
    title: 'Live Market Opening Analysis',
    description: 'Discussing today\'s market opening and key stocks to watch',
    viewers: 128,
    duration: 1520, // in seconds
    isLive: true,
    type: 'audio'
  },
  {
    id: 'live2',
    userId: 'user6',
    userName: 'Lisa Mentor',
    userAvatar: '/avatars/lisa.png',
    title: 'IPO Breakdown: New Listings Analysis',
    description: 'Detailed analysis of upcoming IPOs on the DSE',
    viewers: 256,
    duration: 2430, // in seconds
    isLive: true,
    type: 'video'
  },
];

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

export function TikTokStyleFeed() {
  const [activeTab, setActiveTab] = useState('feeds')
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>(mockStatusUpdates)
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(mockLiveStreams)
  const [newStatusText, setNewStatusText] = useState('')
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [showAudioStream, setShowAudioStream] = useState(false)
  const [showVideoStream, setShowVideoStream] = useState(false)
  const [selectedLiveStream, setSelectedLiveStream] = useState<LiveStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [showStreamingDialog, setShowStreamingDialog] = useState(false)
  const { toast } = useToast()
  
  // Ref for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useRef<HTMLDivElement | null>(null)
  
  // Auto-update timer
  useEffect(() => {
    const updateInterval = setInterval(() => {
      // Simulate new content being added
      if (Math.random() > 0.7) { // 30% chance of new content
        const newStatus: StatusUpdate = {
          id: `status${Date.now()}`,
          userId: `user${Math.floor(Math.random() * 10) + 1}`,
          userName: `Trader ${Math.floor(Math.random() * 100) + 1}`,
          userAvatar: '/avatars/default.png',
          content: `New market update at ${new Date().toLocaleTimeString()}. Check out the latest trends!`,
          timestamp: new Date().toISOString(),
          likes: 0,
          comments: 0,
          shares: 0,
          hasLiked: false,
          mediaType: 'none' as const
        }
        
        setStatusUpdates(prev => [newStatus, ...prev])
        
        toast({
          title: "New content",
          description: "New updates are available in your feed.",
          duration: 3000
        })
      }
    }, 60000) // Update every minute
    
    return () => clearInterval(updateInterval)
  }, [])
  
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
  const loadMoreContent = () => {
    setIsLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate more mock content
      const newStatuses = Array(5).fill(0).map((_, index) => ({
        id: `status-more-${Date.now()}-${index}`,
        userId: `user${Math.floor(Math.random() * 10) + 1}`,
        userName: `Trader ${Math.floor(Math.random() * 100) + 1}`,
        userAvatar: '/avatars/default.png',
        content: `This is a loaded status update #${index + 1} with timestamp ${new Date().toLocaleTimeString()}`,
        timestamp: new Date(Date.now() - index * 60000).toISOString(),
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
        hasLiked: false,
        mediaType: 'none' as const
      }))
      
      setStatusUpdates(prev => [...prev, ...newStatuses])
      setIsLoading(false)
      
      // Simulate end of content after loading a lot
      if (statusUpdates.length > 30) {
        setHasMore(false)
      }
    }, 1000)
  }
  
  // Handle like status update
  const handleLike = (statusId: string) => {
    setStatusUpdates(prevUpdates =>
      prevUpdates.map(status =>
        status.id === statusId
          ? {
              ...status,
              likes: status.hasLiked ? status.likes - 1 : status.likes + 1,
              hasLiked: !status.hasLiked
            }
          : status
      )
    )
  }
  
  // Handle post new status
  const handlePostStatus = () => {
    if (!newStatusText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty status',
        description: 'Please enter some content for your status update.',
      })
      return
    }
    
    const newStatus: StatusUpdate = {
      id: `status${Date.now()}`,
      userId: 'currentUser',
      userName: 'You',
      userAvatar: '/avatars/default.png',
      content: newStatusText,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      hasLiked: false,
      mediaType: 'none' as const
    }
    
    setStatusUpdates([newStatus, ...statusUpdates])
    setNewStatusText('')
    setShowPostDialog(false)
    
    toast({
      title: 'Status posted',
      description: 'Your status update has been posted successfully.',
    })
  }
  
  // Handle start live audio
  const handleStartLiveAudio = () => {
    setShowAudioStream(true)
    setShowStreamingDialog(false)
  }
  
  // Handle start live video
  const handleStartLiveVideo = () => {
    toast({
      title: 'Coming soon',
      description: 'Live video streaming will be available in the next update.',
    })
    setShowStreamingDialog(false)
  }
  
  // Handle join live stream
  const handleJoinLiveStream = (stream: LiveStream) => {
    setSelectedLiveStream(stream)
    if (stream.type === 'audio') {
      setShowAudioStream(true)
    } else {
      setShowVideoStream(true)
    }
  }
  
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
            <h2 className="text-2xl font-semibold tracking-tight">DSE Social Feed</h2>
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
                        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 rounded-full px-3">
                          <MessageSquare className="h-4 w-4" />
                          {status.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 rounded-full px-3">
                          <Share2 className="h-4 w-4" />
                          {status.shares}
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
              placeholder="What's on your trading mind?" 
              className="min-h-[120px] resize-none border-muted/50 rounded-xl focus-visible:ring-primary" 
              value={newStatusText}
              onChange={(e) => setNewStatusText(e.target.value)}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 rounded-full">
                  <ImageIcon className="h-4 w-4" />
                  Photo
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 rounded-full">
                  <Video className="h-4 w-4" />
                  Video
                </Button>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 rounded-full">
                <Activity className="h-4 w-4" />
                Add Chart
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostDialog(false)} className="rounded-full">Cancel</Button>
            <Button onClick={handlePostStatus} className="rounded-full">Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Streaming Features Dialog */}
      <Dialog open={showStreamingDialog} onOpenChange={setShowStreamingDialog}>
        <DialogContent className="sm:max-w-[700px] rounded-xl border-0 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Streaming Options</DialogTitle>
            <DialogDescription>
              Manage your live and recorded streams
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Audio Streams Section */}
            <MediaStreamStatus />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStreamingDialog(false)} className="rounded-full">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Audio Live Stream Dialog */}
      {showAudioStream && (
        <Dialog open={showAudioStream} onOpenChange={setShowAudioStream}>
          <DialogContent className="sm:max-w-[600px]">
            <AudioLiveStream 
              isHost={!selectedLiveStream} 
              streamId={selectedLiveStream?.id} 
              onClose={() => setShowAudioStream(false)}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Video Live Stream Dialog - Placeholder for future implementation */}
      {showVideoStream && (
        <Dialog open={showVideoStream} onOpenChange={setShowVideoStream}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Video Live Stream</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center h-[400px] bg-muted rounded-md">
              <div className="text-center">
                <Video className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground">Video streaming coming soon</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowVideoStream(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
