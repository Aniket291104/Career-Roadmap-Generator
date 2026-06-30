import { createClient } from 'redis';

type RedisClientType = ReturnType<typeof createClient>;

class CacheService {
  private client: RedisClientType | null = null;
  private memoryCache = new Map<string, { value: string; expiry: number }>();
  private useMemory = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.log('No REDIS_URL found. Falling back to memory cache.');
      this.useMemory = true;
      return;
    }

    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.useMemory = true;
    });

    this.client.on('connect', () => {
      console.log('Redis connected successfully.');
      this.useMemory = false;
    });
  }

  async connect(): Promise<void> {
    if (this.useMemory || !this.client) return;
    try {
      await this.client.connect();
    } catch (err) {
      console.error('Failed to connect to Redis. Using memory cache fallback.', err);
      this.useMemory = true;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.useMemory || !this.client) {
      const item = this.memoryCache.get(key);
      if (!item) return null;
      if (item.expiry < Date.now()) {
        this.memoryCache.delete(key);
        return null;
      }
      return item.value;
    }
    return this.client.get(key);
  }

  async set(key: string, value: string, expiryInSeconds = 3600): Promise<void> {
    if (this.useMemory || !this.client) {
      this.memoryCache.set(key, {
        value,
        expiry: Date.now() + expiryInSeconds * 1000,
      });
      return;
    }
    await this.client.set(key, value, { EX: expiryInSeconds });
  }

  async del(key: string): Promise<void> {
    if (this.useMemory || !this.client) {
      this.memoryCache.delete(key);
      return;
    }
    await this.client.del(key);
  }
}

export const cache = new CacheService();
