'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageSquare, 
  MoreHorizontal, 
  X, 
  ChevronLeft,
  Send,
  Paperclip,
  Smile
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

// Define message type
interface ChatMessage {
  id: string
  sender: string
  content: string
  time: string
  isMine: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
}

// Define contact type
interface Contact {
  id: string
  name: string
  avatar: string
  status: string
  lastMessage: string
  lastMessageTime: string
  unread: number
  participants?: string[]
}

// Define chat messages record type
interface ChatMessagesRecord {
  [key: string]: ChatMessage[]
}

export function AccountMessaging() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sample contacts/chats for WhatsApp-like UI
  const [contacts, setContacts] = useState<Contact[]>([])
  
  // Sample messages for selected chat
  const [chatMessages, setChatMessages] = useState<ChatMessagesRecord>({})

  // Check if we're in mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    
    return () => {
      window.removeEventListener('resize', checkMobileView)
    }
  }, [])

  // Update mobile chat view when a chat is selected
  useEffect(() => {
    if (selectedChat && isMobileView) {
      setShowMobileChat(true)
    }
  }, [selectedChat, isMobileView])

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (selectedChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedChat, chatMessages])

  // Load conversations from API
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoadingContacts(true)
        setError(null)
        
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockContacts = [
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
        ]
        
        setContacts(mockContacts)
        
        // Initialize chat messages
        const mockMessages: ChatMessagesRecord = {
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
        }
        
        setChatMessages(mockMessages)
        setIsLoadingContacts(false)
      } catch (err) {
        console.error('Error loading conversations:', err)
        setError('Failed to load conversations. Please try again later.')
        setIsLoadingContacts(false)
      }
    }
    
    loadConversations()
  }, [])
  
  // Helper function to format message timestamps
  const formatMessageTime = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 3000)
    }
  }

  // Handle sending a message
  const handleSendMessage = () => {
    if (!selectedChat || !messageInput.trim()) return
    
    const newMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'me',
      content: messageInput.trim(),
      time: formatMessageTime(new Date()),
      isMine: true,
      status: 'sending'
    }
    
    // Add message to UI immediately (optimistic update)
    setChatMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage]
    }))
    
    // Clear input
    setMessageInput('')
    
    // In a real app, this would be an API call
    // Simulate sending a message
    setTimeout(() => {
      setChatMessages(prev => ({
        ...prev,
        [selectedChat]: prev[selectedChat].map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      }))
      
      // Update last message in contacts list
      setContacts(prev => prev.map(contact => 
        contact.id === selectedChat 
          ? {
              ...contact,
              lastMessage: newMessage.content,
              lastMessageTime: formatMessageTime(new Date())
            }
          : contact
      ))
    }, 1000)
  }

  // Handle retrying a failed message
  const handleRetryMessage = (messageId: string) => {
    if (!selectedChat) return
    
    setChatMessages(prev => ({
      ...prev,
      [selectedChat]: prev[selectedChat].map(msg => 
        msg.id === messageId ? { ...msg, status: 'sending' } : msg
      )
    }))
    
    // Simulate retry
    setTimeout(() => {
      setChatMessages(prev => ({
        ...prev,
        [selectedChat]: prev[selectedChat].map(msg => 
          msg.id === messageId ? { ...msg, status: 'delivered' } : msg
        )
      }))
    }, 1000)
  }

  // Handle back button in mobile view
  const handleBackToContacts = () => {
    setShowMobileChat(false)
  }

  return (
    <Card className="p-0 overflow-hidden border border-border">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </span>
        </div>
      )}
      
      <div className={`flex h-[500px] md:h-[600px] ${isMobileView ? 'flex-col' : ''}`}>
        {/* Contacts/Chats List - Hidden in mobile when chat is open */}
        <div className={`${isMobileView && showMobileChat ? 'hidden' : 'flex flex-col'} ${isMobileView ? 'w-full' : 'w-full md:w-1/3'} border-r border-border`}>
          <div className="p-3 border-b border-border bg-secondary">
            <div className="relative">
              <Input 
                placeholder="Search contacts or messages" 
                className="pl-8 bg-background border-input h-10"
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
          
          <ScrollArea className="flex-1 custom-scrollbar">
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
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-medium text-foreground">{contact.name}</h4>
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
          </ScrollArea>
          
          <div className="p-3 border-t border-border bg-secondary">
            <Button 
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10"
              onClick={() => {
                toast({
                  title: "New Chat",
                  description: "This would open a dialog to select a user",
                })
              }}
            >
              <MessageSquare className="h-4 w-4" />
              New Chat
            </Button>
          </div>
        </div>
        
        {/* Chat Area - Hidden in mobile when no chat is selected */}
        <div className={`${isMobileView && !showMobileChat ? 'hidden' : 'flex flex-col'} ${isMobileView ? 'w-full' : 'w-full md:w-2/3'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-border bg-secondary flex items-center justify-between">
                {isMobileView && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mr-2 h-8 w-8" 
                    onClick={handleBackToContacts}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
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
                      <p className="text-xs text-green-500">Online</p>
                    ) : contacts.find(c => c.id === selectedChat)?.status === 'group' ? (
                      <p className="text-xs text-muted-foreground">
                        {contacts.find(c => c.id === selectedChat)?.participants?.join(', ')}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Last seen today</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              
              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4 bg-muted/30 custom-scrollbar">
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
                    
                    {chatMessages[selectedChat]?.map((message: ChatMessage) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3 ${
                            message.isMine 
                              ? 'bg-primary text-primary-foreground rounded-br-none' 
                              : 'bg-card text-card-foreground rounded-bl-none border border-border'
                          }`}
                        >
                          {!message.isMine && contacts.find(c => c.id === selectedChat)?.status === 'group' && (
                            <p className="text-xs font-medium mb-1 text-neutral">{message.sender}</p>
                          )}
                          <p className="break-words">{message.content}</p>
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
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.707 7.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 9.586l-2.293-2.293z" />
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {message.status === 'failed' && (
                                  <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <button 
                                      className="ml-1 text-xs underline text-red-500"
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
              </ScrollArea>
              
              {/* Message Input */}
              <div className="p-3 border-t border-border bg-card">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 p-0 md:flex hidden">
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 p-0 md:flex hidden">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Input 
                    placeholder="Type a message" 
                    className="rounded-full bg-background border-input h-10"
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value)
                      handleTyping()
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoadingMessages}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-10 w-10 p-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || isLoadingMessages}
                  >
                    <Send className="h-5 w-5" />
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
  )
}
