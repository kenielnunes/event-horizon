import { Request, Response } from "express";
import { eventQueue } from "../jobs/queues";
import { eventService } from "../services/event.service";

export class EventController {
  async ingestEvent(req: Request, res: Response) {
    const { externalId, type, payload } = req.body; 

    try {
      const eventId = await eventService.ingestEvent(externalId, type, payload);
      res.status(202).json({ id: eventId, status: 'queued' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao ingerir evento' });
    } 
  }

  async replayEvent(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    try {
      await eventService.replayEvent(id);
      res.status(200).json({ status: 'replayed' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao re-enviar evento' });
    }
  }

  async getAllEvents(req: Request, res: Response) {
    const events = await eventService.getAllEvents();
    return res.status(200).json(events);
  }

  async getWorkerHealth(req: Request, res: Response) {
    try {
      const workerCount = await eventQueue.getWorkersCount();

      const isHealthy = workerCount > 0;

      const statusData = {
        status: isHealthy ? 'ok' : 'error',
        service: 'event-worker',
      };

      return res.status(isHealthy ? 200 : 503).json(statusData);

    } catch (error) {
      return res.status(500).json({ error: 'Falha ao conectar com o Redis para verificar workers' });
    }
  }
}

export const eventController = new EventController();