import { Server } from 'socket.io';
import { AuthenticatedSocket, ChatMessage } from '../types/websocket.types';
import { ChatService } from '../services/chat.service';
import { logger } from '../libs/logger.lib';

export class WebSocketHandler {
  private chatService: ChatService;

  constructor(private io: Server) {
    this.chatService = new ChatService();
    this.setupEventHandlers();

    // Cleanup inactive users every 5 minutes
    setInterval(
      () => {
        this.chatService.cleanupInactiveUsers();
      },
      5 * 60 * 1000,
    );
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info(`New socket connection: ${socket.id}`);

      // User authentication and joining
      socket.on(
        'user:join',
        (data: { userId: string; userRole: 'owner' | 'employee'; userName: string }) => {
          this.handleUserJoin(socket, data);
        },
      );

      // Message handling
      socket.on('message:send', (messageData: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>) => {
        this.handleMessageSend(socket, messageData);
      });

      socket.on('message:read', (messageId: string) => {
        this.handleMessageRead(socket, messageId);
      });

      // Room management
      socket.on('room:join', (roomId: string) => {
        this.handleRoomJoin(socket, roomId);
      });

      socket.on('room:leave', (roomId: string) => {
        this.handleRoomLeave(socket, roomId);
      });

      // Typing indicators
      socket.on('typing:start', (roomId: string) => {
        this.handleTypingStart(socket, roomId);
      });

      socket.on('typing:stop', (roomId: string) => {
        this.handleTypingStop(socket, roomId);
      });

      // Disconnection
      socket.on('disconnect', () => {
        this.handleUserDisconnect(socket);
      });
    });
  }

  private handleUserJoin(
    socket: AuthenticatedSocket,
    data: { userId: string; userRole: 'owner' | 'employee'; userName: string },
  ): void {
    try {
      socket.userId = data.userId;
      socket.userRole = data.userRole;
      socket.userName = data.userName;

      this.chatService.addUser(data.userId, socket.id, data.userRole, data.userName);

      // Join user to their rooms
      const userRooms = this.chatService.getUserRooms(data.userId);
      userRooms.forEach((room) => {
        socket.join(room.id);
      });

      // Notify other users about online status
      const userStatus = this.chatService.getUserStatus(data.userId);
      if (userStatus) {
        socket.broadcast.emit('user:status', userStatus);
      }

      logger.info(`User ${data.userName} (${data.userId}) joined chat`);
    } catch (error) {
      logger.error(`Error in user join: ${error}`);
      socket.emit('error:chat', { message: 'Failed to join chat', code: 'JOIN_ERROR' });
    }
  }

  private handleMessageSend(
    socket: AuthenticatedSocket,
    messageData: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>,
  ): void {
    try {
      if (!socket.userId) {
        socket.emit('error:chat', { message: 'User not authenticated', code: 'AUTH_ERROR' });
        return;
      }

      // Validate message data
      if (!messageData.content.trim()) {
        socket.emit('error:chat', {
          message: 'Message content cannot be empty',
          code: 'INVALID_MESSAGE',
        });
        return;
      }

      // Save message
      const savedMessage = this.chatService.saveMessage({
        ...messageData,
        senderId: socket.userId,
        senderName: socket.userName || 'Unknown User',
        senderRole: socket.userRole || 'employee',
      });

      // Determine where to send the message
      let targetRoom = savedMessage.roomId;

      if (savedMessage.recipientId && !targetRoom) {
        // Private message - find or create room
        const room = this.chatService
          .getUserRooms(socket.userId)
          .find((r) => r.type === 'private' && r.participants.includes(savedMessage.recipientId!));

        if (room) {
          targetRoom = room.id;
        }
      }

      if (targetRoom) {
        // Send to room participants
        this.io.to(targetRoom).emit('message:new', savedMessage);
      } else if (savedMessage.recipientId) {
        // Direct private message
        const recipientSocketId = this.chatService.getSocketId(savedMessage.recipientId);
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('message:new', savedMessage);
        }
        socket.emit('message:new', savedMessage); // Echo to sender
      }

      // Stop typing indicator
      if (targetRoom) {
        this.chatService.setUserStoppedTyping(targetRoom, socket.userId);
        socket.to(targetRoom).emit('typing:stop', { userId: socket.userId, roomId: targetRoom });
      }

      socket.emit('message:delivered', savedMessage.id);
      logger.info(
        `Message sent from ${socket.userName} to ${targetRoom || savedMessage.recipientId}`,
      );
    } catch (error) {
      logger.error(`Error sending message: ${error}`);
      socket.emit('error:chat', { message: 'Failed to send message', code: 'SEND_ERROR' });
    }
  }

  private handleMessageRead(socket: AuthenticatedSocket, messageId: string): void {
    try {
      if (!socket.userId) {
        socket.emit('error:chat', { message: 'User not authenticated', code: 'AUTH_ERROR' });
        return;
      }

      const success = this.chatService.markMessageAsRead(messageId, socket.userId);

      if (success) {
        // Notify sender that message was read
        // Note: In production, you might want to emit this to the sender specifically
        socket.broadcast.emit('message:read', messageId);
      }
    } catch (error) {
      logger.error(`Error marking message as read: ${error}`);
    }
  }

  private handleRoomJoin(socket: AuthenticatedSocket, roomId: string): void {
    try {
      if (!socket.userId) {
        socket.emit('error:chat', { message: 'User not authenticated', code: 'AUTH_ERROR' });
        return;
      }

      const room = this.chatService.getRoom(roomId);
      if (!room) {
        socket.emit('error:chat', { message: 'Room not found', code: 'ROOM_NOT_FOUND' });
        return;
      }

      if (!room.participants.includes(socket.userId)) {
        socket.emit('error:chat', {
          message: 'Not authorized to join this room',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      socket.join(roomId);

      // Send recent messages
      const recentMessages = this.chatService.getRoomMessages(roomId, 20);
      socket.emit('room:messages', { roomId, messages: recentMessages });

      logger.info(`User ${socket.userName} joined room ${roomId}`);
    } catch (error) {
      logger.error(`Error joining room: ${error}`);
      socket.emit('error:chat', { message: 'Failed to join room', code: 'JOIN_ROOM_ERROR' });
    }
  }

  private handleRoomLeave(socket: AuthenticatedSocket, roomId: string): void {
    try {
      socket.leave(roomId);
      logger.info(`User ${socket.userName} left room ${roomId}`);
    } catch (error) {
      logger.error(`Error leaving room: ${error}`);
    }
  }

  private handleTypingStart(socket: AuthenticatedSocket, roomId: string): void {
    try {
      if (!socket.userId) return;

      this.chatService.setUserTyping(roomId, socket.userId);
      socket.to(roomId).emit('typing:user', {
        userId: socket.userId,
        userName: socket.userName || 'Unknown User',
        roomId,
      });
    } catch (error) {
      logger.error(`Error handling typing start: ${error}`);
    }
  }

  private handleTypingStop(socket: AuthenticatedSocket, roomId: string): void {
    try {
      if (!socket.userId) return;

      this.chatService.setUserStoppedTyping(roomId, socket.userId);
      socket.to(roomId).emit('typing:stop', {
        userId: socket.userId,
        roomId,
      });
    } catch (error) {
      logger.error(`Error handling typing stop: ${error}`);
    }
  }

  private handleUserDisconnect(socket: AuthenticatedSocket): void {
    try {
      if (socket.userId) {
        this.chatService.removeUser(socket.userId);

        // Notify others about offline status
        const userStatus = this.chatService.getUserStatus(socket.userId);
        if (userStatus) {
          socket.broadcast.emit('user:status', userStatus);
        }

        logger.info(`User ${socket.userName} (${socket.userId}) disconnected`);
      }
    } catch (error) {
      logger.error(`Error handling user disconnect: ${error}`);
    }
  }

  // Public methods for external use
  public getChatService(): ChatService {
    return this.chatService;
  }

  public sendMessageToUser(userId: string, event: string, data: any): void {
    const socketId = this.chatService.getSocketId(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public sendMessageToRoom(roomId: string, event: string, data: any): void {
    this.io.to(roomId).emit(event, data);
  }

  public getActiveUsers() {
    return this.chatService.getActiveUsers();
  }
}
