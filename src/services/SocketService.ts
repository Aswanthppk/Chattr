import { io, Socket } from 'socket.io-client';
import { ChatMessage, UserMatch } from '../types';

export interface RealtimeMatchPayload {
  roomId: string;
  partner: UserMatch;
}

class SocketService {
  private socket: Socket | null = null;
  private currentRoomId: string | null = null;
  private userId: string = `user_${Math.random().toString(36).substring(2, 9)}`;

  public getUserId(): string {
    return this.userId;
  }

  public connect(): Socket {
    if (!this.socket) {
      // Connect to server (supports environment variable, local dev port 3001, or production origin)
      const envUrl = (import.meta as any).env?.VITE_SERVER_URL;
      const isDev = (import.meta as any).env?.DEV;
      let serverUrl = envUrl;
      if (!serverUrl) {
        if (isDev) {
          serverUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:3001'
            : `http://${window.location.hostname}:3001`;
        } else {
          serverUrl = window.location.origin;
        }
      }

      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected to server as', this.socket?.id);
      });
    }
    return this.socket;
  }

  public onOnlineCount(callback: (count: number) => void): () => void {
    const s = this.connect();
    s.on('onlineCount', callback);
    s.emit('getOnlineCount');
    return () => {
      s.off('onlineCount', callback);
    };
  }

  public findMatch(
    name: string,
    interests: string[],
    blockedUsers: string[],
    onMatchFound: (payload: RealtimeMatchPayload) => void,
    onQueueStatus?: (status: { waiting: boolean }) => void
  ): () => void {
    const s = this.connect();

    const handleMatch = (payload: RealtimeMatchPayload) => {
      this.currentRoomId = payload.roomId;
      onMatchFound(payload);
    };

    const handleQueue = (status: { waiting: boolean }) => {
      if (onQueueStatus) onQueueStatus(status);
    };

    s.on('matchFound', handleMatch);
    if (onQueueStatus) s.on('queueStatus', handleQueue);

    s.emit('findMatch', {
      userId: this.userId,
      name,
      interests,
      blockedUsers
    });

    return () => {
      s.off('matchFound', handleMatch);
      if (onQueueStatus) s.off('queueStatus', handleQueue);
      s.emit('cancelMatch');
    };
  }

  public cancelSearch() {
    if (this.socket) {
      this.socket.emit('cancelMatch');
    }
  }

  public joinChatRoom(
    roomId: string,
    onMessage: (msg: ChatMessage) => void,
    onTyping: (isTyping: boolean) => void,
    onPartnerLeft: () => void
  ): () => void {
    const s = this.connect();
    this.currentRoomId = roomId;

    const formatLocalTime = (createdAt?: number) => {
      const date = (typeof createdAt === 'number' && createdAt > 0) ? new Date(createdAt) : new Date();
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    const handleMessage = (data: { id: string; senderName: string; text: string; timestamp?: string; createdAt?: number }) => {
      // Format incoming message timestamp in the receiver client's local timezone
      const localTime = formatLocalTime(data.createdAt);

      onMessage({
        id: data.id,
        sender: 'partner',
        text: data.text,
        timestamp: localTime
      });
    };

    const handleTyping = (data: { isTyping: boolean }) => {
      onTyping(data.isTyping);
    };

    const handleLeft = () => {
      onPartnerLeft();
    };

    s.on('messageReceived', handleMessage);
    s.on('partnerTyping', handleTyping);
    s.on('partnerLeft', handleLeft);

    return () => {
      s.off('messageReceived', handleMessage);
      s.off('partnerTyping', handleTyping);
      s.off('partnerLeft', handleLeft);
    };
  }

  public sendMessage(text: string, senderName: string): ChatMessage {
    const s = this.connect();
    const now = Date.now();
    const timestamp = new Date(now).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (this.currentRoomId) {
      s.emit('sendMessage', {
        roomId: this.currentRoomId,
        text,
        senderName,
        createdAt: now
      });
    }

    return {
      id: `msg_user_${now}`,
      sender: 'user',
      text,
      timestamp,
      delivered: true
    };
  }

  public sendTyping(isTyping: boolean) {
    if (this.socket && this.currentRoomId) {
      this.socket.emit('typing', {
        roomId: this.currentRoomId,
        isTyping
      });
    }
  }

  public leaveChat() {
    if (this.socket && this.currentRoomId) {
      this.socket.emit('leaveChat', { roomId: this.currentRoomId });
      this.currentRoomId = null;
    }
  }
}

export const socketService = new SocketService();
