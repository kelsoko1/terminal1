export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: string
  participants: string[] // User IDs
  lastMessage?: Message
  unreadCount: number
}

export interface MessageStore {
  messages: Message[]
  conversations: Conversation[]
}
