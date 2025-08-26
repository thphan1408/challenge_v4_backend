import { ENV } from '@/configs/env.config';
import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;
  constructor() {
    this.redis = new Redis(ENV.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      password: 'root',
    });

    this.redis.on('error', (err) => {
    });

    this.redis.on('connect', () => {
    });
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.setex(key, ttl, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }
}
