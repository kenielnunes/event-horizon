import { Request, Response } from "express";
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
}

export const eventController = new EventController();