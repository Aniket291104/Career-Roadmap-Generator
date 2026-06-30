import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('error', (err: any) => {
  console.error('Redis Error:', err.message || err);
});

export default redis;
