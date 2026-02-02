import nodemailer from 'nodemailer';
import { emailTransporter } from '../../../config/email-transporter';
import { logger } from '../../../lib/logger';
import { IActionStrategy } from '../interface';

interface EmailParams {
  to: string;
  subject?: string;
  text?: string;
}

interface OrderPayload {
  id: string;
  total: number;
  user: {
    name: string;
    email: string;
  };
}

export class SendEmailStrategy implements IActionStrategy<OrderPayload, EmailParams> {
  async execute(payload: OrderPayload, params: EmailParams): Promise<void> {

    logger.info(`Enviando email para: ${params}`, { payload });
    if (!params.to) {
      throw new Error("Ação 'send_email' faltando parâmetro obrigatório: 'to'");
    }
    const subject = params.subject || 'Notificação do Sistema';
    
    // Monta um corpo de email simples usando dados do payload
    const textContent = params.text 
      ? params.text 
      : `Olá ${payload.user?.name || 'Cliente'}.\n\nPayload completo:\n${JSON.stringify(payload, null, 2)}`;

      const info = await emailTransporter.sendEmail(
        {
          from: '"Event Horizon" <no-reply@horizon.com>',
          to: params.to,
          subject: subject,
          text: textContent,
          html: `<p>${textContent.replace(/\n/g, '<br>')}</p>`,
        }
      );

      const previewUrl = nodemailer.getTestMessageUrl(info);
      
      logger.info(`📧 Email enviado para ${params.to}. URL de visualização: ${previewUrl}`);  
  }
}