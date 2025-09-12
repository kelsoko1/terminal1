'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useToast } from '@/components/ui/use-toast'
import '@/styles/account-mobile.css'
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
import { EcommerceManagement } from '@/components/account/EcommerceManagement'
import { UserChallenges } from '@/components/account/UserChallenges'
import { AccountMessaging } from '@/components/messages/AccountMessaging'
import { PostCard } from '@/components/social/PostCard'
import { formatDistanceToNow } from 'date-fns'
import { 
  Edit, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare, 
  Share2, 
  Heart, 
  Bookmark, 
  MoreHorizontal, 
  User, 
  FileText, 
  Loader2, 
  AtSign,
  ShoppingBag,
  X,
  Download,
  Trash2,
  Trophy,
  Flag
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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
import { Tabs as UITabs, TabsList as UITabsList, TabsTrigger as UITabsTrigger, TabsContent as UITabsContent } from '@/components/ui/tabs';

// Post type definition
type Post = {
  id: string
  content: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isBookmarked: boolean
  author: {
    id: string
    name: string
    username: string
    avatarUrl?: string
  }
  images?: string[]
  tags?: string[]
  createdAt?: string
  updatedAt?: string
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

type UserMarket = {
  id: string;
  title: string;
  status: string;
  closeAt: string;
  description?: string;
  category?: string;
  resolutionType?: string;
  resolutionDetails?: string;
  resolutionFile?: File | null;
  outcomes?: string[];
  flagged?: boolean;
};

const RESOLUTION_OPTIONS = [
  { value: 'official', label: 'Official Data Feed/API' },
  { value: 'ai', label: 'AI-Assisted' },
  { value: 'proof', label: 'User-Submitted Proof (image, doc, link)' },
  { value: 'vote', label: 'Community Vote' },
  { value: 'other', label: 'Other' },
];

type PredictionMarketForm = {
  title: string;
  description: string;
  outcomes: string[];
  category: string;
  resolutionType: string;
  resolutionDetails: string;
  resolutionFile: File | null;
  endDate: string;
};

function handleFileChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setForm: React.Dispatch<React.SetStateAction<PredictionMarketForm>>
) {
  setForm((prev: PredictionMarketForm) => ({ ...prev, resolutionFile: e.target.files?.[0] || null }));
}

export default function AccountPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [activePostsTab, setActivePostsTab] = useState<'posts' | 'likes'>('posts')
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeSettingsTab, setActiveSettingsTab] = useState<'security' | 'preferences' | 'dse' | 'investor'>('security')
  const [activeSubscriptionTab, setActiveSubscriptionTab] = useState<'subscription' | 'subscription2'>('subscription')
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Demo user markets
  const [userMarkets, setUserMarkets] = useState<UserMarket[]>([
    {
      id: 'demo-1',
      title: 'Will BTC close above $50,000 this month?',
      status: 'open',
      closeAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-2',
      title: 'Will the S&P 500 rise this week?',
      status: 'open',
      closeAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);
  // Sophisticated creation form state
  const [form, setForm] = useState<PredictionMarketForm>({
    title: '',
    description: '',
    outcomes: ['Yes', 'No'],
    category: '',
    resolutionType: '',
    resolutionDetails: '',
    resolutionFile: null,
    endDate: '',
  });
  const [formError, setFormError] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const leaderboardData = [
    { rank: 1, name: 'Alice', volume: 12000, profit: 3400 },
    { rank: 2, name: 'Bob', volume: 9500, profit: 2100 },
    { rank: 3, name: 'Carol', volume: 8700, profit: 1800 },
    { rank: 4, name: 'David', volume: 8000, profit: 1200 },
    { rank: 5, name: 'Eve', volume: 7200, profit: 900 },
  ];

  const handleFormChange = (field: string, value: any) => {
    setForm((prev: typeof form) => ({ ...prev, [field]: value }));
  };
  const handleOutcomeChange = (idx: number, value: string) => {
    setForm((prev: typeof form) => ({ ...prev, outcomes: prev.outcomes.map((o, i) => i === idx ? value : o) }));
  };
  const addOutcome = () => setForm((prev: typeof form) => ({ ...prev, outcomes: [...prev.outcomes, ''] }));
  const removeOutcome = (idx: number) => {
    if (form.outcomes.length <= 2) return;
    setForm((prev: typeof form) => ({ ...prev, outcomes: prev.outcomes.filter((_, i) => i !== idx) }));
  };
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      outcomes: ['Yes', 'No'],
      category: '',
      resolutionType: '',
      resolutionDetails: '',
      resolutionFile: null,
      endDate: '',
    });
    setFormError('');
  };

  const handleSophisticatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    // Validation
    if (!form.title.trim() || !form.description.trim() || !form.category || !form.resolutionType || !form.endDate) {
      setFormError('Please fill all required fields.');
      return;
    }
    if (form.outcomes.length < 2 || form.outcomes.some(o => !o.trim())) {
      setFormError('Please provide at least 2 unique outcomes.');
      return;
    }
    if (new Set(form.outcomes.map(o => o.trim().toLowerCase())).size !== form.outcomes.length) {
      setFormError('Outcomes must be unique.');
      return;
    }
    if (new Date(form.endDate) <= new Date()) {
      setFormError('End date must be in the future.');
      return;
    }
    // Add to user markets (demo)
    setUserMarkets(prev => [
      ...prev,
      {
        id: `demo-${prev.length + 1}`,
        title: form.title,
        status: 'open',
        closeAt: form.endDate,
        description: form.description,
        category: form.category,
        resolutionType: form.resolutionType,
        resolutionDetails: form.resolutionDetails,
        outcomes: form.outcomes,
      },
    ]);
    setShowCreateModal(false);
    resetForm();
  };

  // Sample user posts
  const [posts, setPosts] = useState<Post[]>([])
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)

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

  // User profile data
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
    email: "",
    phone: "",
    joinDate: "",
    avatarUrl: "",
    coverImageUrl: ""
  })
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

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

  // Fetch user profile data
  useEffect(() => {
    if (user?.id) {
      fetchUserProfile()
      fetchUserPosts()
    }
  }, [user])
  
  // Fetch user profile data from API
  const fetchUserProfile = async () => {
    setIsLoadingProfile(true)
    try {
      const response = await fetch(`/api/users/profile?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setProfileData({
          name: data.name || '',
          username: data.username || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          email: data.email || '',
          phone: data.phone || '',
          joinDate: new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          avatarUrl: data.avatarUrl || '',
          coverImageUrl: data.coverImageUrl || ''
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      toast({
        title: "Error",
        description: "Could not load profile data",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }
  
  // Fetch user posts from API
  const fetchUserPosts = async () => {
    setIsLoadingPosts(true)
    try {
      // Fetch user's posts
      const postsResponse = await fetch(`/api/users/${user?.id}/posts`)
      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        setPosts(postsData)
      }
      
      // Fetch user's liked posts
      const likedPostsResponse = await fetch(`/api/users/${user?.id}/likes`)
      if (likedPostsResponse.ok) {
        const likedPostsData = await likedPostsResponse.json()
        setLikedPosts(likedPostsData)
      }
    } catch (error) {
      console.error('Error fetching user posts:', error)
      toast({
        title: "Error",
        description: "Could not load posts",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPosts(false)
    }
  };

  // Handle profile edit
  const handleProfileEdit = async (updatedProfile: typeof profileData) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          ...updatedProfile
        }),
      })
      
      if (response.ok) {
        setProfileData(updatedProfile)
        setIsEditProfileOpen(false)
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Could not update profile",
        variant: "destructive",
      })
    }
  }
  
  // Handle profile form submission
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          ...profileData
        }),
      })
      
      if (response.ok) {
        setIsEditDialogOpen(false)
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Could not update profile",
        variant: "destructive",
      })
    }
  }

  // Handle post like toggle
  const handleLikeToggle = async (postId: string) => {
    try {
      // Optimistically update UI
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        }
        return post
      }))
      
      // Send API request to update like status
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      })
      
      if (!response.ok) {
        // Revert if API call fails
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes + 1 : post.likes - 1 }
          }
          return post
        }))
        toast({
          title: "Error",
          description: "Could not update like status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      toast({
        title: "Error",
        description: "Could not update like status",
        variant: "destructive",
      })
    }
  }

  // Handle post bookmark toggle
  const handleBookmarkToggle = async (postId: string) => {
    try {
      // Optimistically update UI
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, isBookmarked: !post.isBookmarked }
        }
        return post
      }))
      
      // Send API request to update bookmark status
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      })
      
      if (!response.ok) {
        // Revert if API call fails
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return { ...post, isBookmarked: !post.isBookmarked }
          }
          return post
        }))
        toast({
          title: "Error",
          description: "Could not update bookmark status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      toast({
        title: "Error",
        description: "Could not update bookmark status",
        variant: "destructive",
      })
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

  // PostCard component for displaying posts
  const PostCard = ({ post, onLike, onBookmark }: { post: Post, onLike: (id: string) => void, onBookmark: (id: string) => void }) => {
    return (
      <div className="border rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
            {post.author.avatarUrl ? (
              <Image 
                src={post.author.avatarUrl} 
                alt={post.author.name} 
                width={40} 
                height={40}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                <User className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{post.author.name}</p>
                <p className="text-sm text-gray-500">{post.author.username} · {post.timestamp}</p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2">{post.content}</p>
            {post.images && post.images.length > 0 && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <Image 
                  src={post.images[0]} 
                  alt="Post image" 
                  width={500} 
                  height={300}
                  className="w-full object-cover"
                />
              </div>
            )}
            <div className="flex justify-between mt-4">
              <div className="flex space-x-4">
                <button 
                  className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
                  onClick={() => onLike(post.id)}
                >
                  <Heart className="h-4 w-4" fill={post.isLiked ? "currentColor" : "none"} />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500">
                  <Share2 className="h-4 w-4" />
                  <span>{post.shares}</span>
                </button>
              </div>
              <button 
                className={`${post.isBookmarked ? 'text-yellow-500' : 'text-gray-500'} hover:text-yellow-500`}
                onClick={() => onBookmark(post.id)}
              >
                <Bookmark className="h-4 w-4" fill={post.isBookmarked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleDeleteMarket = (id: string) => {
    setUserMarkets((prev: UserMarket[]) => prev.filter(m => m.id !== id));
  };
  const handleShareMarket = (market: UserMarket) => {
    const url = `${window.location.origin}/prediction-market/${market.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', description: url });
  };

  const handleFlagMarket = (id: string) => {
    setUserMarkets((prev: UserMarket[]) => prev.map(m =>
      m.id === id && m.status !== 'resolved' && m.status !== 'refunded' && !m.flagged
        ? { ...m, flagged: true }
        : m
    ));
    toast({ title: 'Market flagged for review', description: 'This market will be reviewed by an admin.' });
  };

  const leaderboardByVolume = [...leaderboardData].sort((a, b) => b.volume - a.volume);
  const leaderboardByProfit = [...leaderboardData].sort((a, b) => b.profit - a.profit);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-full md:max-w-6xl account-page">
      <h1 className="text-xl md:text-3xl font-bold mb-3 md:mb-6">Account Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop TabsList - Hidden on mobile */}
        <TabsList className="hidden md:flex">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="ecommerce" className="flex items-center gap-1">
            <ShoppingBag className="h-4 w-4" />
            Soko
          </TabsTrigger>
          <TabsTrigger value="prediction-markets">Prediction Markets</TabsTrigger>
        </TabsList>
        
        {/* Mobile Dropdown - Visible only on mobile */}
        <div className="md:hidden account-mobile-select-container">
          <select 
            id="mobile-tab-select"
            className="w-full border bg-background text-foreground mobile-tab-select touch-manipulation" 
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            aria-label="Select account section"
          >
            <option value="profile">👤 Profile</option>
            <option value="messages">💬 Messages</option>
            <option value="settings">⚙️ Settings</option>
            <option value="challenges">🏆 Challenges</option>
            <option value="subscription">⭐ Subscription</option>
            <option value="ads">📢 Ads</option>
            <option value="ecommerce">🛍️ Soko</option>
            <option value="prediction-markets">Prediction Markets</option>
          </select>
        </div>

        <TabsContent value="profile">
          <Card className="p-0 overflow-hidden">
            {/* Profile Banner */}
            <div className="relative w-full h-36 md:h-48 rounded-t-lg overflow-hidden">
              {profileData.coverImageUrl ? (
                <Image
                  src={profileData.coverImageUrl}
                  alt="Profile banner"
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500" />
              )}
            </div>
            <div className="relative px-4 md:px-6 profile-header">
              <div className="absolute -top-14 md:-top-16 left-1/2 md:left-6 transform -translate-x-1/2 md:translate-x-0 w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden profile-avatar">
                {profileData.avatarUrl ? (
                  <Image
                    src={profileData.avatarUrl}
                    alt="Profile picture"
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    <User className="h-12 w-12 md:h-16 md:w-16" />
                  </div>
                )}
                <button 
                  className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full touch-manipulation"
                  onClick={() => toast({ title: "Edit profile picture", description: "This would open a profile picture editor" })}
                >
                  <Edit className="h-3 w-3 md:h-4 md:w-4" />
                </button>
              </div>
              <div className="flex justify-center md:justify-end pt-16 md:pt-4 pb-2 profile-actions">
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
            <div className="pt-20 pb-4">
              {isLoadingProfile ? (
                <div className="flex flex-col space-y-4">
                  <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-16 w-full bg-gray-200 animate-pulse rounded"></div>
                  <div className="flex space-x-4">
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start profile-info">
                    <div className="text-center sm:text-left mb-3 sm:mb-0">
                      <h1 className="text-xl sm:text-2xl font-bold">{profileData.name}</h1>
                      <p className="text-gray-500 text-sm sm:text-base">{profileData.username}</p>
                    </div>
                    <Button 
                      onClick={() => setIsEditProfileOpen(true)}
                      disabled={isLoadingProfile}
                      className="w-full sm:w-auto h-10 touch-manipulation"
                      size="sm"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5 sm:mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                  
                  <p className="mt-3 sm:mt-4 text-sm sm:text-base">{profileData.bio || 'No bio provided'}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-2 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 profile-details">
                    {profileData.location && (
                      <div className="flex items-center mb-1.5 sm:mb-0 sm:mr-4">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                        <span className="truncate">{profileData.location}</span>
                      </div>
                    )}
                    {profileData.website && (
                      <div className="flex items-center mb-1.5 sm:mb-0 sm:mr-4">
                        <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                        <a href={`https://${profileData.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-[200px]">
                          {profileData.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center mb-1.5 sm:mb-0 sm:mr-4">
                      <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                      <span className="truncate">{profileData.email}</span>
                    </div>
                    {profileData.phone && (
                      <div className="flex items-center mb-1.5 sm:mb-0 sm:mr-4">
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                      <span>Joined {profileData.joinDate}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Posts Section */}
            <Tabs defaultValue="posts" className="w-full mt-4 sm:mt-6">
              <TabsList className="grid w-full grid-cols-2 h-10 sm:h-auto">
                <TabsTrigger value="posts" className="text-sm sm:text-base h-10 touch-manipulation">Posts</TabsTrigger>
                <TabsTrigger value="likes" className="text-sm sm:text-base h-10 touch-manipulation">Likes</TabsTrigger>
              </TabsList>
              <TabsContent value="posts" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                {isLoadingPosts ? (
                  <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 animate-pulse"></div>
                          <div className="space-y-1 flex-1">
                            <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-200 animate-pulse rounded"></div>
                            <div className="h-2 sm:h-3 w-14 sm:w-16 bg-gray-200 animate-pulse rounded"></div>
                          </div>
                        </div>
                        <div className="h-12 sm:h-16 w-full bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-3 sm:h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  posts.map(post => (
                    <PostCard 
                      key={post.id}
                      post={post}
                      onLike={handleLikeToggle}
                      onBookmark={handleBookmarkToggle}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12 border rounded-lg">
                    <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" />
                    <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">No posts yet</h3>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">When you create posts, they'll appear here.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="likes" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                {isLoadingPosts ? (
                  <div className="space-y-3 sm:space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 animate-pulse"></div>
                          <div className="space-y-1 flex-1">
                            <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-200 animate-pulse rounded"></div>
                            <div className="h-2 sm:h-3 w-14 sm:w-16 bg-gray-200 animate-pulse rounded"></div>
                          </div>
                        </div>
                        <div className="h-12 sm:h-16 w-full bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-3 sm:h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : likedPosts.length > 0 ? (
                  likedPosts.map(post => (
                    <PostCard 
                      key={post.id}
                      post={post}
                      onLike={handleLikeToggle}
                      onBookmark={handleBookmarkToggle}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12 border rounded-lg">
                    <Heart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" />
                    <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">No likes yet</h3>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">Posts you like will appear here.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <AccountMessaging />
        </TabsContent>

        <TabsContent value="challenges">
          <UserChallenges />
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
        
        <TabsContent value="ecommerce">
          <Card className="p-0 overflow-hidden">
            <EcommerceManagement />
          </Card>
        </TabsContent>

        <TabsContent value="prediction-markets">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Prediction Markets</h2>
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => setShowLeaderboard(true)}
                >
                  <Trophy className="w-4 h-4" /> Leaderboard
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Create Prediction Market
                </button>
              </div>
            </div>
            {userMarkets.length === 0 ? (
              <div className="text-muted-foreground">You haven't created any prediction markets yet.</div>
            ) : (
              <div className="space-y-2">
                {userMarkets.map(market => (
                  <div key={market.id} className={`border rounded-lg p-4 bg-white shadow flex flex-col md:flex-row md:items-center md:justify-between${market.flagged ? ' border-yellow-400 bg-yellow-50' : ''}`}> 
                    <div>
                      <div className="font-medium text-gray-900">{market.title}</div>
                      <div className="text-xs text-gray-500">Status: {market.status}{market.flagged && ' (Flagged for Review)'}</div>
                      <div className="text-xs text-gray-500">Closes: {new Date(market.closeAt).toLocaleString()}</div>
                      {market.resolutionType === 'proof' && market.resolutionFile && (
                        <div className="mt-2 flex items-center gap-2">
                          <Download className="w-4 h-4 text-blue-600" />
                          <a
                            href={URL.createObjectURL(market.resolutionFile)}
                            download={market.resolutionFile.name}
                            className="text-blue-600 underline text-xs"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Proof
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3 md:mt-0 md:ml-4">
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs"
                        onClick={() => handleShareMarket(market)}
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" /> Share
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded text-red-700 text-xs"
                        onClick={() => handleDeleteMarket(market.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-700 text-xs"
                        onClick={() => handleFlagMarket(market.id)}
                        disabled={market.flagged || market.status === 'resolved' || market.status === 'refunded'}
                        title="Flag for Review"
                      >
                        <Flag className="w-4 h-4" /> {market.flagged ? 'Flagged' : 'Flag'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Create Market Modal */}
          <Dialog open={showCreateModal} onOpenChange={o => { setShowCreateModal(o); if (!o) resetForm(); }}>
            <DialogContent className="max-w-lg w-full">
              <DialogHeader>
                <DialogTitle>Create Prediction Market</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSophisticatedSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block font-medium mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={form.title}
                    onChange={e => handleFormChange('title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Description <span className="text-red-500">*</span></label>
                  <Textarea
                    className="border rounded px-3 py-2 w-full"
                    value={form.description}
                    onChange={e => handleFormChange('description', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Outcomes <span className="text-red-500">*</span></label>
                  {form.outcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-center mb-2">
                      <input
                        className="border rounded px-2 py-1 flex-1"
                        value={outcome}
                        onChange={e => handleOutcomeChange(idx, e.target.value)}
                        required
                      />
                      {form.outcomes.length > 2 && (
                        <button type="button" className="ml-2 text-red-600" onClick={() => removeOutcome(idx)}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="mt-1 text-blue-600" onClick={addOutcome}>
                    + Add Outcome
                  </button>
                </div>
                <div>
                  <label className="block font-medium mb-1">Category <span className="text-red-500">*</span></label>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={form.category}
                    onChange={e => handleFormChange('category', e.target.value)}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Politics">Politics</option>
                    <option value="Sports">Sports</option>
                    <option value="Weather">Weather</option>
                    <option value="Finance">Finance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {/* Resolution Source (Flexible) */}
                <div>
                  <label className="block font-medium mb-1">Resolution Source <span className="text-red-500">*</span></label>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={form.resolutionType}
                    onChange={e => handleFormChange('resolutionType', e.target.value)}
                    required
                  >
                    <option value="">Select resolution method</option>
                    {RESOLUTION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {/* Show relevant input based on selection */}
                  {form.resolutionType === 'official' && (
                    <input
                      className="border rounded px-3 py-2 w-full mt-2"
                      value={form.resolutionDetails}
                      onChange={e => handleFormChange('resolutionDetails', e.target.value)}
                      placeholder="e.g. CoinGecko BTC price, Official election results"
                      required
                    />
                  )}
                  {form.resolutionType === 'ai' && (
                    <input
                      className="border rounded px-3 py-2 w-full mt-2"
                      value={form.resolutionDetails}
                      onChange={e => handleFormChange('resolutionDetails', e.target.value)}
                      placeholder="Describe what the AI should look for (e.g. news headlines, web search)"
                      required
                    />
                  )}
                  {form.resolutionType === 'proof' && (
                    <div className="mt-2 space-y-2">
                      <input
                        className="border rounded px-3 py-2 w-full"
                        value={form.resolutionDetails}
                        onChange={e => handleFormChange('resolutionDetails', e.target.value)}
                        placeholder="Describe the required proof (e.g. upload image, link to doc)"
                        required
                      />
                      <input
                        type="file"
                        className="border rounded px-3 py-2 w-full"
                        onChange={e => handleFileChange(e, setForm)}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                    </div>
                  )}
                  {form.resolutionType === 'vote' && (
                    <div className="mt-2 text-muted-foreground text-sm">Outcome will be decided by community vote.</div>
                  )}
                  {form.resolutionType === 'other' && (
                    <input
                      className="border rounded px-3 py-2 w-full mt-2"
                      value={form.resolutionDetails}
                      onChange={e => handleFormChange('resolutionDetails', e.target.value)}
                      placeholder="Describe the resolution method"
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-1">End Date <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    className="border rounded px-3 py-2 w-full"
                    value={form.endDate}
                    onChange={e => handleFormChange('endDate', e.target.value)}
                    required
                  />
                </div>
                {formError && <div className="text-red-600 text-sm mt-2">{formError}</div>}
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
                >
                  Create Market
                </button>
              </form>
            </DialogContent>
          </Dialog>
          {/* Leaderboard Modal */}
          <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
            <DialogContent className="max-w-lg w-full">
              <DialogHeader>
                <DialogTitle>Leaderboard</DialogTitle>
              </DialogHeader>
              <UITabs defaultValue="volume" className="w-full mt-2">
                <UITabsList className="mb-4 w-full grid grid-cols-2">
                  <UITabsTrigger value="volume">By Volume</UITabsTrigger>
                  <UITabsTrigger value="profit">By Profit</UITabsTrigger>
                </UITabsList>
                <UITabsContent value="volume">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left">Rank</th>
                          <th className="px-3 py-2 text-left">User</th>
                          <th className="px-3 py-2 text-right">Volume</th>
                          <th className="px-3 py-2 text-right">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboardByVolume.map((user, i) => (
                          <tr key={user.name} className="border-b last:border-b-0">
                            <td className="px-3 py-2 font-bold">{i + 1}</td>
                            <td className="px-3 py-2">{user.name}</td>
                            <td className="px-3 py-2 text-right">${user.volume.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right text-green-600 font-semibold">${user.profit.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </UITabsContent>
                <UITabsContent value="profit">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left">Rank</th>
                          <th className="px-3 py-2 text-left">User</th>
                          <th className="px-3 py-2 text-right">Profit</th>
                          <th className="px-3 py-2 text-right">Volume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboardByProfit.map((user, i) => (
                          <tr key={user.name} className="border-b last:border-b-0">
                            <td className="px-3 py-2 font-bold">{i + 1}</td>
                            <td className="px-3 py-2">{user.name}</td>
                            <td className="px-3 py-2 text-right text-green-600 font-semibold">${user.profit.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right">${user.volume.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </UITabsContent>
              </UITabs>
            </DialogContent>
          </Dialog>
        </TabsContent>

      </Tabs>
    </div>
  )
}