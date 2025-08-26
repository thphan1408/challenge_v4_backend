import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';

import { CORS_WHITELIST } from './configs/env.config';
import { createRootRouter } from './routes/root.routes';
import { logger } from './libs/logger.lib';
import { requestId } from './middlewares/requestId.middleware';
import { createRateLimiter, rateLimiterMiddleware } from './configs/rateLimit.config';
import { mountSwagger } from './configs/swagger.config';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (!CORS_WHITELIST.length || CORS_WHITELIST.includes(origin)) return cb(null, true);
      cb(new Error('CORS not allowed'));
    },
    credentials: true,
  }),
);
app.use(requestId);

const limiter = createRateLimiter();
app.use('/owner/create-access-code', rateLimiterMiddleware(limiter));
app.use('/employee/login-email', rateLimiterMiddleware(limiter));

app.get('/health', (_req, res) => res.json({ ok: true }));

// Function to setup routes with WebSocket handler
(app as any).setupRoutes = (wsHandler?: any) => {
  const rootRouter = createRootRouter(wsHandler);
  app.use('/api', rootRouter);
};

// Setup initial routes without WebSocket
(app as any).setupRoutes();

mountSwagger(app);
app.use(errorHandler);

export default app;
