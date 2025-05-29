export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
}

export interface UserInfo {
  id: string
  name: string
  image?: string
  email?: string
}

export interface Conversation {
  id: string
  participants: string[] // User IDs
  lastMessage?: Message
  unreadCount: number
  otherUser?: UserInfo
}

// This interface represents the conversation data as returned from the API
export interface ConversationWithUser {
  id: string
  otherUser: UserInfo
  lastMessage: {
    id: string
    content: string
    timestamp: string
    isMine: boolean
  }
  unreadCount: number
}

export interface MessageStore {
  messages: Message[]
  conversations: Conversation[]
}
