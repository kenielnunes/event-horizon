import { EventStatus, Level } from '../../prisma/generated/prisma/enums';
import { ActionFactory } from '../core/actions';
import { RuleEngine } from '../core/engine';
import { eventQueue } from '../jobs/queues';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';

class EventService {
  /**
   * Executa o ciclo de vida completo de processamento de um evento.
   */
  async processEvent(eventId: string): Promise<void> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      logger.error(`Evento ID ${eventId} não encontrado durante o processamento.`);
      return;
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { 
        status: EventStatus.PROCESSING,
        logs: { create: { level: Level.INFO, message: 'Processamento iniciado' } }
      }
    });

    try {
      // Busca Regras Dinâmicas
      const rules = await prisma.rule.findMany({
        where: { 
          targetType: event.type, 
          isActive: true 
        }
      });

      const appliedRules = [];

      // Avaliação de Regras
      for (const rule of rules) {
        const condition = rule.condition as any; 
        
        const isMatch = RuleEngine.evaluate(event.payload, condition);

        if (isMatch) {
          logger.info(`Rule matched`, { ruleId: rule.id, eventId });
          
          await this.dispatchAction(rule.action, (event.payload));
          
          appliedRules.push(rule.id);
          
          // Log de Auditoria no Banco
          await prisma.eventLog.create({
            data: {
              eventId,
              level: Level.INFO,
              message: `Regra ${rule.id} aplicada. Ação executada.`
            }
          });
        }
      }

      await prisma.event.update({
        where: { id: eventId },
        data: { 
          status: EventStatus.PROCESSED,
          updatedAt: new Date(),
          logs: { 
            create: { 
              level: Level.INFO, 
              message: `Processado com sucesso. Regras aplicadas: ${appliedRules.length}` 
            } 
          }
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error(`Falha no processamento do evento ${eventId}`, error);

      await prisma.event.update({
        where: { id: eventId },
        data: { 
          status: EventStatus.FAILED,
          logs: { 
            create: { 
              level: Level.ERROR, 
              message: `Falha no processamento: ${errorMessage}` 
            } 
          }
        }
      });
    }
  }

  async ingestEvent(externalId: string, type: string, payload: any): Promise<string> {
    const existing = await prisma.event.findFirst({ where: { externalId } });
    
    const event = await prisma.event.create({
      data: {
        externalId,
        type,
        payload: payload ?? {}, // Garante que não seja undefined
        status: EventStatus.RECEIVED,
        logs: {
          create: { level: Level.INFO, message: existing ? 'Duplicado: Evento recebido' : 'Evento recebido' }
        }
      }
    });

    await eventQueue.add('process-event', { eventId: event.id });

    return event.id;
  }

  async replayEvent(eventId: string): Promise<void> {
    try {
      const event = await prisma.event.findUnique({ where: { id: eventId } });

      if (!event) {
        logger.error(`Evento não encontrado para o replay manual`);
        return;
      }

      // Resetar status para RECEIVED
      await prisma.event.update({
        where: { id: eventId },
        data: {
          status: EventStatus.RECEIVED,
          attempts: (event.attempts || 0) + 1,
          logs: {
            create: {
              level: Level.WARN,
              message: 'Replay manual via Console'
            }
          }
        }
      });

      // Enviar novamente para a fila
      await eventQueue.add('process-event', { eventId: event.id });
    } catch (error) {
      logger.error('Replay manual falhou', error);
    }
  }

  async getAllEvents() {
    try {
      const events = await prisma.event.findMany({
        include: {
          logs: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return events
    } catch (error) {
      logger.error(`Falha ao buscar eventos`, error)
    }
  }

  /**
   * Dispara a execução de ações (Webhook, Email, etc).
   */
  private async dispatchAction(actionConfig: any, payload: any): Promise<void> {
    const { type, ...params } = actionConfig;

    logger.info(`Disparando ação tipo: ${type}`);

    // Simulação de falha
    if (type === 'simulate_failure') {
      throw new Error('Falha simulada por regra de teste! (Chaos Testing)');
    }
    
    const strategy = ActionFactory.get(type);

    logger.info(`Executando estratégia`);
    
    await strategy.execute(payload, params);
  }
}

export const eventService = new EventService();