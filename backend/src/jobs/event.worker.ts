import { Job, Worker } from 'bullmq';
import { QUEUE_NAME, redisConnection } from '../config/redis';
import { logger } from '../lib/logger';
import { eventService } from '../services/event.service';

interface EventJobData {
  eventId: string;
}

export const eventWorker = new Worker<EventJobData>(
  QUEUE_NAME,
  async (job: Job<EventJobData>) => {
    const { eventId } = job.data;
    
    logger.info(`[Worker] Iniciando job ${job.id} para evento ${eventId}`);

    await eventService.processEvent(eventId);

    logger.info(`[Worker] Finalizado job ${job.id}`);
  },
  {
    connection: redisConnection,
    concurrency: 5,
    // Rate Limiting
    limiter: {
      max: 100,
      duration: 1000, // Max 100 jobs por segundo
    }
  }
);

// Listeners de Eventos do Worker 
eventWorker.on('completed', (job) => {
  logger.debug(`[Worker] Job ${job.id} finalizado com sucesso`);
});

eventWorker.on('failed', (job, err) => {
  logger.error(`[Worker] Job ${job?.id} falhou: ${err.message}`, { 
    stack: err.stack, 
    eventId: job?.data.eventId 
  });
});

eventWorker.on('error', (err) => {
  logger.error(`[Worker] Erro de infraestrutura: ${err.message}`);
});