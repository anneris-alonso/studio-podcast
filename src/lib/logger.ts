type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LEVEL = (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || 'info';
const APP_ENV = process.env.APP_ENV || 'development';

export const logger = {
  log(level: LogLevel, message: string, meta: any = {}) {
    if (LOG_LEVELS[level] < LOG_LEVELS[CURRENT_LEVEL]) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      env: APP_ENV,
      ...meta,
    };

    // Output as single-line JSON
    console.log(JSON.stringify(logEntry));
  },

  debug(message: string, meta?: any) { this.log('debug', message, meta); },
  info(message: string, meta?: any) { this.log('info', message, meta); },
  warn(message: string, meta?: any) { this.log('warn', message, meta); },
  error(message: string, meta?: any) { this.log('error', message, meta); },
};
