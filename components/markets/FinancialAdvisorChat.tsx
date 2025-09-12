'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  Lightbulb, 
  Paperclip, 
  X,
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  Shield,
  Target,
  Zap,
  Clock,
  Plus,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Edit3
} from 'lucide-react';
import { getAdvice } from '@/lib/services/bedrock';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  recommendations?: {
    type: string;
    description: string;
    reasoning: string;
  }[];
  relatedTopics?: string[];
  attachments?: File[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const quickActions = [
  {
    icon: <TrendingUp className="h-4 w-4" />,
    label: "Market Analysis",
    query: "Can you provide a current market analysis and investment opportunities?"
  },
  {
    icon: <DollarSign className="h-4 w-4" />,
    label: "Portfolio Review",
    query: "How can I optimize my investment portfolio for better returns?"
  },
  {
    icon: <Shield className="h-4 w-4" />,
    label: "Risk Assessment",
    query: "What are the current market risks and how should I protect my investments?"
  },
  {
    icon: <Target className="h-4 w-4" />,
    label: "Retirement Planning",
    query: "I need help with retirement planning. What strategies should I consider?"
  },
  {
    icon: <BarChart3 className="h-4 w-4" />,
    label: "Investment Strategy",
    query: "What investment strategy would you recommend for my financial goals?"
  },
  {
    icon: <Zap className="h-4 w-4" />,
    label: "Quick Tips",
    query: "Give me some quick financial tips for today's market conditions."
  }
];

const getInitialMessage = (): Message => ({
  id: '1',
  content: "Hello! I'm your AI financial advisor. I can help you with investment advice, portfolio management, and financial planning. How can I assist you today?",
  sender: 'ai',
  timestamp: new Date(),
  relatedTopics: ['Investment Basics', 'Portfolio Management', 'Financial Planning', 'Market Analysis']
});

const createNewSession = (): ChatSession => ({
  id: Date.now().toString(),
  title: 'New Chat',
  messages: [getInitialMessage()],
  createdAt: new Date(),
  updatedAt: new Date()
});

export function FinancialAdvisorChat() {
  const [query, setQuery] = useState('');
  const [currentSession, setCurrentSession] = useState<ChatSession>(createNewSession);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem('financialAdvisorSessions');
      if (savedSessions) {
        const sessions: ChatSession[] = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatSessions(sessions);
        if (sessions.length > 0) {
          setCurrentSession(sessions[0]);
        }
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  }, []);

  // Save chat sessions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('financialAdvisorSessions', JSON.stringify(chatSessions));
    } catch (error) {
      console.error('Error saving chat sessions:', error);
    }
  }, [chatSessions]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAtBottom(true);
  }, [currentSession.messages]);

  // Detect scroll position for scroll-to-bottom button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setAtBottom(scrollHeight - scrollTop - clientHeight < 40);
  };

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Utility functions for managing chat sessions
  const updateCurrentSession = (updates: Partial<ChatSession>) => {
    const updatedSession = { ...currentSession, ...updates, updatedAt: new Date() };
    setCurrentSession(updatedSession);
    
    // Update in sessions array
    setChatSessions(prev => {
      const sessionIndex = prev.findIndex(s => s.id === updatedSession.id);
      if (sessionIndex >= 0) {
        const newSessions = [...prev];
        newSessions[sessionIndex] = updatedSession;
        return newSessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      } else {
        return [updatedSession, ...prev].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      }
    });
  };

  const createNewChat = () => {
    const newSession = createNewSession();
    setCurrentSession(newSession);
    setChatSessions(prev => [newSession, ...prev]);
    setHistoryOpen(false);
  };

  const switchToSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setHistoryOpen(false);
    }
  };

  const deleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession.id === sessionId) {
      const remainingSessions = chatSessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSession(remainingSessions[0]);
      } else {
        createNewChat();
      }
    }
  };

  const generateSessionTitle = (firstUserMessage: string): string => {
    const words = firstUserMessage.trim().split(' ');
    return words.slice(0, 6).join(' ') + (words.length > 6 ? '...' : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() && attachments.length === 0) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: query,
      sender: 'user',
      timestamp: new Date(),
      attachments: [...attachments]
    };
    
    const updatedMessages = [...currentSession.messages, userMessage];
    
    // Update session title if this is the first user message
    let newTitle = currentSession.title;
    if (currentSession.messages.length === 1 && currentSession.title === 'New Chat') {
      newTitle = generateSessionTitle(query);
    }
    
    updateCurrentSession({
      messages: updatedMessages,
      title: newTitle
    });
    
    setQuery('');
    setAttachments([]);
    setIsLoading(true);
    
    try {
      // Get AI response
      const response = await getAdvice({ query });
      
      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        sender: 'ai',
        timestamp: new Date(),
        recommendations: response.recommendations,
        relatedTopics: response.relatedTopics
      };
      
      updateCurrentSession({
        messages: [...updatedMessages, aiMessage]
      });
    } catch (error) {
      console.error('Error getting financial advice:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I couldn't process your request. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      updateCurrentSession({
        messages: [...updatedMessages, errorMessage]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionQuery: string) => {
    setQuery(actionQuery);
    inputRef.current?.focus();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
            onClick={createNewChat}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          <div className="relative group">
            <Button
              variant="ghost"
              size="icon"
              className="transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setHistoryOpen(true)}
              aria-label="Open chat history"
            >
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full" onScroll={handleScroll}>
          <div className="max-w-3xl mx-auto space-y-6 pb-32 pt-6">
            <AnimatePresence initial={false}>
              {currentSession.messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.18, delay: idx * 0.03 }}
                  className={`group px-4 py-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    message.sender === 'user' ? 'bg-gray-50 dark:bg-gray-800/30' : ''
                  }`}
                >
                  <div className="flex gap-4 max-w-full">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-green-500 text-white'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="text-gray-900 dark:text-gray-100 leading-7">{message.content}</div>
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {message.attachments.map((file, index) => (
                              <div key={index} className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{file.name}</span>
                                <span className="text-sm text-gray-400">({formatFileSize(file.size)})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Recommendations */}
                      {message.recommendations && message.recommendations.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <div className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            Recommendations
                          </div>
                          <div className="space-y-3">
                            {message.recommendations.map((rec, index) => (
                              <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="font-medium text-blue-900 dark:text-blue-100">{rec.description}</div>
                                <div className="text-blue-700 dark:text-blue-300 mt-2 text-sm">{rec.reasoning}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Related Topics */}
                      {message.relatedTopics && message.relatedTopics.length > 0 && (
                        <div className="mt-6">
                          <div className="flex flex-wrap gap-2">
                            {message.relatedTopics.map((topic, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-xs transition-colors border-gray-300 dark:border-gray-600"
                              >
                                {topic}
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {/* Loading indicator */}
            {isLoading && (
              <div className="group px-4 py-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-[280px] bg-gray-200 dark:bg-gray-700" />
                      <Skeleton className="h-4 w-[240px] bg-gray-200 dark:bg-gray-700" />
                      <Skeleton className="h-4 w-[180px] bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        {/* Scroll to bottom button */}
        <AnimatePresence>
          {!atBottom && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                setAtBottom(true);
              }}
              className="fixed bottom-32 right-8 z-30 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full shadow-lg p-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
              aria-label="Scroll to bottom"
            >
              <ArrowRight className="rotate-90 h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat History Sidebar */}
      <AnimatePresence>
        {historyOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setHistoryOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chat History</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setHistoryOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <Button
                  onClick={createNewChat}
                  className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              </div>

              {/* Chat Sessions List */}
              <ScrollArea className="flex-1 p-2">
                {chatSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No chat history yet</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Start a conversation to see your chats here</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {chatSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`group p-3 rounded-lg cursor-pointer transition-colors relative ${
                          session.id === currentSession.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => switchToSession(session.id)}
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {session.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {session.updatedAt.toLocaleDateString()} • {session.messages.length - 1} messages
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-6 sticky bottom-0 z-10">
        <div className="max-w-3xl mx-auto">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                  <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
              <Input
                ref={inputRef}
                placeholder="Message Financial Advisor..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 focus-visible:ring-0 resize-none"
                disabled={isLoading}
              />
              <div className="flex items-center gap-2 px-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  className="h-8 w-8 p-0 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 transition-colors rounded-lg"
                  disabled={isLoading || (!query.trim() && attachments.length === 0)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
          />
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            Financial Advisor can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}
