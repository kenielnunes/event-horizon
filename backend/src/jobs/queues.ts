import { Queue } from 'bullmq';
import { QUEUE_NAME, redisConnection } from '../config/redis';

export const eventQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    // Se falhar, tenta 3 vezes com espera exponencial (1s, 2s, 4s...)
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    // Remove jobs completados
    removeOnComplete: {
      age: 24 * 3600, // Mantém por 24h
      count: 1000,    // Mantém os últimos 1000
    },
    removeOnFail: {
      age: 7 * 24 * 3600 // Mantém falhas por 7 dias para auditoria
    }
  },
});