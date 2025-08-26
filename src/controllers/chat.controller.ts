import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { WebSocketHandler } from '../handlers/websocket.handler';
import { logger } from '../libs/logger.lib';

export class ChatController extends BaseController {
  private wsHandler: WebSocketHandler;

  constructor(wsHandler: WebSocketHandler) {
    super();
    this.wsHandler = wsHandler;
  }

  // Get user's chat rooms
  public getUserRooms = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        this.sendError(res, 'User ID is required', 400);
        return;
      }

      const chatService = this.wsHandler.getChatService();
      const rooms = chatService.getUserRooms(userId);

      this.sendSuccess(res, {
        rooms: rooms.map((room) => ({
          id: room.id,
          name: room.name,
          type: room.type,
          participants: room.participants,
          ownerId: room.ownerId,
          createdAt: room.createdAt,
          lastMessage: room.lastMessage,
        })),
      });
    } catch (error) {
      logger.error(`Error getting user rooms: ${error}`);
      this.sendError(res, 'Failed to get user rooms', 500);
    }
  };

  // Get messages for a specific room
  public getRoomMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roomId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      if (!roomId) {
        this.sendError(res, 'Room ID is required', 400);
        return;
      }

      const chatService = this.wsHandler.getChatService();
      const room = chatService.getRoom(roomId);

      if (!room) {
        this.sendError(res, 'Room not found', 404);
        return;
      }

      const messages = chatService.getRoomMessages(roomId, Number(limit), Number(offset));

      this.sendSuccess(res, {
        roomId,
        messages,
        total: messages.length,
      });
    } catch (error) {
      logger.error(`Error getting room messages: ${error}`);
      this.sendError(res, 'Failed to get room messages', 500);
    }
  };

  // Create a new chat room
  public createRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ownerId, name, type, participants } = req.body;

      if (!ownerId || !name || !type) {
        this.sendError(res, 'Owner ID, name, and type are required', 400);
        return;
      }

      if (!['private', 'group'].includes(type)) {
        this.sendError(res, 'Type must be either "private" or "group"', 400);
        return;
      }

      const chatService = this.wsHandler.getChatService();
      const room = chatService.createRoom(ownerId, name, type, participants || []);

      this.sendSuccess(res, {
        room: {
          id: room.id,
          name: room.name,
          type: room.type,
          participants: room.participants,
          ownerId: room.ownerId,
          createdAt: room.createdAt,
        },
      });

      logger.info(`Room "${name}" created by user ${ownerId}`);
    } catch (error) {
      logger.error(`Error creating room: ${error}`);
      this.sendError(res, 'Failed to create room', 500);
    }
  };

  // Add user to room
  public addUserToRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roomId } = req.params;
      const { userId } = req.body;

      if (!roomId || !userId) {
        this.sendError(res, 'Room ID and User ID are required', 400);
        return;
      }

      const chatService = this.wsHandler.getChatService();
      const room = chatService.getRoom(roomId);

      if (!room) {
        this.sendError(res, 'Room not found', 404);
        return;
      }

      const success = chatService.addUserToRoom(roomId, userId);

      if (success) {
        this.sendSuccess(res, { message: 'User added to room successfully' });

        // Notify room participants
        this.wsHandler.sendMessageToRoom(roomId, 'room:user_joined', {
          roomId,
          userId,
          message: 'A new user joined the room',
        });

        logger.info(`User ${userId} added to room ${roomId}`);
      } else {
        this.sendError(res, 'User is already in the room', 400);
      }
    } catch (error) {
      logger.error(`Error adding user to room: ${error}`);
      this.sendError(res, 'Failed to add user to room', 500);
    }
  };

  // Remove user from room
  public removeUserFromRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roomId } = req.params;
      const { userId } = req.body;

      if (!roomId || !userId) {
        this.sendError(res, 'Room ID and User ID are required', 400);
        return;
      }

      const chatService = this.wsHandler.getChatService();
      const room = chatService.getRoom(roomId);

      if (!room) {
        this.sendError(res, 'Room not found', 404);
        return;
      }

      const success = chatService.removeUserFromRoom(roomId, userId);

      if (success) {
        this.sendSuccess(res, { message: 'User removed from room successfully' });

        // Notify room participants
        this.wsHandler.sendMessageToRoom(roomId, 'room:user_left', {
          roomId,
          userId,
          message: 'A user left the room',
        });

        logger.info(`User ${userId} removed from room ${roomId}`);
      } else {
        this.sendError(res, 'User is not in the room', 400);
      }
    } catch (error) {
      logger.error(`Error removing user from room: ${error}`);
      this.sendError(res, 'Failed to remove user from room', 500);
    }
  };

  // Get active users
  public getActiveUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const activeUsers = this.wsHandler.getActiveUsers();

      this.sendSuccess(res, {
        activeUsers,
        count: activeUsers.length,
      });
    } catch (error) {
      logger.error(`Error getting active users: ${error}`);
      this.sendError(res, 'Failed to get active users', 500);
    }
  };

  // Send message to specific user (for admin purposes)
  public sendDirectMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, message, senderId, senderName } = req.body;

      if (!userId || !message || !senderId || !senderName) {
        this.sendError(res, 'User ID, message, sender ID, and sender name are required', 400);
        return;
      }

      this.wsHandler.sendMessageToUser(userId, 'message:direct', {
        senderId,
        senderName,
        content: message,
        timestamp: new Date(),
        type: 'admin',
      });

      this.sendSuccess(res, { message: 'Direct message sent successfully' });
      logger.info(`Direct message sent from ${senderName} to user ${userId}`);
    } catch (error) {
      logger.error(`Error sending direct message: ${error}`);
      this.sendError(res, 'Failed to send direct message', 500);
    }
  };

  // Get room details
  public getRoomDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roomId } = req.params;

      if (!roomId) {
        this.sendError(res, 'Room ID is required', 400);
        return;
      }

      const chatService = this.wsHandler.getChatService();
      const room = chatService.getRoom(roomId);

      if (!room) {
        this.sendError(res, 'Room not found', 404);
        return;
      }

      this.sendSuccess(res, {
        room: {
          id: room.id,
          name: room.name,
          type: room.type,
          participants: room.participants,
          ownerId: room.ownerId,
          createdAt: room.createdAt,
          lastMessage: room.lastMessage,
        },
      });
    } catch (error) {
      logger.error(`Error getting room details: ${error}`);
      this.sendError(res, 'Failed to get room details', 500);
    }
  };
}
