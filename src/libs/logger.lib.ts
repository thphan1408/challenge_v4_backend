import pino from 'pino';
import { ENV } from '@/configs/env.config';

export const logger = pino({
  level: ENV.LOG_LEVEL,
  base: undefined,
  transport: ENV.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});
