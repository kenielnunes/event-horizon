import winston from 'winston';

// Definição de níveis de severidade (padrão RFC5424)
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  // Adiciona timestamp a todos os logs
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  
  // Garante que erros com stack trace sejam serializados corretamente no JSON
  winston.format.errors({ stack: true }),
  
  // Suporte a splat (interpolação de string tipo %s)
  winston.format.splat(),
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      // Se for PROD, usa JSON 
      // Se for DEV, usa Colorize + Simple 
      process.env.NODE_ENV === 'production'
        ? winston.format.json() 
        : winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.printf(
              (info) => `${info.timestamp} ${info.level}: ${info.message} ${info.stack || ''} ${Object.keys(info).length > 3 ? JSON.stringify(info.metadata) : ''}`
            )
          )
    ),
  }),
];

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
});