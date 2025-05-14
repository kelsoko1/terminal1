import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  Heart,
  Share2,
  TrendingUp,
  DollarSign,
  BarChart2,
  Reply,
  MoreHorizontal,
  Link as LinkIcon,
  Loader2,
  PenSquare,
  Globe,
  Users,
  Lock,
  X,
  Upload,
  FileText,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Circle,
  PlusCircle,
  Video,
  Mic,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { UserProfileDialog } from './UserProfileDialog';
import { AudioLiveStreamButton } from './audio';

// LiveStreamButton component for initiating live video streaming
const LiveStreamButton = ({ onStartStream }: { onStartStream: () => void }) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white border-none"
      onClick={onStartStream}
    >
      <Video className="h-4 w-4" />
      <span>Go Live</span>
    </Button>
  );
};

interface Comment {
  id: string;
  user: {
    id?: string;
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  attachments?: Attachment[];
}

interface TradePost {
  id: string;
  user: {
    id?: string;
    name: string;
    handle: string;
    avatar: string;
    isVerified: boolean;
    performance: {
      monthly: number;
      copyInvestors: number;
    };
  };
  content: {
    text: string;
    timestamp: string;
    trade?: {
      type: 'BUY' | 'SELL';
      symbol: string;
      price: number;
      change: number;
    };
    analysis?: {
      type: 'Technical' | 'Fundamental';
      summary: string;
    };
    attachments?: Attachment[];
  };
  engagement: {
    likes: number;
    comments: Comment[];
    shares: number;
    isLiked: boolean;
    bookmarked: boolean;
  };
}

interface Attachment {
  id: string;
  type: 'image' | 'document';
  url: string;
  name: string;
  size: number;
}

interface VideoStatus {
  id: string;
  user: {
    id?: string;
    name: string;
    handle: string;
    avatar: string;
  };
  videoUrl: string | MediaSource | Blob;
  thumbnail: string;
  duration: string;
  timestamp: string;
  views: number;
  isViewed: boolean;
  seenBy: Array<{
    id: string;
    name: string;
    avatar: string;
    timestamp: string;
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
  streamData?: {
    mediaStream?: MediaStream;
    startTime?: Date;
    streamKey?: string;
  };
}

const mockComments: Comment[] = [
  {
    id: 'c1',
    user: {
      name: 'James Mboya',
      handle: '@jamesmboya',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jamesmboya'
    },
    content: 'Great analysis! The volume pattern definitely supports your thesis.',
    timestamp: '1h ago',
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: 'c1r1',
        user: {
          name: 'Sarah Kimaro',
          handle: '@sarahkimaro',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarahkimaro'
        },
        content: 'Thanks James! Yes, the increasing volume is a strong confirmation signal.',
        timestamp: '45m ago',
        likes: 2,
        isLiked: false
      }
    ]
  }
];

const mockPosts: TradePost[] = [
  {
    id: '1',
    user: {
      name: 'John Makala',
      handle: '@johnmakala',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johnmakala',
      isVerified: true,
      performance: {
        monthly: 12.5,
        copyInvestors: 156,
      },
    },
    content: {
      text: 'Just opened a long position on CRDB. Strong fundamentals and technical breakout pattern forming. Q4 results expected to exceed market expectations. #DSE #Banking',
      timestamp: '2h ago',
      trade: {
        type: 'BUY',
        symbol: 'CRDB',
        price: 385,
        change: 2.5,
      },
    },
    engagement: {
      likes: 45,
      comments: [],
      shares: 8,
      isLiked: false,
      bookmarked: false,
    },
  },
  {
    id: '2',
    user: {
      name: 'Sarah Kimaro',
      handle: '@sarahkimaro',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarahkimaro',
      isVerified: true,
      performance: {
        monthly: 8.7,
        copyInvestors: 89,
      },
    },
    content: {
      text: 'Technical Analysis: TBL showing a clear double bottom pattern with increasing volume. Key resistance at 10,950. Looking for a breakout opportunity. #DSE #TechnicalAnalysis',
      timestamp: '4h ago',
      analysis: {
        type: 'Technical',
        summary: 'Double bottom pattern, increasing volume, resistance at 10,950',
      },
    },
    engagement: {
      likes: 32,
      comments: mockComments,
      shares: 5,
      isLiked: true,
      bookmarked: false,
    },
  },
];

const mockStatuses: VideoStatus[] = [
  {
    id: 'v1',
    user: {
      id: 'u1',
      name: 'John Makala',
      handle: '@johnmakala',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johnmakala'
    },
    videoUrl: 'https://player.vimeo.com/external/556012137.sd.mp4?s=1702723570892b45b4d50096248a158c9a80589f&profile_id=164&oauth2_token_id=57447761',
    thumbnail: 'https://i.vimeocdn.com/video/1274931080_1280x720.jpg',
    duration: '0:45',
    timestamp: '2h ago',
    views: 245,
    isViewed: false,
    seenBy: [
      {
        id: 'u1',
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe',
        timestamp: '1h ago'
      },
      {
        id: 'u2',
        name: 'Jane Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe',
        timestamp: '30m ago'
      }
    ],
    isLive: false,
    liveViewers: 0,
    liveComments: []
  },
  {
    id: 'v2',
    user: {
      id: 'u2',
      name: 'Sarah Kimaro',
      handle: '@sarahkimaro',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarahkimaro'
    },
    videoUrl: 'https://player.vimeo.com/external/556012137.sd.mp4?s=1702723570892b45b4d50096248a158c9a80589f&profile_id=164&oauth2_token_id=57447761',
    thumbnail: 'https://i.vimeocdn.com/video/1274931080_1280x720.jpg',
    duration: '1:20',
    timestamp: '4h ago',
    views: 567,
    isViewed: true,
    seenBy: [
      {
        id: 'u3',
        name: 'Bob Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bobsmith',
        timestamp: '2h ago'
      },
      {
        id: 'u4',
        name: 'Alice Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alicejohnson',
        timestamp: '1h ago'
      }
    ],
    isLive: false,
    liveViewers: 0,
    liveComments: []
  },
  {
    id: 'v3',
    user: {
      id: 'u3',
      name: 'James Mboya',
      handle: '@jamesmboya',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jamesmboya'
    },
    videoUrl: 'https://player.vimeo.com/external/556012137.sd.mp4?s=1702723570892b45b4d50096248a158c9a80589f&profile_id=164&oauth2_token_id=57447761',
    thumbnail: 'https://i.vimeocdn.com/video/1274931080_1280x720.jpg',
    duration: '0:30',
    timestamp: 'now',
    views: 0,
    isViewed: false,
    seenBy: [],
    isLive: true,
    liveViewers: 12,
    liveComments: [
      {
        id: 'c1',
        user: {
          id: 'u1',
          name: 'John Doe',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe'
        },
        content: 'Great analysis! Keep going!',
        timestamp: '1m ago'
      },
      {
        id: 'c2',
        user: {
          id: 'u2',
          name: 'Jane Doe',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe'
        },
        content: 'This is really helpful!',
        timestamp: '2m ago'
      }
    ]
  }
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatTimestamp = (timestamp: string) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return postDate.toLocaleDateString();
};

const CommentCard = ({ comment, level = 0, onLike, onAddReply }: { comment: Comment; level?: number; onLike: (isReply?: boolean, parentCommentId?: string) => void; onAddReply: (text: string) => void }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onAddReply(replyText);
      setIsReplying(false);
      setReplyText('');
      setSelectedFile(null);
    }
  };

  return (
    <>
      <div className={`flex items-start space-x-3 ${level > 0 ? 'ml-12 mt-3' : 'mt-4'}`}>
        <div 
          className="cursor-pointer"
          onClick={() => setShowUserProfile(true)}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.avatar} />
            <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span 
                className="font-semibold dark:text-white cursor-pointer"
                onClick={() => setShowUserProfile(true)}
              >
                {comment.user.name}
              </span>
              <span className="text-gray-500 dark:text-gray-400">{comment.user.handle}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(comment.timestamp)}</span>
          </div>
          <p className="mt-1 text-gray-800 dark:text-gray-200">{comment.content}</p>
          
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {comment.attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-gray-200 dark:bg-gray-700 rounded">
                  {attachment.type === 'image' ? (
                    <img src={attachment.url} alt={attachment.name} className="h-20 w-20 object-cover rounded" />
                  ) : (
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm">{attachment.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center mt-2 space-x-4 text-gray-500 dark:text-gray-400">
            <button
              className={`flex items-center space-x-1 ${comment.isLiked ? 'text-red-500' : ''}`}
              onClick={() => onLike(level > 0, comment.id)}
            >
              <Heart className="h-4 w-4" />
              <span className="text-xs">{comment.likes}</span>
            </button>
            <button
              className="flex items-center space-x-1"
              onClick={() => setIsReplying(!isReplying)}
            >
              <Reply className="h-4 w-4" />
              <span className="text-xs">Reply</span>
            </button>
          </div>
          
          {isReplying && (
            <div className="mt-3">
              <div className="flex items-start space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[60px] text-sm"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsReplying(false);
                        setReplyText('');
                      }}
                      className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitReply}>
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12">
          <button
            className="text-xs text-blue-500 mt-1 flex items-center"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
          
          {showReplies && (
            <div className="space-y-2">
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  level={level + 1}
                  onLike={onLike}
                  onAddReply={onAddReply}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <UserProfileDialog 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)} 
        userId={comment.user.id || ''}
        userName={comment.user.name}
      />
    </>
  );
};

interface VideoStatus {
  id: string;
  user: {
    id?: string;
    name: string;
    handle: string;
    avatar: string;
  };
  videoUrl: string | MediaSource | Blob;
  thumbnail: string;
  duration: string;
  timestamp: string;
  views: number;
  isViewed: boolean;
  seenBy: Array<{
    id: string;
    name: string;
    avatar: string;
    timestamp: string;
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
  streamData?: {
    mediaStream?: MediaStream;
    startTime?: Date;
    streamKey?: string;
  };
}

const VideoStatusCard = ({ status, onClose }: { status: VideoStatus; onClose?: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSeenBy, setShowSeenBy] = useState(false);
  const [showLiveComments, setShowLiveComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoSourceRef = useRef<string>('');
  const [liveViewerCount, setLiveViewerCount] = useState(status.liveViewers);

  useEffect(() => {
    if (status.videoUrl && videoRef.current) {
      if (typeof status.videoUrl === 'string') {
        videoSourceRef.current = status.videoUrl;
      } else if (status.videoUrl instanceof Blob) {
        videoSourceRef.current = URL.createObjectURL(status.videoUrl);
      } else if (status.videoUrl instanceof MediaSource) {
        const blob = new Blob([], { type: 'video/mp4' });
        videoSourceRef.current = URL.createObjectURL(blob);
      }
    }
  }, [status.videoUrl]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeenByClick = () => {
    setShowSeenBy(!showSeenBy);
  };

  const handleLiveCommentsClick = () => {
    setShowLiveComments(!showLiveComments);
  };

  const handleAddLiveComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: generateId(),
        user: {
          id: 'current-user',
          name: 'You',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser'
        },
        content: newComment.trim(),
        timestamp: new Date().toISOString()
      };
      
      // Update live comments
      const updatedStatus = { ...status, liveComments: [...status.liveComments, newCommentObj] };
      setNewComment('');
      
      // Simulate API call to update live comments
      console.log('Adding live comment:', newCommentObj);
    }
  };

  const handleFullScreenToggle = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleEndLiveStream = () => {
    if (status.streamData?.mediaStream) {
      // Stop all tracks in the stream
      status.streamData.mediaStream.getTracks().forEach(track => track.stop());
      
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Close Button for Modal View */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <X className="h-6 w-6" />
        </button>
      )}

      {/* Full Screen Overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="absolute inset-0">
            {status.isLive && status.streamData?.mediaStream ? (
              <video 
                ref={videoRef}
                className="w-full h-full object-cover"
                controls={false}
                autoPlay
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <video 
                ref={videoRef}
                className="w-full h-full object-cover"
                src={videoSourceRef.current}
                controls={false}
                loop
                muted
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          
          {status.isLive && (
            <div className="absolute top-4 right-4 bg-red-500/20 text-white px-4 py-2 rounded-full text-sm">
              LIVE
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                {status.isLive ? (
                  <>
                    <span className="text-red-500">Live</span>
                    <span className="text-xs">•</span>
                    <span>{liveViewerCount.toLocaleString()} watching</span>
                  </>
                ) : (
                  <>
                    <span>{status.duration}</span>
                    <span className="text-xs">•</span>
                    <span>{status.views.toLocaleString()} views</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {status.isLive && status.streamData?.mediaStream && (
                  <button 
                    onClick={handleEndLiveStream}
                    className="p-2 rounded-full bg-red-500 hover:bg-red-600"
                  >
                    <X className="h-6 w-6" />
                    <span className="sr-only">End Stream</span>
                  </button>
                )}
                <button 
                  onClick={handleFullScreenToggle}
                  className="p-2 rounded-full hover:bg-white/10"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {status.isLive && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <MessageSquare className="h-4 w-4" />
                  <span>{status.liveComments.length} comments</span>
                </div>
                <div className="space-y-2">
                  {status.liveComments.slice(-5).map((comment, index) => (
                    <div key={index} className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                        <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{comment.user.name}</p>
                        <p className="text-sm text-white/80">{comment.content}</p>
                        <p className="text-xs text-white/60">{formatTimestamp(comment.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser" />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a live comment..."
                      className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddLiveComment}
                    disabled={!newComment.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Normal View */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={status.user.avatar} alt={status.user.name} />
            <AvatarFallback>{status.user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{status.user.name}</h3>
            <p className="text-sm text-muted-foreground">{formatTimestamp(status.timestamp)}</p>
          </div>
        </div>

        <div 
          className="relative aspect-video rounded-lg overflow-hidden cursor-pointer"
          onClick={handleVideoClick}
        >
          {status.isLive && status.streamData?.mediaStream ? (
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              src={videoSourceRef.current}
              controls={false}
              loop
              muted
            >
              Your browser does not support the video tag.
            </video>
          )}
          
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              {status.isLive ? (
                <div className="animate-pulse">
                  <Circle className="h-10 w-10 text-red-500" />
                </div>
              ) : (
                <Play className="h-10 w-10 text-white" />
              )}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                {status.isLive ? (
                  <>
                    <span className="text-red-500">Live</span>
                    <span className="text-xs">•</span>
                    <span>{liveViewerCount.toLocaleString()} watching</span>
                  </>
                ) : (
                  <>
                    <span>{status.duration}</span>
                    <span className="text-xs">•</span>
                    <span>{status.views.toLocaleString()} views</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleFullScreenToggle}
                  className="p-2 rounded-full hover:bg-white/10"
                >
                  <span className="sr-only">View full screen</span>
                  <span className="text-white">{isFullScreen ? 'Exit' : 'View'} Full Screen</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {showLiveComments && status.isLive && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>Live Comments</span>
            </div>
            <div className="space-y-2">
              {status.liveComments.slice(-5).map((comment, index) => (
                <div key={index} className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                    <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{comment.user.name}</p>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                    <p className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser" />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a live comment..."
                  className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddLiveComment}
                disabled={!newComment.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        )}

        {showSeenBy && !status.isLive && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Seen by</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {status.seenBy.slice(0, 5).map((viewer, index) => (
                <Avatar 
                  key={index}
                  className="h-8 w-8"
                >
                  <AvatarImage src={viewer.avatar} alt={viewer.name} />
                  <AvatarFallback>{viewer.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {status.seenBy.length > 5 && (
                <span className="text-sm text-muted-foreground">
                  +{status.seenBy.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TradePostCard = ({ post, onLike, onComment, onLikeComment, onAddReply, onShare, onCopyLink, onShareToTwitter }: { post: TradePost; onLike: () => void; onComment: (text: string) => void; onLikeComment: (commentId: string, isReply?: boolean, parentCommentId?: string) => void; onAddReply: (commentId: string, text: string) => void; onShare: () => void; onCopyLink: () => void; onShareToTwitter: (text: string) => void }) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(commentText);
      setIsCommenting(false);
      setCommentText('');
    }
  };

  return (
    <Card className="p-4 mb-4 dark:bg-gray-800/50">
      <div className="flex items-start space-x-4">
        <div 
          className="cursor-pointer"
          onClick={() => setShowUserProfile(true)}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.user.avatar} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span 
                className="font-semibold dark:text-white cursor-pointer"
                onClick={() => setShowUserProfile(true)}
              >
                {post.user.name}
              </span>
              {post.user.isVerified && (
                <span className="text-blue-500">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </span>
              )}
              <span className="text-gray-500 dark:text-gray-400">{post.user.handle}</span>
              <span className="text-gray-500 dark:text-gray-400">·</span>
              <span className="text-gray-500 dark:text-gray-400">{formatTimestamp(post.content.timestamp)}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                <DropdownMenuItem className="dark:text-gray-300 dark:hover:bg-gray-700">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem className="dark:text-gray-300 dark:hover:bg-gray-700">
                  <Users className="h-4 w-4 mr-2" />
                  Copy trader
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-2 space-y-2">
            <p className="text-gray-900 dark:text-gray-100">{post.content.text}</p>

            {post.content.trade && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mt-2">
                <div className="flex items-center space-x-2">
                  <span className={post.content.trade.type === 'BUY' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {post.content.trade.type}
                  </span>
                  <span className="font-semibold dark:text-white">{post.content.trade.symbol}</span>
                  <span className="dark:text-gray-300">@ {post.content.trade.price.toFixed(2)}</span>
                  <span className={post.content.trade.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {post.content.trade.change >= 0 ? '+' : ''}
                    {post.content.trade.change}%
                  </span>
                </div>
              </div>
            )}

            {post.content.analysis && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mt-2">
                <div className="flex items-center space-x-2 mb-1">
                  <BarChart2 className="h-4 w-4 dark:text-gray-300" />
                  <span className="font-semibold dark:text-white">{post.content.analysis.type} Analysis</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{post.content.analysis.summary}</p>
              </div>
            )}
            
            {post.content.attachments && post.content.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {post.content.attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-gray-200 dark:bg-gray-700 rounded">
                    {attachment.type === 'image' ? (
                      <img src={attachment.url} alt={attachment.name} className="h-20 w-20 object-cover rounded" />
                    ) : (
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm">{attachment.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-6">
              <button 
                onClick={onLike}
                className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <Heart className={`h-5 w-5 ${post.engagement.isLiked ? 'fill-current text-red-500 dark:text-red-400' : ''}`} />
                <span className="text-xs">{post.engagement.likes}</span>
              </button>
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs">{post.engagement.comments.length}</span>
              </button>
              <Dialog>
                <DialogTrigger asChild>
                  <button 
                    className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="text-xs">{post.engagement.shares}</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="dark:bg-gray-900">
                  <DialogHeader>
                    <DialogTitle className="dark:text-gray-100">Share this post</DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                      Share this trading insight with your network
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="dark:border-gray-700 dark:text-gray-300"
                      onClick={() => {
                        onCopyLink();
                        onShare(); // Call onShare to increment the counter
                      }}
                    >
                      Copy Link
                    </Button>
                    <Button onClick={() => {
                      onShareToTwitter(post.content.text);
                      // onShare is called inside shareToTwitter function
                    }}>
                      Share to Twitter
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {showComments && (
            <div className="mt-4 border-t dark:border-gray-700 pt-4">
              {isCommenting ? (
                <div className="space-y-3">
                  <Textarea 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[80px] dark:bg-gray-800 dark:text-gray-100"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCommenting(false);
                        setCommentText('');
                      }}
                      className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitComment}>
                      Comment
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
                  onClick={() => setIsCommenting(true)}
                >
                  Write a comment...
                </Button>
              )}

              <div className="space-y-4 mt-4">
                {post.engagement.comments.map((comment) => (
                  <CommentCard 
                    key={comment.id} 
                    comment={comment}
                    level={0}
                    onLike={(isReply, parentCommentId) => onLikeComment(comment.id, isReply, parentCommentId)}
                    onAddReply={(text) => onAddReply(comment.id, text)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <UserProfileDialog 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)} 
        userId={post.user.id || ''}
        userName={post.user.name}
      />
    </Card>
  );
};

const fetchPosts = async (page: number, pageSize: number = 10): Promise<TradePost[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock posts
  return Array.from({ length: pageSize }, (_, i) => {
    const randomChange = Math.random() * 10 - 5;
    const change = Number(randomChange.toFixed(2));
    
    return {
      id: `${page}-${i}-${Date.now()}`,
      user: {
        name: `Trader ${page}-${i}`,
        handle: `@trader${page}${i}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=trader${page}${i}`,
        isVerified: Math.random() > 0.5,
        performance: {
          monthly: Math.random() * 20 - 10,
          copyInvestors: Math.floor(Math.random() * 200),
        },
      },
      content: {
        text: `This is a mock trade post ${page}-${i}. #trading #DSE`,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        trade: Math.random() > 0.5 ? {
          type: Math.random() > 0.5 ? 'BUY' : 'SELL' as const,
          symbol: ['CRDB', 'TBL', 'NMB', 'TCCL'][Math.floor(Math.random() * 4)],
          price: Math.floor(Math.random() * 1000) + 100,
          change: change,
        } : undefined,
      },
      engagement: {
        likes: Math.floor(Math.random() * 50),
        comments: [],
        shares: Math.floor(Math.random() * 20),
        isLiked: false,
        bookmarked: false,
      },
    };
  });
};

const SocialFeed = () => {
  const [posts, setPosts] = useState<TradePost[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [newPosts, setNewPosts] = useState<TradePost[]>([]);
  const [showNewPosts, setShowNewPosts] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [visibility, setVisibility] = useState<VisibilityType>('public');
  
  // Compose state
  const [postText, setPostText] = useState('');
  const [showPositionDetails, setShowPositionDetails] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [positionType, setPositionType] = useState<'BUY' | 'SELL'>('BUY');
  const [symbol, setSymbol] = useState('CRDB');
  const [price, setPrice] = useState('');
  const [analysisType, setAnalysisType] = useState<'Technical' | 'Fundamental'>('Technical');
  const [analysisText, setAnalysisText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [videoStatuses, setVideoStatuses] = useState<VideoStatus[]>([]);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<VideoStatus | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const liveStreamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const [showLiveStreamDialog, setShowLiveStreamDialog] = useState(false);
  const [liveStreamTitle, setLiveStreamTitle] = useState('');

  const startLiveStream = async () => {
    setShowLiveStreamDialog(true);
  };

  const handleStartLiveStream = async () => {
    try {
      // Request access to the user's camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      liveStreamRef.current = stream;
      setIsLiveStreaming(true);
      
      // Create a new live video status
      const newStatus: VideoStatus = {
        id: generateId(),
        user: {
          id: 'current-user',
          name: 'You',
          handle: '@you',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser'
        },
        videoUrl: '', // Will be populated with stream data
        thumbnail: '', // Will be generated from the stream
        duration: '00:00', // Live streams don't have a fixed duration
        timestamp: new Date().toISOString(),
        views: 0,
        isViewed: false,
        seenBy: [],
        isLive: true,
        liveViewers: 0,
        liveComments: [],
        streamData: {
          mediaStream: stream,
          startTime: new Date(),
          streamKey: generateId()
        }
      };
      
      // Add the new status to the list
      setVideoStatuses(prev => [newStatus, ...prev]);
      
      // Select the status to show it in full screen
      setSelectedStatus(newStatus);
      
      // Close the dialog
      setShowLiveStreamDialog(false);
      
      // Show a success toast
      toast({
        title: "Live stream started",
        description: "You are now live! Others can join your stream.",
      });
      
    } catch (error) {
      console.error('Error starting live stream:', error);
      toast({
        title: "Error",
        description: "Failed to start live stream. Please check your camera and microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopLiveStream = () => {
    if (liveStreamRef.current) {
      // Stop all tracks in the stream
      liveStreamRef.current.getTracks().forEach(track => track.stop());
      liveStreamRef.current = null;
      
      // Update the status of the live stream
      if (selectedStatus && selectedStatus.isLive) {
        const updatedStatus = { 
          ...selectedStatus, 
          isLive: false,
          duration: calculateStreamDuration(selectedStatus.streamData?.startTime)
        };
        
        setVideoStatuses(prev => 
          prev.map(status => status.id === selectedStatus.id ? updatedStatus : status)
        );
        
        setSelectedStatus(updatedStatus);
      }
      
      setIsLiveStreaming(false);
      
      toast({
        title: "Live stream ended",
        description: "Your live stream has ended.",
      });
    }
  };

  const calculateStreamDuration = (startTime?: Date): string => {
    if (!startTime) return '00:00';
    
    const duration = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCreatePost = async () => {
    if (!postText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newPost: TradePost = {
        id: generateId(),
        user: {
          name: 'Current User', // TODO: Replace with actual user data
          handle: '@currentuser',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser',
          isVerified: false,
          performance: {
            monthly: 0,
            copyInvestors: 0,
          },
        },
        content: {
          text: postText,
          timestamp: new Date().toISOString(),
          ...(showPositionDetails && {
            trade: {
              type: positionType,
              symbol,
              price: Number(price),
              change: 0, // This would be calculated based on current market price
            },
          }),
          ...(showAnalysis && {
            analysis: {
              type: analysisType,
              summary: analysisText,
            },
          }),
          attachments: attachments.length > 0 ? attachments : undefined,
        },
        engagement: {
          likes: 0,
          comments: [],
          shares: 0,
          isLiked: false,
          bookmarked: false,
        },
      };

      setPosts(prev => [newPost, ...prev]);
      
      // Reset form
      setPostText('');
      setShowPositionDetails(false);
      setShowAnalysis(false);
      setPositionType('BUY');
      setSymbol('CRDB');
      setPrice('');
      setAnalysisType('Technical');
      setAnalysisText('');
      setVisibility('public');
      setAttachments([]); // Clear attachments after posting
      
      // Show success toast
      toast({
        title: "Post created",
        description: "Your post has been published successfully",
      });
      
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateStatus = async () => {
    const videoInput = document.createElement('input');
    videoInput.type = 'file';
    videoInput.accept = 'video/*';
    videoInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        setIsUploading(true);
        try {
          // Simulate upload
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const newStatus: VideoStatus = {
            id: generateId(),
            user: {
              id: 'current-user',
              name: 'You',
              handle: '@you',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser'
            },
            videoUrl: URL.createObjectURL(file) as string, // Cast to string since we know it's a string URL
            thumbnail: URL.createObjectURL(await createVideoThumbnail(file)),
            duration: await getVideoDuration(file),
            timestamp: new Date().toISOString(),
            views: 0,
            isViewed: false,
            seenBy: [],
            isLive: true, // Always set to true for live streaming
            liveViewers: 0,
            liveComments: []
          };

          setVideoStatuses([newStatus, ...videoStatuses]);
          toast({
            title: "Status created",
            description: "Your live stream has been created successfully",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to create live stream",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      }
    };
    videoInput.click();
  };

  const handleStatusClick = (status: VideoStatus) => {
    setSelectedStatus(status);
  };

  const handleCloseStatus = () => {
    setSelectedStatus(null);
  };

  const createVideoThumbnail = async (videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/jpeg');
        resolve(thumbnail);
      };
      video.src = URL.createObjectURL(videoFile);
    });
  };

  const getVideoDuration = async (videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      video.src = URL.createObjectURL(videoFile);
    });
  };

  // Function to load more posts
  const loadMorePosts = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const newPosts = await fetchPosts(page);
      setPosts(prev => [...prev, ...newPosts]);
      setPage(prev => prev + 1);
      setHasMore(newPosts.length > 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    }, options);

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loadMorePosts, hasMore]);

  // Initial load
  useEffect(() => {
    loadMorePosts();
  }, []);

  // Poll for new posts
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const latestPosts = await fetchPosts(0, 3); // Fetch latest 3 posts
        const newUniquePosts = latestPosts.filter(
          newPost => !posts.some(existingPost => existingPost.id === newPost.id)
        );
        
        if (newUniquePosts.length > 0) {
          setNewPosts(prev => [...newUniquePosts, ...prev]);
        }
      } catch (error) {
        console.error('Error polling for new posts:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [posts]);

  const handleShowNewPosts = () => {
    setPosts(prev => [...newPosts, ...prev]);
    setNewPosts([]);
    setShowNewPosts(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLikePost = (postId: string) => {
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            engagement: {
              ...post.engagement,
              likes: post.engagement.isLiked ? post.engagement.likes - 1 : post.engagement.likes + 1,
              isLiked: !post.engagement.isLiked
            }
          };
        }
        return post;
      })
    );
    
    // Add toast notification for better user feedback
    toast({
      title: "Post liked",
      description: "Your like has been recorded",
      duration: 1500,
    });
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const newComment: Comment = {
      id: generateId(),
      user: {
        name: 'Current User', // TODO: Replace with actual user data
        handle: '@currentuser',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser'
      },
      content: commentText,
      timestamp: formatTimestamp(new Date().toISOString()),
      likes: 0,
      isLiked: false
    };

    setPosts(currentPosts =>
      currentPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            engagement: {
              ...post.engagement,
              comments: [newComment, ...post.engagement.comments]
            }
          };
        }
        return post;
      })
    );
  };

  const handleLikeComment = (postId: string, commentId: string, isReply: boolean = false, parentCommentId?: string) => {
    setPosts(currentPosts =>
      currentPosts.map(post => {
        if (post.id === postId) {
          const updateComment = (comment: Comment): Comment => {
            if (comment.id === (isReply ? parentCommentId : commentId)) {
              if (isReply && comment.replies) {
                return {
                  ...comment,
                  replies: comment.replies.map(reply =>
                    reply.id === commentId
                      ? {
                          ...reply,
                          likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                          isLiked: !reply.isLiked
                        }
                      : reply
                  )
                };
              }
              return {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !comment.isLiked
              };
            }
            return {
              ...comment,
              replies: comment.replies?.map(updateComment)
            };
          };

          return {
            ...post,
            engagement: {
              ...post.engagement,
              comments: post.engagement.comments.map(updateComment)
            }
          };
        }
        return post;
      })
    );
  };

  const handleAddReply = (postId: string, commentId: string, replyText: string) => {
    const newReply: Comment = {
      id: generateId(),
      user: {
        name: 'Current User', // TODO: Replace with actual user data
        handle: '@currentuser',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser'
      },
      content: replyText,
      timestamp: formatTimestamp(new Date().toISOString()),
      likes: 0,
      isLiked: false
    };

    setPosts(currentPosts =>
      currentPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            engagement: {
              ...post.engagement,
              comments: post.engagement.comments.map(comment =>
                comment.id === commentId
                  ? {
                      ...comment,
                      replies: [...(comment.replies || []), newReply]
                    }
                  : comment
              )
            }
          };
        }
        return post;
      })
    );
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const newAttachments: Attachment[] = await Promise.all(
        Array.from(files).map(async (file) => {
          const url = URL.createObjectURL(file);
          return {
            id: generateId(),
            type: file.type.startsWith('image/') ? 'image' : 'document',
            url,
            name: file.name,
            size: file.size,
          };
        })
      );

      setAttachments(prev => [...prev, ...newAttachments]);
      toast({
        title: "Files added",
        description: `Successfully added ${newAttachments.length} file(s)`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCharacterCount = () => {
    return postText.length;
  };

  const handleSharePost = (postId: string) => {
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            engagement: {
              ...post.engagement,
              shares: post.engagement.shares + 1
            }
          };
        }
        return post;
      })
    );
    
    toast({
      title: "Post shared",
      description: "This post has been shared successfully",
    });
  };

  const copyPostLink = (postId: string) => {
    // In a real app, this would be a proper URL to the post
    const postLink = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postLink);
    
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard",
    });
  };

  const shareToTwitter = (postId: string, postText: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const tweetText = encodeURIComponent(`${postText.substring(0, 100)}${postText.length > 100 ? '...' : ''}`);
    const tweetUrl = encodeURIComponent(`${window.location.origin}/post/${postId}`);
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;
    
    window.open(twitterShareUrl, '_blank');
    
    // Update the share count
    handleSharePost(postId);
  };

  return (
    <div className="relative min-h-screen">
      {/* Status Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Status</h2>
          <div className="flex gap-2">
            <AudioLiveStreamButton variant="outline" size="default" />
            <Button variant="outline" onClick={startLiveStream}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Go Live
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-800"
            onClick={startLiveStream}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <PlusCircle className="h-12 w-12" />
            </div>
          </div>

          {videoStatuses.map((status) => (
            <div 
              key={status.id}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
              onClick={() => handleStatusClick(status)}
            >
              <img 
                src={status.thumbnail} 
                alt={status.user.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={status.user.avatar} alt={status.user.name} />
                      <AvatarFallback>{status.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{status.user.name}</span>
                  </div>
                  {status.isLive && (
                    <div className="flex items-center gap-1">
                      <Circle className="h-3 w-3 text-red-500" />
                      <span className="text-xs">Live</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Viewer Modal */}
      {selectedStatus && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
            <VideoStatusCard 
              status={selectedStatus} 
              onClose={handleCloseStatus}
            />
          </div>
        </div>
      )}

      {/* Trading Feed */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Trading Feed</h2>
          <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300">
            <TrendingUp className="h-4 w-4 mr-2" />
            Popular
          </Button>
        </div>

        {newPosts.length > 0 && (
          <Button
            variant="outline"
            className="w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400"
            onClick={handleShowNewPosts}
          >
            Show {newPosts.length} new {newPosts.length === 1 ? 'post' : 'posts'}
          </Button>
        )}

        {posts.map((post) => (
          <TradePostCard 
            key={post.id} 
            post={post}
            onLike={() => handleLikePost(post.id)}
            onComment={(text) => handleAddComment(post.id, text)}
            onLikeComment={(commentId, isReply, parentCommentId) => 
              handleLikeComment(post.id, commentId, isReply, parentCommentId)}
            onAddReply={(commentId, text) => handleAddReply(post.id, commentId, text)}
            onShare={() => handleSharePost(post.id)}
            onCopyLink={() => copyPostLink(post.id)}
            onShareToTwitter={(text) => shareToTwitter(post.id, text)}
          />
        ))}

        <div ref={loadingRef} className="flex justify-center py-4">
          {loading && (
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more posts...</span>
            </div>
          )}
        </div>

        {!hasMore && posts.length > 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            No more posts to load
          </div>
        )}
      </div>

      {/* Floating Compose Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <PenSquare className="h-6 w-6" />
            <span className="sr-only">Compose Post</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between dark:text-white">
              <span>Compose Post</span>
              <div className="flex items-center space-x-2">
                <Select value={visibility} onValueChange={(value: VisibilityType) => setVisibility(value)}>
                  <SelectTrigger className="w-[140px]">
                    <div className="flex items-center gap-2">
                      {getVisibilityIcon(visibility)}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Everyone</SelectItem>
                    <SelectItem value="followers">Followers</SelectItem>
                    <SelectItem value="private">Only me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea 
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's happening in your trading journey?"
              className="min-h-[120px] text-base dark:bg-gray-800 dark:text-gray-100"
            />
            
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium dark:text-gray-200">Attachments</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachments([])}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove All
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="relative group rounded-lg overflow-hidden border dark:border-gray-700"
                    >
                      {attachment.type === 'image' ? (
                        <div className="aspect-square">
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="p-4 flex items-center space-x-2">
                          <FileText className="h-6 w-6 text-gray-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  className="flex-1 dark:border-gray-700 dark:text-gray-300"
                  onClick={() => setShowPositionDetails(!showPositionDetails)}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {showPositionDetails ? 'Remove Position' : 'Add Position Details'}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 dark:border-gray-700 dark:text-gray-300"
                  onClick={() => setShowAnalysis(!showAnalysis)}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  {showAnalysis ? 'Remove Analysis' : 'Add Analysis'}
                </Button>
              </div>
              
              {showPositionDetails && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium dark:text-gray-200">Position Details</h4>
                    <Select value={positionType} onValueChange={(value: 'BUY' | 'SELL') => setPositionType(value)}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">Buy</SelectItem>
                        <SelectItem value="SELL">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium dark:text-gray-300">Symbol</label>
                      <Select value={symbol} onValueChange={setSymbol}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CRDB">CRDB</SelectItem>
                          <SelectItem value="TBL">TBL</SelectItem>
                          <SelectItem value="NMB">NMB</SelectItem>
                          <SelectItem value="TCCL">TCCL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium dark:text-gray-300">Price</label>
                      <Input 
                        type="number" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Enter price" 
                        className="dark:bg-gray-800 dark:text-gray-100" 
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {showAnalysis && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium dark:text-gray-200">Analysis</h4>
                    <Select value={analysisType} onValueChange={(value: 'Technical' | 'Fundamental') => setAnalysisType(value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Fundamental">Fundamental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea 
                    value={analysisText}
                    onChange={(e) => setAnalysisText(e.target.value)}
                    placeholder="Add your analysis here..."
                    className="min-h-[100px] dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  multiple
                  onChange={handleFileSelect}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getCharacterCount()}/280
                </span>
              </div>
              <Button 
                onClick={handleCreatePost}
                disabled={!postText.trim() || isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            <Video className="h-6 w-6" />
            <span className="sr-only">Start Live Stream</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Start Live Stream</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Share your thoughts and insights with your followers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              value={liveStreamTitle}
              onChange={(e) => setLiveStreamTitle(e.target.value)}
              placeholder="Enter a title for your live stream"
              className="dark:bg-gray-800 dark:text-gray-100"
            />
            <Button 
              onClick={handleStartLiveStream}
              disabled={!liveStreamTitle.trim()}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Start Live Stream
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <UserProfileDialog 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)} 
        userId={''}
        userName={''}
      />
    </div>
  );
};

type VisibilityType = 'public' | 'followers' | 'private';

const getVisibilityIcon = (visibility: VisibilityType) => {
  switch (visibility) {
    case 'public': return <Globe className="h-4 w-4" />;
    case 'followers': return <Users className="h-4 w-4" />;
    case 'private': return <Lock className="h-4 w-4" />;
  }
};

const CreateStatusCard = () => {
  return (
    <div className="w-28 flex-shrink-0">
      <div className="w-28 h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
        <div className="text-center">
          <PlusCircle className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500" />
          <span className="block mt-2 text-xs text-gray-500 dark:text-gray-400">Create Status</span>
        </div>
      </div>
    </div>
  );
};

export { SocialFeed };