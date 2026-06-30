import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // Limit reconnect attempts to 3 to prevent log flooding in local development
      if (retries > 3) {
        return false; // Stop reconnect attempts
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

redis.on('error', (err: any) => {
  console.error('Redis Error:', err.message || err);
});

export default redis;
