import { IActionStrategy } from './interface';
import { SendEmailStrategy } from './strategies/send-email.strategy';
import { WebhookStrategy } from './strategies/webhook.strategy';

const strategies: Record<string, IActionStrategy> = {
  'send_email': new SendEmailStrategy(),
  'webhook': new WebhookStrategy(),
};

export class ActionFactory {
  static get(type: string): IActionStrategy {
    const strategy = strategies[type];

    if (!strategy) {
      throw new Error(`Ação tipo '${type}' não implementada.`);
    }

    return strategy;
  }
}