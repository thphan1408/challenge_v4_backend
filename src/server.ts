import { createServer } from 'http';
import app from './app';
import { Server } from 'http';
import { CORS_WHITELIST, ENV } from './configs/env.config';
import { logger } from './libs/logger.lib';
import { createSocketIOServer } from './configs/websocket.config';
import { WebSocketHandler } from './handlers/websocket.handler';

const httpServer = createServer(app);

// Initialize Socket.IO server
const io = createSocketIOServer(httpServer);

// Initialize WebSocket handler
const wsHandler = new WebSocketHandler(io);

// Setup routes with WebSocket handler
(app as any).setupRoutes(wsHandler);

httpServer.listen(ENV.PORT, () =>
  logger.info({ port: ENV.PORT }, 'Server is running with WebSocket support'),
);
