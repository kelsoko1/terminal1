import { create } from 'zustand'
import { PeerMessage, PeerConnection } from '@/lib/types/p2p'
import { v4 as uuidv4 } from 'uuid'

interface P2PState {
  connections: Map<string, PeerConnection>
  messages: PeerMessage[]
  initializePeerConnection: (peerId: string) => Promise<void>
  sendMessage: (peerId: string, content: string) => void
  handleIncomingMessage: (message: PeerMessage) => void
  markMessageAsRead: (messageId: string) => void
  disconnectPeer: (peerId: string) => void
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export const useP2PStore = create<P2PState>((set, get) => ({
  connections: new Map(),
  messages: [],

  initializePeerConnection: async (peerId: string) => {
    const connections = get().connections
    if (connections.has(peerId)) return

    try {
      const peerConnection = new RTCPeerConnection(ICE_SERVERS)
      const dataChannel = peerConnection.createDataChannel('messageChannel')

      dataChannel.onmessage = (event) => {
        const message: PeerMessage = JSON.parse(event.data)
        get().handleIncomingMessage(message)
      }

      dataChannel.onopen = () => {
        console.log(`Connection established with peer ${peerId}`)
        connections.set(peerId, {
          peerId,
          connection: peerConnection,
          dataChannel,
          status: 'connected',
        })
        set({ connections: new Map(connections) })
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // In a real app, send this to the signaling server
          console.log('New ICE candidate:', event.candidate)
        }
      }

      // Create and send offer
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      connections.set(peerId, {
        peerId,
        connection: peerConnection,
        dataChannel,
        status: 'connecting',
      })
      set({ connections: new Map(connections) })

      // In a real app, send this offer to the peer via signaling server
      console.log('Offer created:', offer)

    } catch (error) {
      console.error('Error initializing peer connection:', error)
    }
  },

  sendMessage: (peerId: string, content: string) => {
    const connection = get().connections.get(peerId)
    if (!connection || connection.status !== 'connected') {
      console.error('No active connection to peer')
      return
    }

    const message: PeerMessage = {
      id: uuidv4(),
      senderId: 'currentUserId', // Replace with actual user ID
      receiverId: peerId,
      content,
      timestamp: Date.now(),
      type: 'text',
      read: false,
    }

    try {
      connection.dataChannel?.send(JSON.stringify(message))
      set((state) => ({
        messages: [...state.messages, message],
      }))
    } catch (error) {
      console.error('Error sending message:', error)
    }
  },

  handleIncomingMessage: (message: PeerMessage) => {
    set((state) => ({
      messages: [...state.messages, { ...message, read: false }],
    }))
  },

  markMessageAsRead: (messageId: string) => {
    set((state) => ({
      messages: state.messages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ),
    }))
  },

  disconnectPeer: (peerId: string) => {
    const connections = get().connections
    const connection = connections.get(peerId)
    
    if (connection) {
      connection.dataChannel?.close()
      connection.connection.close()
      connections.delete(peerId)
      set({ connections: new Map(connections) })
    }
  },
}))
