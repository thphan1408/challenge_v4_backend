import { ChatMessage, ChatRoom, UserStatus } from '../types/websocket.types';
import { v4 as uuidv4 } from 'uuid';

export class ChatService {
  private activeUsers: Map<string, UserStatus> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private chatRooms: Map<string, ChatRoom> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map(); // roomId -> messages
  private typingUsers: Map<string, Set<string>> = new Map(); // roomId -> Set<userId>

  // User management
  addUser(
    userId: string,
    socketId: string,
    userRole: 'owner' | 'employee',
    userName: string,
  ): void {
    this.userSockets.set(userId, socketId);
    this.activeUsers.set(userId, {
      userId,
      status: 'online',
      lastSeen: new Date(),
    });
  }

  removeUser(userId: string): void {
    this.userSockets.delete(userId);
    const userStatus = this.activeUsers.get(userId);
    if (userStatus) {
      userStatus.status = 'offline';
      userStatus.lastSeen = new Date();
    }
  }

  getUserStatus(userId: string): UserStatus | undefined {
    return this.activeUsers.get(userId);
  }

  getActiveUsers(): UserStatus[] {
    return Array.from(this.activeUsers.values()).filter((user) => user.status === 'online');
  }

  getSocketId(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }

  // Room management
  createRoom(
    ownerId: string,
    name: string,
    type: 'private' | 'group',
    participants: string[],
  ): ChatRoom {
    const roomId = uuidv4();
    const room: ChatRoom = {
      id: roomId,
      name,
      type,
      participants: [ownerId, ...participants],
      ownerId,
      createdAt: new Date(),
    };

    this.chatRooms.set(roomId, room);
    this.messages.set(roomId, []);
    return room;
  }

  getRoom(roomId: string): ChatRoom | undefined {
    return this.chatRooms.get(roomId);
  }

  getUserRooms(userId: string): ChatRoom[] {
    return Array.from(this.chatRooms.values()).filter((room) => room.participants.includes(userId));
  }

  addUserToRoom(roomId: string, userId: string): boolean {
    const room = this.chatRooms.get(roomId);
    if (room && !room.participants.includes(userId)) {
      room.participants.push(userId);
      return true;
    }
    return false;
  }

  removeUserFromRoom(roomId: string, userId: string): boolean {
    const room = this.chatRooms.get(roomId);
    if (room) {
      const index = room.participants.indexOf(userId);
      if (index > -1) {
        room.participants.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  // Message management
  saveMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>): ChatMessage {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
      isRead: false,
    };

    // Determine room ID
    let roomId = message.roomId;
    if (!roomId && message.recipientId) {
      // Create or find private room
      roomId = this.getOrCreatePrivateRoom(message.senderId, message.recipientId);
    }

    if (roomId) {
      const messages = this.messages.get(roomId) || [];
      messages.push(newMessage);
      this.messages.set(roomId, messages);

      // Update room's last message
      const room = this.chatRooms.get(roomId);
      if (room) {
        room.lastMessage = newMessage;
      }
    }

    return newMessage;
  }

  getRoomMessages(roomId: string, limit: number = 50, offset: number = 0): ChatMessage[] {
    const messages = this.messages.get(roomId) || [];
    return messages.slice(-limit - offset, -offset || undefined).reverse();
  }

  markMessageAsRead(messageId: string, userId: string): boolean {
    for (const messages of this.messages.values()) {
      const message = messages.find((m) => m.id === messageId);
      if (message && (message.recipientId === userId || message.senderId === userId)) {
        message.isRead = true;
        return true;
      }
    }
    return false;
  }

  // Typing indicators
  setUserTyping(roomId: string, userId: string): void {
    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }
    this.typingUsers.get(roomId)!.add(userId);
  }

  setUserStoppedTyping(roomId: string, userId: string): void {
    const typingInRoom = this.typingUsers.get(roomId);
    if (typingInRoom) {
      typingInRoom.delete(userId);
    }
  }

  getTypingUsers(roomId: string): string[] {
    return Array.from(this.typingUsers.get(roomId) || []);
  }

  // Private room helper
  private getOrCreatePrivateRoom(userId1: string, userId2: string): string {
    // Find existing private room between these users
    const existingRoom = Array.from(this.chatRooms.values()).find(
      (room) =>
        room.type === 'private' &&
        room.participants.length === 2 &&
        room.participants.includes(userId1) &&
        room.participants.includes(userId2),
    );

    if (existingRoom) {
      return existingRoom.id;
    }

    // Create new private room
    const newRoom = this.createRoom(userId1, `Private Chat`, 'private', [userId2]);
    return newRoom.id;
  }

  // Cleanup methods
  cleanupInactiveUsers(): void {
    const cutoffTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes

    for (const [userId, status] of this.activeUsers.entries()) {
      if (status.status === 'offline' && status.lastSeen < cutoffTime) {
        this.activeUsers.delete(userId);
      }
    }
  }
}
