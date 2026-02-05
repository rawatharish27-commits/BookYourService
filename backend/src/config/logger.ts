
import winston from "winston";
import { env } from "./env";

/**
 * 📊 PHASE 9: STRUCTURED LOGGING
 * Standardizes log output for ELK/Datadog/CloudWatch ingestion.
 */
const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const devFormat = printf(({ level, message, timestamp, requestId, stack, ...meta }) => {
  return `${timestamp} [${requestId || 'system'}] ${level}: ${stack || message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'bys-backend' },
  transports: [
    new winston.transports.Console({
      format: env.NODE_ENV === "production" 
        ? combine(timestamp(), json()) 
        : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), devFormat)
    }),
  ],
});
