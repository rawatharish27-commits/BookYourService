import { NextRequest } from 'next/server'

// Log levels
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

// Log entry interface
interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  userId?: string
  ip?: string
  userAgent?: string
  path?: string
  method?: string
  statusCode?: number
  duration?: number
  error?: {
    name: string
    message: string
    stack?: string
  }
  metadata?: Record<string, any>
}

// Logger class
class Logger {
  private isProduction = process.env.NODE_ENV === 'production'

  private formatLog(entry: LogEntry): string {
    const baseInfo = `[${entry.timestamp}] ${entry.level}: ${entry.message}`

    const details = [
      entry.userId && `User: ${entry.userId}`,
      entry.ip && `IP: ${entry.ip}`,
      entry.path && `Path: ${entry.path}`,
      entry.method && `Method: ${entry.method}`,
      entry.statusCode && `Status: ${entry.statusCode}`,
      entry.duration && `Duration: ${entry.duration}ms`
    ].filter(Boolean).join(' | ')

    return details ? `${baseInfo} | ${details}` : baseInfo
  }

  private writeLog(level: LogLevel, message: string, metadata?: Partial<LogEntry>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata
    }

    const formattedLog = this.formatLog(entry)

    // In production, you might want to send to a logging service
    // For now, we'll use console with appropriate levels
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog)
        if (entry.error?.stack) {
          console.error(entry.error.stack)
        }
        break
      case LogLevel.WARN:
        console.warn(formattedLog)
        break
      case LogLevel.INFO:
        console.info(formattedLog)
        break
      case LogLevel.DEBUG:
        if (!this.isProduction) {
          console.debug(formattedLog)
        }
        break
    }

    // In production, send to logging service
    if (this.isProduction && level === LogLevel.ERROR) {
      // TODO: Send to error monitoring service (Sentry, etc.)
      this.sendToMonitoring(entry)
    }
  }

  private async sendToMonitoring(entry: LogEntry) {
    // Placeholder for monitoring service integration
    // This could send to Sentry, LogRocket, DataDog, etc.
    try {
      // Example: Send to monitoring service
      // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) })
    } catch {
      // Silently fail if monitoring fails
    }
  }

  error(message: string, metadata?: Partial<LogEntry>) {
    this.writeLog(LogLevel.ERROR, message, metadata)
  }

  warn(message: string, metadata?: Partial<LogEntry>) {
    this.writeLog(LogLevel.WARN, message, metadata)
  }

  info(message: string, metadata?: Partial<LogEntry>) {
    this.writeLog(LogLevel.INFO, message, metadata)
  }

  debug(message: string, metadata?: Partial<LogEntry>) {
    this.writeLog(LogLevel.DEBUG, message, metadata)
  }

  // Request logging middleware
  logRequest(request: NextRequest, startTime: number) {
    const duration = Date.now() - startTime
    const url = new URL(request.url)

    this.info('API Request', {
      path: url.pathname,
      method: request.method,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      duration
    })
  }

  // Response logging
  logResponse(request: NextRequest, statusCode: number, duration: number, userId?: string) {
    const url = new URL(request.url)
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO

    this.writeLog(level, 'API Response', {
      path: url.pathname,
      method: request.method,
      statusCode,
      duration,
      userId,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })
  }

  // Error logging with context
  logError(error: Error, request?: NextRequest, userId?: string, metadata?: Record<string, any>) {
    this.error(error.message, {
      userId,
      path: request ? new URL(request.url).pathname : undefined,
      method: request?.method,
      ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      metadata
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Helper functions for common logging patterns
export const logApiRequest = (request: NextRequest, userId?: string) => {
  const url = new URL(request.url)
  logger.info('API Request Started', {
    path: url.pathname,
    method: request.method,
    userId,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  })
}

export const logApiResponse = (request: NextRequest, statusCode: number, duration: number, userId?: string) => {
  logger.logResponse(request, statusCode, duration, userId)
}

export const logApiError = (error: Error, request?: NextRequest, userId?: string, metadata?: Record<string, any>) => {
  logger.logError(error, request, userId, metadata)
}
