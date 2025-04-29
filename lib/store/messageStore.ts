import { create } from 'zustand'
import { Message, MessageStore, Conversation } from '../types/message'

interface MessageState extends MessageStore {
  sendMessage: (senderId: string, receiverId: string, content: string) => void
  markAsRead: (messageId: string) => void
  getConversation: (userId1: string, userId2: string) => Conversation | undefined
  getMessages: (conversationId: string) => Message[]
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  conversations: [],

  sendMessage: (senderId: string, receiverId: string, content: string) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    }

    // Find or create conversation
    const participants = [senderId, receiverId].sort()
    let conversation = get().conversations.find(
      c => c.participants[0] === participants[0] && c.participants[1] === participants[1]
    )

    if (!conversation) {
      conversation = {
        id: `conv_${Date.now()}`,
        participants,
        unreadCount: 1,
      }
      set(state => ({
        conversations: [...state.conversations, conversation!],
      }))
    } else {
      set(state => ({
        conversations: state.conversations.map(c =>
          c.id === conversation!.id
            ? { ...c, lastMessage: newMessage, unreadCount: c.unreadCount + 1 }
            : c
        ),
      }))
    }

    set(state => ({
      messages: [...state.messages, newMessage],
    }))
  },

  markAsRead: (messageId: string) => {
    set(state => ({
      messages: state.messages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ),
    }))
  },

  getConversation: (userId1: string, userId2: string) => {
    const participants = [userId1, userId2].sort()
    return get().conversations.find(
      c => c.participants[0] === participants[0] && c.participants[1] === participants[1]
    )
  },

  getMessages: (conversationId: string) => {
    const conversation = get().conversations.find(c => c.id === conversationId)
    if (!conversation) return []
    return get().messages.filter(
      msg => conversation.participants.includes(msg.senderId) && conversation.participants.includes(msg.receiverId)
    )
  },
}))
