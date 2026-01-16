import winston from 'winston';
import { format, transports, config } from 'winston';

const devFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...metadata }) => {
    let meta = '';
    for (const [key, value] of Object.entries(metadata)) {
      meta += `${key}=${value} `;
    }
    return `${timestamp} [${level}]: ${message} ${meta}`;
  })
);

const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

const consoleTransport = new transports.Console({
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  level: process.env.LOG_LEVEL || 'debug',
});

const fileTransport = new transports.File({
  filename: 'logs/error.log',
  level: 'error',
  format: prodFormat,
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: {
    service: 'bookyourservice-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    consoleTransport,
    process.env.NODE_ENV === 'production' ? fileTransport : undefined,
  ],
});

logger.info('🚀 BookYourService API Logger Initialized');
