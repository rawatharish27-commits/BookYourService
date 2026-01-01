
// Fixed: Using default import for db service
import db from './DatabaseService';

export interface CrashLog {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  severity: 'FATAL' | 'WARNING' | 'INFO';
  userId?: string;
  deviceId?: string;
  resolved: boolean;
}

class CrashReportingService {
  private logs: CrashLog[] = [];

  constructor() {
    this.load();
  }

  private load() {
    const saved = localStorage.getItem('DP_CRASH_LOGS');
    if (saved) this.logs = JSON.parse(saved);
  }

  private save() {
    localStorage.setItem('DP_CRASH_LOGS', JSON.stringify(this.logs));
  }

  report(error: Error | string, severity: 'FATAL' | 'WARNING' | 'INFO' = 'WARNING', userId?: string) {
    const deviceId = localStorage.getItem('DP_DEVICE_ID') || 'UNKNOWN';
    const log: CrashLog = {
      id: `ERR_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      timestamp: new Date().toISOString(),
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      severity,
      userId,
      deviceId,
      resolved: false
    };

    this.logs.unshift(log);
    if (this.logs.length > 100) this.logs.pop();
    
    // Log to audit for transparency
    db.audit('SYSTEM', `RUNTIME_CRASH_${severity}`, 'ErrorHandler', { error: log.message }, 'CRITICAL');
    this.save();
    console.error(`[CRASH-HUB] Recorded ${severity} error: ${log.message}`);
  }

  getLogs() {
    return this.logs;
  }

  resolve(logId: string) {
    const log = this.logs.find(l => l.id === logId);
    if (log) {
      log.resolved = true;
      this.save();
    }
  }

  clearAll() {
    this.logs = [];
    this.save();
  }

  getCrashFreeRate(): number {
    if (this.logs.length === 0) return 100;
    const fatal = this.logs.filter(l => l.severity === 'FATAL' && !l.resolved).length;
    return Math.max(0, 100 - (fatal * 5));
  }
}

export const crashReporter = new CrashReportingService();
