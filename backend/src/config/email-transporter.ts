import nodemailer from 'nodemailer';
import { logger } from '../lib/logger';

interface EmailParams {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}
export class EmailTransporter {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter().catch((err) => {
      logger.error('Falha ao criar transporter de email', err);
      throw err;
    });
  }

  private async initTransporter() {
    try {
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      logger.info('📧 Email Strategy: Ethereal Transporter ready');
    } catch (err) {
      logger.error('Falha ao criar transporter de email', err);
    }
  }

  async sendEmail({ from, to, subject, text, html }: EmailParams): Promise<nodemailer.SentMessageInfo> {
    if (!this.transporter) {
      throw new Error('Transporter de email não inicializado');
    }
    return await this.transporter.sendMail({ from, to, subject, text, html });
  }
}

export const emailTransporter = new EmailTransporter();