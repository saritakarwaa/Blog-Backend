import Redis from 'ioredis';
import dotenv from 'dotenv'

dotenv.config()
const redis = new Redis({
  host:  process.env.REDIS_HOST || 'redis' , // Redis server address
  port: parseInt(process.env.REDIS_PORT || '6379'),         // Redis default port
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redis;
