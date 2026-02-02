import 'dotenv/config';
import { eventWorker } from './jobs/event.worker';
import { logger } from './lib/logger';

async function start() {
  logger.info('🚀 Worker Service Initialized');
  logger.info(`Listening to queue: ${eventWorker.name}`);
}

start();

// termina os jobs atuais antes de parar o worker.
const shutdown = async () => {
  logger.info('SIGTERM/SIGINT received. Shutting down worker...');
  await eventWorker.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);