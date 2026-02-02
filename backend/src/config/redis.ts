import { ConnectionOptions } from 'bullmq';
import 'dotenv/config';

export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times: number) => {
    // Tenta reconectar com atraso crescente, até o máximo de 2s
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  // Evita crash se o Redis não estiver pronto no boot imediato
  maxRetriesPerRequest: null, 
};

export const QUEUE_NAME = 'event-horizon-queue';