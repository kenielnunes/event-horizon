import cors from 'cors';
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { eventController } from './controllers/event.controller';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json());

app.use('/api-docs', swaggerUi.serve);
app.use('/api-docs', swaggerUi.setup(swaggerSpec));

// Middleware de Log
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`, { ip: req.ip });
  next();
});

logger.info(`📚 Swagger disponível em http://localhost:${PORT}/api-docs/`);

// Rotas
app.post('/events', eventController.ingestEvent);
app.get('/events', eventController.getAllEvents);
app.post('/events/:id/replay', eventController.replayEvent);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ error: 'Erro Interno do Servidor' });
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 API Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

const gracefulShutdown = async () => {
  logger.info('SIGTERM/SIGINT recebido. Fechando servidor HTTP...');
  
  server.close(async () => {
    logger.info('Servidor HTTP fechado.');
    
    try {
      await prisma.$disconnect();
      logger.info('Prisma desconectado.');
      process.exit(0);
    } catch (err) {
      logger.error('Erro durante o shutdown', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);