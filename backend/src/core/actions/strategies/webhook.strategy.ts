import axios from 'axios';
import { logger } from '../../../lib/logger';
import { IActionStrategy } from '../interface';

interface WebhookParams {
  url: string;
  method?: 'GET' | 'POST' | 'PUT';
  headers?: Record<string, string>;
}

export class WebhookStrategy implements IActionStrategy<any, WebhookParams> {

  async execute(payload: any, params: WebhookParams): Promise<void> {
    if (!params.url) {
      throw new Error("Ação 'webhook' faltando parâmetro obrigatório: 'url'");
    }

    const method = params.method || 'POST';

    logger.info(`🔗 Enviando Webhook [${method}] ${params.url}`);

    try {
      await axios({
        method,
        url: params.url,
        data: payload,
        headers: params.headers,
        timeout: 5000
      });
    } catch (error: any) {
      throw new Error(`Webhook falhou: ${error.message}`);
    }
  }
}