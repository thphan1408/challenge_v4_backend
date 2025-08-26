import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: 'owner' | 'employee';
  userName?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'owner' | 'employee';
  recipientId?: string; // For private messages
  roomId?: string; // For group chats
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Date;
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'private' | 'group';
  participants: string[]; // User IDs
  ownerId: string;
  createdAt: Date;
  lastMessage?: ChatMessage;
}

export interface UserStatus {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
}

export interface SocketEvents {
  // Client to Server
  'user:join': (data: { userId: string; userRole: 'owner' | 'employee'; userName: string }) => void;
  'message:send': (message: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>) => void;
  'message:read': (messageId: string) => void;
  'room:join': (roomId: string) => void;
  'room:leave': (roomId: string) => void;
  'typing:start': (roomId: string) => void;
  'typing:stop': (roomId: string) => void;

  // Server to Client
  'message:new': (message: ChatMessage) => void;
  'message:delivered': (messageId: string) => void;
  'user:status': (status: UserStatus) => void;
  'typing:user': (data: { userId: string; userName: string; roomId: string }) => void;
  'error:chat': (error: { message: string; code: string }) => void;
}

export interface ServerToClientEvents extends SocketEvents {}
export interface ClientToServerEvents extends SocketEvents {}
