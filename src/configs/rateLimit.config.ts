import Redis from 'ioredis';
import { RateLimiterAbstract, RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { NextFunction, Request, Response } from 'express';

export const createRateLimiter = (): RateLimiterAbstract => {
  if (process.env.REDIS_URL) {
    const client = new Redis(process.env.REDIS_URL);
    return new RateLimiterRedis({
      storeClient: client,
      points: 60,
      duration: 60,
    });
  }
  return new RateLimiterMemory({ points: 60, duration: 60 });
};

export const rateLimiterMiddleware = (limiter: RateLimiterAbstract) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await limiter.consume(req.ip || 'unknown');
      next();
    } catch (rejRes) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        details: rejRes,
      });
    }
  };
};
