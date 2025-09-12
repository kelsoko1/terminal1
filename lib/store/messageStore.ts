import { create } from 'zustand'
import { Message, MessageStore, Conversation, ConversationWithUser } from '../types/message'

interface MessageState extends MessageStore {
  isLoading: boolean
  error: string | null
  fetchConversations: () => Promise<void>
  fetchMessages: (otherUserId: string) => Promise<void>
  sendMessage: (receiverId: string, content: string) => Promise<void>
  markAsRead: (messageId: string) => Promise<void>
  getConversation: (userId1: string, userId2: string) => Conversation | undefined
  getMessages: (conversationId: string) => Message[]
  clearError: () => void
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  conversations: [],
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch('/api/messages/conversations')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch conversations')
      }
      
      const conversations: ConversationWithUser[] = await response.json()
      
      // Transform the API response to match our store format
      const formattedConversations: Conversation[] = conversations.map(conv => ({
        id: conv.id,
        participants: [conv.otherUser.id],
        lastMessage: {
          id: conv.lastMessage.id,
          senderId: conv.lastMessage.isMine ? 'me' : conv.otherUser.id,
          receiverId: conv.lastMessage.isMine ? conv.otherUser.id : 'me',
          content: conv.lastMessage.content,
          timestamp: conv.lastMessage.timestamp,
          read: true
        },
        unreadCount: conv.unreadCount,
        otherUser: conv.otherUser
      }))
      
      set({ conversations: formattedConversations, isLoading: false })
    } catch (error) {
      console.error('Error fetching conversations:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch conversations', 
        isLoading: false 
      })
    }
  },

  fetchMessages: async (otherUserId: string) => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch(`/api/messages/conversation?otherUserId=${otherUserId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch messages')
      }
      
      const apiMessages = await response.json()
      
      // Transform the API response to match our store format
      const messages: Message[] = apiMessages.map((msg: any) => ({
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        timestamp: msg.createdAt,
        read: msg.read
      }))
      
      set({ messages, isLoading: false })
      
      // Update unread count in the conversation
      set(state => ({
        conversations: state.conversations.map(conv => 
          conv.participants.includes(otherUserId)
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      }))
    } catch (error) {
      console.error('Error fetching messages:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch messages', 
        isLoading: false 
      })
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    try {
      // Optimistically update UI
      const tempId = `temp_${Date.now()}`
      const tempMessage: Message = {
        id: tempId,
        senderId: 'me', // Will be replaced with actual user ID on the server
        receiverId,
        content,
        timestamp: new Date().toISOString(),
        read: false,
        status: 'sending'
      }
      
      set(state => ({
        messages: [...state.messages, tempMessage]
      }))
      
      // Send to server
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiverId, content })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }
      
      const newMessage = await response.json()
      
      // Replace temp message with actual message from server
      set(state => ({
        messages: state.messages.map(msg => 
          msg.id === tempId 
            ? { 
                ...newMessage, 
                timestamp: newMessage.createdAt,
                status: 'sent' 
              }
            : msg
        )
      }))
      
      // Update conversation
      const existingConversation = get().conversations.find(
        c => c.participants.includes(receiverId)
      )
      
      if (existingConversation) {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === existingConversation.id
              ? { 
                  ...c, 
                  lastMessage: {
                    id: newMessage.id,
                    senderId: 'me',
                    receiverId,
                    content,
                    timestamp: newMessage.createdAt,
                    read: false
                  }
                }
              : c
          )
        }))
      } else {
        // If this is a new conversation, fetch all conversations to get the updated list
        await get().fetchConversations()
      }
      
      return Promise.resolve()
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Mark the message as failed
      set(state => ({
        messages: state.messages.map(msg => 
          msg.status === 'sending' 
            ? { ...msg, status: 'failed' }
            : msg
        ),
        error: error instanceof Error ? error.message : 'Failed to send message'
      }))
      
      return Promise.reject(error)
    }
  },

  markAsRead: async (messageId: string) => {
    try {
      // Optimistically update UI
      set(state => ({
        messages: state.messages.map(msg =>
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      }))
      
      // Send to server
      const response = await fetch('/api/messages/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageId })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to mark message as read')
      }
      
      return Promise.resolve()
    } catch (error) {
      console.error('Error marking message as read:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mark message as read'
      })
      return Promise.reject(error)
    }
  },

  getConversation: (userId1: string, userId2: string) => {
    return get().conversations.find(
      c => c.participants.includes(userId2)
    )
  },

  getMessages: (conversationId: string) => {
    return get().messages
  },
  
  clearError: () => {
    set({ error: null })
  }
}))
