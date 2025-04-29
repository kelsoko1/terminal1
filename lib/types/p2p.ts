export interface PeerMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'signal';
  signal?: any; // WebRTC signaling data
  read?: boolean;
}

export interface PeerConnection {
  peerId: string;
  connection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  status: 'connecting' | 'connected' | 'disconnected';
}
