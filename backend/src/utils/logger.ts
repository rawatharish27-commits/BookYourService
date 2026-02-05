
import { env } from "../config/env";

const formatLog = (level: string, message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const requestId = meta?.requestId || 'system';
    
    // Structure for Datadog/ELK/CloudWatch
    const logEntry = {
        level,
        timestamp,
        requestId,
        message,
        ...meta
    };

    if (env.NODE_ENV === 'development') {
        return `[${level}] ${timestamp} [${requestId}] - ${message} ${meta && meta.error ? JSON.stringify(meta.error) : ''}`;
    }
    return JSON.stringify(logEntry);
};

export const logger = {
  info: (msg: string, meta?: any) => console.log(formatLog('INFO', msg, meta)),
  error: (msg: string, meta?: any) => console.error(formatLog('ERROR', msg, meta)),
  warn: (msg: string, meta?: any) => console.warn(formatLog('WARN', msg, meta))
};
