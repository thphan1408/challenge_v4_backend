import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { ENV } from './env.config';

export interface SocketConfig {
  cors: {
    origin: string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
  pingTimeout: number;
  pingInterval: number;
}

export const socketConfig: SocketConfig = {
  cors: {
    origin:
      ENV.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:5173'] : [], // Add production origins
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
};

export const createSocketIOServer = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, socketConfig);

  console.log('🔌 WebSocket server initialized');

  return io;
};
