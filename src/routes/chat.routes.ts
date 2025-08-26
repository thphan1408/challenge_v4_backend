import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { WebSocketHandler } from '../handlers/websocket.handler';

export const createChatRoutes = (wsHandler: WebSocketHandler): Router => {
  const router = Router();
  const chatController = new ChatController(wsHandler);

  /**
   * @swagger
   * /api/chat/rooms/{userId}:
   *   get:
   *     summary: Get user's chat rooms
   *     tags: [Chat]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: Successfully retrieved user rooms
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     rooms:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                           name:
   *                             type: string
   *                           type:
   *                             type: string
   *                             enum: [private, group]
   *                           participants:
   *                             type: array
   *                             items:
   *                               type: string
   *                           ownerId:
   *                             type: string
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   */
  router.get('/rooms/:userId', chatController.getUserRooms);

  /**
   * @swagger
   * /api/chat/rooms/{roomId}/messages:
   *   get:
   *     summary: Get messages for a specific room
   *     tags: [Chat]
   *     parameters:
   *       - in: path
   *         name: roomId
   *         required: true
   *         schema:
   *           type: string
   *         description: Room ID
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Number of messages to retrieve
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Number of messages to skip
   *     responses:
   *       200:
   *         description: Successfully retrieved room messages
   */
  router.get('/rooms/:roomId/messages', chatController.getRoomMessages);

  /**
   * @swagger
   * /api/chat/rooms:
   *   post:
   *     summary: Create a new chat room
   *     tags: [Chat]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - ownerId
   *               - name
   *               - type
   *             properties:
   *               ownerId:
   *                 type: string
   *                 description: ID of the room owner
   *               name:
   *                 type: string
   *                 description: Name of the room
   *               type:
   *                 type: string
   *                 enum: [private, group]
   *                 description: Type of the room
   *               participants:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Array of participant user IDs
   *     responses:
   *       200:
   *         description: Room created successfully
   */
  router.post('/rooms', chatController.createRoom);

  /**
   * @swagger
   * /api/chat/rooms/{roomId}/users:
   *   post:
   *     summary: Add user to room
   *     tags: [Chat]
   *     parameters:
   *       - in: path
   *         name: roomId
   *         required: true
   *         schema:
   *           type: string
   *         description: Room ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *             properties:
   *               userId:
   *                 type: string
   *                 description: User ID to add to the room
   *     responses:
   *       200:
   *         description: User added to room successfully
   */
  router.post('/rooms/:roomId/users', chatController.addUserToRoom);

  /**
   * @swagger
   * /api/chat/rooms/{roomId}/users:
   *   delete:
   *     summary: Remove user from room
   *     tags: [Chat]
   *     parameters:
   *       - in: path
   *         name: roomId
   *         required: true
   *         schema:
   *           type: string
   *         description: Room ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *             properties:
   *               userId:
   *                 type: string
   *                 description: User ID to remove from the room
   *     responses:
   *       200:
   *         description: User removed from room successfully
   */
  router.delete('/rooms/:roomId/users', chatController.removeUserFromRoom);

  /**
   * @swagger
   * /api/chat/rooms/{roomId}:
   *   get:
   *     summary: Get room details
   *     tags: [Chat]
   *     parameters:
   *       - in: path
   *         name: roomId
   *         required: true
   *         schema:
   *           type: string
   *         description: Room ID
   *     responses:
   *       200:
   *         description: Successfully retrieved room details
   */
  router.get('/rooms/:roomId', chatController.getRoomDetails);

  /**
   * @swagger
   * /api/chat/users/active:
   *   get:
   *     summary: Get list of active users
   *     tags: [Chat]
   *     responses:
   *       200:
   *         description: Successfully retrieved active users
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     activeUsers:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           userId:
   *                             type: string
   *                           status:
   *                             type: string
   *                             enum: [online, offline, away]
   *                           lastSeen:
   *                             type: string
   *                             format: date-time
   *                     count:
   *                       type: integer
   */
  router.get('/users/active', chatController.getActiveUsers);

  /**
   * @swagger
   * /api/chat/messages/direct:
   *   post:
   *     summary: Send direct message to user (admin)
   *     tags: [Chat]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - message
   *               - senderId
   *               - senderName
   *             properties:
   *               userId:
   *                 type: string
   *                 description: Recipient user ID
   *               message:
   *                 type: string
   *                 description: Message content
   *               senderId:
   *                 type: string
   *                 description: Sender user ID
   *               senderName:
   *                 type: string
   *                 description: Sender name
   *     responses:
   *       200:
   *         description: Direct message sent successfully
   */
  router.post('/messages/direct', chatController.sendDirectMessage);

  return router;
};
