'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DSESettings } from '@/components/account/DSESettings'
import { AccountSubscription } from '@/components/subscription/AccountSubscription'
import { AccountAds } from '@/components/account/AccountAds'
import { InvestorProfile } from '@/components/account/InvestorProfile'
import { 
  MessageSquare, 
  Users, 
  Camera, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Edit, 
  AtSign, 
  X, 
  Heart, 
  MessageCircle, 
  Repeat, 
  Share, 
  Bookmark,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

// Define post type
interface Post {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  images?: string[];
}

// Define message type
interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  isMine: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

// Define chat messages record type
interface ChatMessagesRecord {
  [key: string]: ChatMessage[];
}

export default function AccountPage() {
  const [notifications, setNotifications] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activePostsTab, setActivePostsTab] = useState<'posts' | 'likes'>('posts')
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeSettingsTab, setActiveSettingsTab] = useState<'security' | 'preferences' | 'dse' | 'investor'>('security')
  const [activeSubscriptionTab, setActiveSubscriptionTab] = useState<'subscription' | 'subscription2'>('subscription')

  // Sample user posts
  const [userPosts, setUserPosts] = useState<Post[]>([
    {
      id: '1',
      content: 'Just analyzed the latest market trends. Tech stocks showing strong momentum despite broader market volatility. #investing #stockmarket',
      timestamp: '2h ago',
      likes: 42,
      comments: 7,
      shares: 5,
      isLiked: false,
      isBookmarked: true,
      author: {
        name: 'John Doe',
        username: 'johndoe'
      }
    },
    {
      id: '2',
      content: 'Attended a fascinating webinar on sustainable investing strategies. The future of finance is definitely green! 🌱 #ESG #sustainablefinance',
      timestamp: '1d ago',
      likes: 76,
      comments: 12,
      shares: 15,
      isLiked: false,
      isBookmarked: false,
      author: {
        name: 'John Doe',
        username: 'johndoe'
      },
      images: ['/placeholder-chart.jpg']
    },
    {
      id: '3',
      content: 'My portfolio performance this quarter exceeded expectations. Diversification strategy paying off! 📈 #investing #portfoliomanagement',
      timestamp: '3d ago',
      likes: 128,
      comments: 23,
      shares: 31,
      isLiked: false,
      isBookmarked: false,
      author: {
        name: 'John Doe',
        username: 'johndoe'
      }
    }
  ])

  // Sample liked posts
  const [likedPosts, setLikedPosts] = useState<Post[]>([
    {
      id: '4',
      content: 'Breaking: Fed announces new interest rate policy. Markets expected to react strongly tomorrow. #finance #federalreserve',
      timestamp: '5h ago',
      likes: 215,
      comments: 43,
      shares: 87,
      isLiked: true,
      isBookmarked: false,
      author: {
        name: 'Financial Times',
        username: 'financialtimes'
      }
    },
    {
      id: '5',
      content: 'New research suggests ESG investments outperform traditional portfolios over 10-year horizons. Sustainability isn’t just good for the planet—it’s good for your returns too.',
      timestamp: '2d ago',
      likes: 189,
      comments: 32,
      shares: 56,
      isLiked: true,
      isBookmarked: true,
      author: {
        name: 'Morgan Stanley',
        username: 'morganstanley'
      }
    }
  ])

  // Sample contacts/chats for WhatsApp-like UI
  const [contacts, setContacts] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '/placeholder-avatar-1.jpg',
      status: 'online',
      lastMessage: 'What do you think about the latest market trends?',
      lastMessageTime: '10:30 AM',
      unread: 2
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: '/placeholder-avatar-2.jpg',
      status: 'offline',
      lastMessage: 'I just bought some shares of AAPL',
      lastMessageTime: 'Yesterday',
      unread: 0
    },
    {
      id: '3',
      name: 'Emma Williams',
      avatar: '/placeholder-avatar-3.jpg',
      status: 'online',
      lastMessage: 'Did you see the quarterly report?',
      lastMessageTime: 'Yesterday',
      unread: 3
    },
    {
      id: '4',
      name: 'Trading Group',
      avatar: '/placeholder-group.jpg',
      status: 'group',
      lastMessage: 'Emma: Let\'s discuss the new trading strategy',
      lastMessageTime: 'Monday',
      unread: 0,
      participants: ['You', 'Emma Williams', 'Michael Chen', 'David Lee', '+2 more']
    }
  ])

  // Sample messages for selected chat
  const [chatMessages, setChatMessages] = useState<ChatMessagesRecord>({
    '1': [
      { id: '1-1', sender: 'Sarah Johnson', content: 'Hey, how are your investments doing?', time: '10:15 AM', isMine: false },
      { id: '1-2', sender: 'me', content: 'Pretty good! My tech stocks are up 15% this quarter.', time: '10:20 AM', isMine: true },
      { id: '1-3', sender: 'Sarah Johnson', content: 'That\'s impressive! Any specific recommendations?', time: '10:25 AM', isMine: false },
      { id: '1-4', sender: 'Sarah Johnson', content: 'What do you think about the latest market trends?', time: '10:30 AM', isMine: false }
    ],
    '2': [
      { id: '2-1', sender: 'Michael Chen', content: 'Did you see the news about Tesla?', time: 'Yesterday', isMine: false },
      { id: '2-2', sender: 'me', content: 'Yes, their new battery technology looks promising.', time: 'Yesterday', isMine: true },
      { id: '2-3', sender: 'Michael Chen', content: 'I just bought some shares of AAPL', time: 'Yesterday', isMine: false }
    ],
    '3': [
      { id: '3-1', sender: 'Emma Williams', content: 'Hi there! How\'s your trading going?', time: 'Yesterday', isMine: false },
      { id: '3-2', sender: 'me', content: 'It\'s been a volatile week, but I\'m managing.', time: 'Yesterday', isMine: true },
      { id: '3-3', sender: 'Emma Williams', content: 'Same here. The market is unpredictable lately.', time: 'Yesterday', isMine: false },
      { id: '3-4', sender: 'Emma Williams', content: 'Did you see the quarterly report?', time: 'Yesterday', isMine: false }
    ],
    '4': [
      { id: '4-1', sender: 'David Lee', content: 'Welcome everyone to our trading group!', time: 'Monday', isMine: false },
      { id: '4-2', sender: 'Michael Chen', content: 'Thanks for setting this up, David.', time: 'Monday', isMine: false },
      { id: '4-3', sender: 'me', content: 'Looking forward to sharing insights with everyone.', time: 'Monday', isMine: true },
      { id: '4-4', sender: 'Emma Williams', content: 'Let\'s discuss the new trading strategy', time: 'Monday', isMine: false }
    ]
  })

  // Profile data
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Trader and investor passionate about financial markets. Focused on long-term growth strategies and sustainable investments.',
    location: 'New York, NY',
    website: 'johndoe.com',
    joinDate: 'January 2023',
    following: 245,
    followers: 1024
  })

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (selectedChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat, chatMessages]);

  // Load conversations from API
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoadingContacts(true);
        setError(null);
        
        const response = await fetch('/api/messages/conversations');
        
        if (!response.ok) {
          throw new Error('Failed to load conversations');
        }
        
        const data = await response.json();
        
        // Transform API response to match our UI format
        const formattedContacts = data.map((conv: any) => ({
          id: conv.otherUser.id,
          name: conv.otherUser.name,
          avatar: conv.otherUser.image || '/placeholder-avatar.jpg',
          status: 'offline', // We could enhance this with online status in the future
          lastMessage: conv.lastMessage.content,
          lastMessageTime: formatMessageTime(new Date(conv.lastMessage.timestamp)),
          unread: conv.unreadCount
        }));
        
        setContacts(formattedContacts);
        setIsLoadingContacts(false);
      } catch (err) {
        console.error('Error loading conversations:', err);
        setError('Failed to load conversations. Please try again later.');
        setIsLoadingContacts(false);
      }
    };
    
    loadConversations();
  }, []);
  
  // Helper function to format message timestamps
  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      const loadMessages = async () => {
        try {
          setIsLoadingMessages(true);
          setError(null);
          
          const response = await fetch(`/api/messages/conversation?otherUserId=${selectedChat}`);
          
          if (!response.ok) {
            throw new Error('Failed to load messages');
          }
          
          const data = await response.json();
          
          // Transform API response to match our UI format
          const formattedMessages = data.map((msg: any) => ({
            id: msg.id,
            sender: msg.senderId === selectedChat ? contacts.find(c => c.id === selectedChat)?.name || 'User' : 'me',
            content: msg.content,
            time: formatMessageTime(new Date(msg.createdAt)),
            isMine: msg.senderId !== selectedChat,
            status: msg.read ? 'read' : 'delivered'
          }));
          
          setChatMessages({...chatMessages, [selectedChat]: formattedMessages});
          setIsLoadingMessages(false);
          
          // Mark messages as read in UI
          setContacts(contacts.map(contact => 
            contact.id === selectedChat 
              ? {...contact, unread: 0}
              : contact
          ));
        } catch (err) {
          console.error('Error loading messages:', err);
          setError('Failed to load messages. Please try again later.');
          setIsLoadingMessages(false);
        }
      };
      
      loadMessages();
    }
  }, [selectedChat, contacts]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the profile data to your backend
    setIsEditDialogOpen(false)
    // Show a success notification
  }

  const handleLikePost = (postId: string, postType: 'posts' | 'likes') => {
    if (postType === 'posts') {
      setUserPosts(userPosts.map(post => 
        post.id === postId 
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } 
          : post
      ))
    } else {
      setLikedPosts(likedPosts.map(post => 
        post.id === postId 
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } 
          : post
      ))
    }
  }

  const handleBookmarkPost = (postId: string, postType: 'posts' | 'likes') => {
    if (postType === 'posts') {
      setUserPosts(userPosts.map(post => 
        post.id === postId 
          ? { ...post, isBookmarked: !post.isBookmarked } 
          : post
      ))
    } else {
      setLikedPosts(likedPosts.map(post => 
        post.id === postId 
          ? { ...post, isBookmarked: !post.isBookmarked } 
          : post
      ))
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;
    
    const tempId = `temp-${Date.now()}`;
    const newMessage: ChatMessage = {
      id: tempId,
      sender: 'me',
      content: messageInput,
      time: 'Just now',
      isMine: true,
      status: 'sending'
    };
    
    // Optimistically update UI
    setChatMessages({
      ...chatMessages,
      [selectedChat]: [...(chatMessages[selectedChat] || []), newMessage]
    });
    
    // Update last message in contacts list
    setContacts(contacts.map(contact => 
      contact.id === selectedChat 
        ? {...contact, lastMessage: messageInput, lastMessageTime: 'Just now', unread: 0}
        : contact
    ));
    
    setMessageInput('');
    
    try {
      // Send message to API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          receiverId: selectedChat, 
          content: messageInput 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const sentMessage = await response.json();
      
      // Update message status to sent with actual message ID from server
      setChatMessages(prev => ({
        ...prev,
        [selectedChat]: prev[selectedChat].map((msg: ChatMessage) => 
          msg.id === tempId 
            ? {
                ...msg, 
                id: sentMessage.id,
                status: 'sent',
                time: formatMessageTime(new Date(sentMessage.createdAt))
              } 
            : msg
        )
      }));
      
      // Simulate message being delivered after a delay
      setTimeout(() => {
        setChatMessages(prev => ({
          ...prev,
          [selectedChat]: prev[selectedChat].map((msg: ChatMessage) => 
            msg.id === sentMessage.id 
              ? {...msg, status: 'delivered'} 
              : msg
          )
        }));
      }, 1000);
      
      // Simulate message being read after a delay (in a real app, this would be triggered by the recipient)
      setTimeout(() => {
        setChatMessages(prev => ({
          ...prev,
          [selectedChat]: prev[selectedChat].map((msg: ChatMessage) => 
            msg.id === sentMessage.id 
              ? {...msg, status: 'read'} 
              : msg
          )
        }));
      }, 2000);
      
    } catch (err) {
      console.error('Error sending message:', err);
      // Handle error
      setChatMessages(prev => ({
        ...prev,
        [selectedChat]: prev[selectedChat].map((msg: ChatMessage) => 
          msg.id === tempId 
            ? {...msg, status: 'failed'} 
            : msg
        )
      }));
      
      setError('Failed to send message. Please try again.');
    }
  };

  // Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  // Simulate typing indicator
  const handleTyping = () => {
    setIsTyping(true);
    // Clear typing indicator after 2 seconds of inactivity
    const timeout = setTimeout(() => setIsTyping(false), 2000);
    return () => clearTimeout(timeout);
  };

  // Handle retry for failed messages
  const handleRetryMessage = async (messageId: string) => {
    if (!selectedChat) return;
    
    // Find the failed message
    const failedMessage = chatMessages[selectedChat]?.find(msg => msg.id === messageId);
    if (!failedMessage) return;
    
    // Update status to sending
    setChatMessages(prev => ({
      ...prev,
      [selectedChat]: prev[selectedChat].map((msg: ChatMessage) => 
        msg.id === messageId 
          ? {...msg, status: 'sending'} 
          : msg
      )
    }));
    
    try {
      // Retry sending the message
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          receiverId: selectedChat, 
          content: failedMessage.content 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const sentMessage = await response.json();
      
      // Update message with new ID and status
      setChatMessages(prev => ({
        ...prev,
        [selectedChat]: prev[selectedChat].map((msg: ChatMessage) => 
          msg.id === messageId 
            ? {
                ...msg, 
                id: sentMessage.id,
                status: 'sent',
                time: formatMessageTime(new Date(sentMessage.createdAt))
              } 
            : msg
        )
      }));
      
      // Simulate message being delivered after a delay
      setTimeout(() => {
        setChatMessages(prev => ({
          ...prev,
          [selectedChat]: prev[selectedChat].map((msg: ChatMessage) => 
            msg.id === sentMessage.id 
              ? {...msg, status: 'delivered'} 
              : msg
          )
        }));
      }, 1000);
    } catch (err) {
      console.error('Error retrying message:', err);
      // Set back to failed status
      setChatMessages(prev => ({
        ...prev,
        [selectedChat]: prev[selectedChat].map((msg: ChatMessage) => 
          msg.id === messageId 
            ? {...msg, status: 'failed'} 
            : msg
        )
      }));
      
      setError('Failed to send message. Please try again.');
    }
  };

  // Component for rendering a single post
  const PostCard = ({ post, postType }: { post: Post, postType: 'posts' | 'likes' }) => (
    <div className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.author.avatar || "/placeholder-avatar.jpg"} alt={post.author.name} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">{post.author.name}</span>
              <span className="text-gray-500 ml-1">@{post.author.username}</span>
              <span className="text-gray-500 mx-1">·</span>
              <span className="text-gray-500">{post.timestamp}</span>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
          
          <p className="mt-1 text-gray-800">{post.content}</p>
          
          {post.images && post.images.length > 0 && (
            <div className="mt-3 rounded-xl overflow-hidden">
              <img 
                src={post.images[0]} 
                alt="Post attachment" 
                className="w-full h-auto object-cover"
                style={{ maxHeight: '300px' }}
              />
            </div>
          )}
          
          <div className="flex justify-between mt-3 text-gray-500">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full flex items-center space-x-1 text-gray-500 hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full flex items-center space-x-1 text-gray-500 hover:text-green-500"
            >
              <Repeat className="h-4 w-4" />
              <span>{post.shares}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-full flex items-center space-x-1 ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
              onClick={() => handleLikePost(post.id, postType)}
            >
              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-full flex items-center space-x-1 ${post.isBookmarked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
              onClick={() => handleBookmarkPost(post.id, postType)}
            >
              <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full flex items-center space-x-1 text-gray-500 hover:text-blue-500"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-0 overflow-hidden">
            {/* Profile Banner */}
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
              <Button variant="ghost" className="absolute bottom-2 right-2 bg-black/50 text-white hover:bg-black/70" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Change Banner
              </Button>
            </div>
            
            {/* Profile Picture and Edit Button */}
            <div className="relative px-6">
              <div className="absolute -top-16 left-6 border-4 border-white rounded-full bg-white">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={profileData.name} />
                  <AvatarFallback className="text-3xl">{profileData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-black/50 text-white hover:bg-black/70">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex justify-end pt-4 pb-2">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile information here.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveProfile} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                            <AtSign className="h-4 w-4" />
                          </span>
                          <Input 
                            id="username" 
                            className="rounded-l-none" 
                            value={profileData.username}
                            onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio" 
                          value={profileData.bio}
                          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                          placeholder="Tell us about yourself"
                          className="resize-none"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input 
                            id="location" 
                            value={profileData.location}
                            onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input 
                            id="website" 
                            value={profileData.website}
                            onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="px-6 pt-16 pb-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{profileData.name}</h2>
                <p className="text-gray-500 flex items-center">
                  <AtSign className="h-4 w-4 mr-1" />
                  {profileData.username}
                </p>
              </div>
              
              <p className="text-gray-700">{profileData.bio}</p>
              
              <div className="flex flex-wrap gap-y-2">
                {profileData.location && (
                  <div className="flex items-center text-gray-500 mr-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{profileData.location}</span>
                  </div>
                )}
                {profileData.website && (
                  <div className="flex items-center text-blue-500 mr-4">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    <a href={`https://${profileData.website}`} target="_blank" rel="noopener noreferrer">
                      {profileData.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Joined {profileData.joinDate}</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex items-center">
                  <span className="font-bold mr-1">{profileData.following}</span>
                  <span className="text-gray-500">Following</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold mr-1">{profileData.followers}</span>
                  <span className="text-gray-500">Followers</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Trader</Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Investor</Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">Financial Analyst</Badge>
              </div>
            </div>
            
            {/* Posts Section */}
            <div className="border-t border-gray-200">
              <div className="flex border-b">
                <button 
                  className={`flex-1 py-3 font-medium text-center ${activePostsTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                  onClick={() => setActivePostsTab('posts')}
                >
                  Posts
                </button>
                <button 
                  className={`flex-1 py-3 font-medium text-center ${activePostsTab === 'likes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                  onClick={() => setActivePostsTab('likes')}
                >
                  Likes
                </button>
              </div>
              
              <div className="divide-y divide-gray-200">
                {activePostsTab === 'posts' ? (
                  userPosts.length > 0 ? (
                    userPosts.map(post => (
                      <PostCard key={post.id} post={post} postType="posts" />
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <p>No posts yet</p>
                    </div>
                  )
                ) : (
                  likedPosts.length > 0 ? (
                    likedPosts.map(post => (
                      <PostCard key={post.id} post={post} postType="likes" />
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <p>No liked posts yet</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card className="p-0 overflow-hidden border border-border">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 relative" role="alert">
                <span className="block sm:inline">{error}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setError(null)}>
                  <X className="h-4 w-4" />
                </span>
              </div>
            )}
            <div className="flex h-[600px]">
              {/* Contacts/Chats List */}
              <div className="w-1/3 border-r border-border flex flex-col">
                <div className="p-3 border-b border-border bg-secondary">
                  <div className="relative">
                    <Input 
                      placeholder="Search contacts or messages" 
                      className="pl-8 bg-background border-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    {searchQuery && (
                      <button 
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {isLoadingContacts ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredContacts.length > 0 ? (
                    filteredContacts.map(contact => (
                      <div 
                        key={contact.id}
                        className={`flex items-center p-3 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors ${selectedChat === contact.id ? 'bg-secondary' : ''}`}
                        onClick={() => setSelectedChat(contact.id)}
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12 border border-border">
                            <AvatarImage src={contact.avatar} alt={contact.name} />
                            <AvatarFallback className="bg-muted text-muted-foreground">{contact.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {contact.status === 'online' && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-positive border-2 border-background"></span>
                          )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h4 className="font-medium text-foreground truncate">{contact.name}</h4>
                            <span className="text-xs text-muted-foreground">{contact.lastMessageTime}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                            {contact.unread > 0 && (
                              <span className="ml-2 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                                {contact.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center items-center h-full text-muted-foreground">
                      {searchQuery ? 'No contacts match your search' : 'No contacts found'}
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t border-border bg-secondary">
                  <Button 
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      // In a production app, this would open a dialog to select a user
                      // For now, we'll just refresh the conversation list
                      setIsLoadingContacts(true);
                      fetch('/api/messages/conversations')
                        .then(res => res.json())
                        .then(data => {
                          const formattedContacts = data.map((conv: any) => ({
                            id: conv.otherUser.id,
                            name: conv.otherUser.name,
                            avatar: conv.otherUser.image || '/placeholder-avatar.jpg',
                            status: 'offline',
                            lastMessage: conv.lastMessage.content,
                            lastMessageTime: formatMessageTime(new Date(conv.lastMessage.timestamp)),
                            unread: conv.unreadCount
                          }));
                          setContacts(formattedContacts);
                          setIsLoadingContacts(false);
                        })
                        .catch(err => {
                          console.error('Error refreshing conversations:', err);
                          setError('Failed to refresh conversations');
                          setIsLoadingContacts(false);
                        });
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Chat
                  </Button>
                </div>
              </div>
              
              {/* Chat Area */}
              <div className="w-2/3 flex flex-col">
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-3 border-b border-border bg-secondary flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage 
                            src={contacts.find(c => c.id === selectedChat)?.avatar} 
                            alt={contacts.find(c => c.id === selectedChat)?.name} 
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {contacts.find(c => c.id === selectedChat)?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <h4 className="font-medium text-foreground">
                            {contacts.find(c => c.id === selectedChat)?.name}
                          </h4>
                          {contacts.find(c => c.id === selectedChat)?.status === 'online' ? (
                            <p className="text-xs text-positive">Online</p>
                          ) : contacts.find(c => c.id === selectedChat)?.status === 'group' ? (
                            <p className="text-xs text-muted-foreground">
                              {contacts.find(c => c.id === selectedChat)?.participants?.join(', ')}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">Last seen today</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0 hover:bg-secondary">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0 hover:bg-secondary">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0 hover:bg-secondary">
                          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Chat Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-muted/30 custom-scrollbar">
                      {isLoadingMessages ? (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Date separator */}
                          <div className="flex justify-center">
                            <div className="bg-secondary text-muted-foreground text-xs px-2 py-1 rounded-full">
                              Today
                            </div>
                          </div>
                          
                          {chatMessages[selectedChat || '']?.map((message: ChatMessage, index: number) => (
                            <div 
                              key={message.id} 
                              className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  message.isMine 
                                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                                    : 'bg-card text-card-foreground rounded-bl-none border border-border'
                                }`}
                              >
                                {!message.isMine && contacts.find(c => c.id === selectedChat)?.status === 'group' && (
                                  <p className="text-xs font-medium mb-1 text-neutral">{message.sender}</p>
                                )}
                                <p>{message.content}</p>
                                <div className={`text-xs mt-1 text-right flex items-center justify-end ${message.isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                  <span>{message.time}</span>
                                  {message.isMine && message.status && (
                                    <span className="ml-1">
                                      {message.status === 'sending' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      )}
                                      {message.status === 'sent' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      {message.status === 'delivered' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                      {message.status === 'read' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline text-chart-2" viewBox="0 0 20 20" fill="currentColor">
                                          <path d="M9.707 7.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 9.586l-2.293-2.293z" />
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                      {message.status === 'failed' && (
                                        <div className="flex items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline text-negative" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                          </svg>
                                          <button 
                                            className="ml-1 text-xs underline text-negative"
                                            onClick={() => handleRetryMessage(message.id)}
                                          >
                                            Retry
                                          </button>
                                        </div>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Typing indicator */}
                          {isTyping && (
                            <div className="flex justify-start">
                              <div className="bg-card text-card-foreground rounded-lg rounded-bl-none p-3 max-w-[70%] border border-border">
                                <div className="flex space-x-1">
                                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* This div is used for auto-scrolling to the bottom */}
                          <div ref={messagesEndRef}></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Message Input */}
                    <div className="p-3 border-t border-border bg-card">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 hover:bg-secondary">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 hover:bg-secondary">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </Button>
                        <Input 
                          placeholder="Type a message" 
                          className="rounded-full bg-background border-input"
                          value={messageInput}
                          onChange={(e) => {
                            setMessageInput(e.target.value);
                            handleTyping();
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          disabled={isLoadingMessages}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-full h-10 w-10 p-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim() || isLoadingMessages}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-muted/30">
                    <div className="text-center p-6">
                      <div className="bg-secondary rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground">Your Messages</h3>
                      <p className="text-muted-foreground mt-1">Select a chat to start messaging</p>
                      <p className="text-xs text-muted-foreground mt-4 max-w-xs mx-auto">
                        Discuss trading strategies, market insights, and investment opportunities with your network
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button 
                  className={`px-6 py-3 font-medium text-center ${activeSettingsTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                  onClick={() => setActiveSettingsTab('security')}
                >
                  Security
                </button>
                <button 
                  className={`px-6 py-3 font-medium text-center ${activeSettingsTab === 'preferences' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                  onClick={() => setActiveSettingsTab('preferences')}
                >
                  Preferences
                </button>
                <button 
                  className={`px-6 py-3 font-medium text-center ${activeSettingsTab === 'dse' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                  onClick={() => setActiveSettingsTab('dse')}
                >
                  DSE Settings
                </button>
                <button 
                  className={`px-6 py-3 font-medium text-center ${activeSettingsTab === 'investor' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                  onClick={() => setActiveSettingsTab('investor')}
                >
                  Investor Profile
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeSettingsTab === 'security' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={twoFactor}
                      onCheckedChange={setTwoFactor}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>

                  <Button>Update Password</Button>
                </div>
              )}
              
              {activeSettingsTab === 'preferences' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive email updates about your account</p>
                    </div>
                    <Switch
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <select className="w-full p-2 border rounded">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <select className="w-full p-2 border rounded">
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC+0 (GMT)</option>
                    </select>
                  </div>
                </div>
              )}
              
              {activeSettingsTab === 'dse' && (
                <DSESettings />
              )}
              
              {activeSettingsTab === 'investor' && (
                <InvestorProfile />
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card className="p-0 overflow-hidden">
            <AccountSubscription />
          </Card>
        </TabsContent>

        <TabsContent value="ads">
          <Card className="p-0 overflow-hidden">
            <AccountAds />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}