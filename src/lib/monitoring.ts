/**
 * Système de monitoring et logging pour l'application
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private enableConsole = true;

  /**
   * Log un message avec un niveau de sévérité
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      stack: error?.stack
    };

    this.logs.push(entry);

    // Limiter la taille du buffer
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log dans la console si activé
    if (this.enableConsole) {
      const logFn = console[level] || console.log;
      logFn(`[${level.toUpperCase()}] ${message}`, context || '', error || '');
    }

    // Envoyer à un service externe en production
    if (level === 'error' && process.env.NODE_ENV === 'production') {
      this.sendToExternalService(entry);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, context, error);
  }

  /**
   * Récupère tous les logs
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Efface tous les logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Envoie les logs à un service externe (Sentry, LogRocket, etc.)
   */
  private sendToExternalService(entry: LogEntry) {
    // TODO: Implémenter l'envoi vers Sentry ou autre service
    // Exemple avec Sentry:
    // Sentry.captureException(new Error(entry.message), {
    //   extra: entry.context,
    //   level: entry.level
    // });
  }

  /**
   * Configure le logger
   */
  configure(options: { enableConsole?: boolean; maxLogs?: number }) {
    if (options.enableConsole !== undefined) {
      this.enableConsole = options.enableConsole;
    }
    if (options.maxLogs !== undefined) {
      this.maxLogs = options.maxLogs;
    }
  }
}

export const logger = new Logger();

/**
 * Monitoring des performances
 */
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Mesure le temps d'exécution d'une fonction
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      logger.debug(`Performance: ${name}`, { duration: `${duration.toFixed(2)}ms` });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      logger.error(`Performance error: ${name}`, error as Error, { duration: `${duration.toFixed(2)}ms` });
      throw error;
    }
  }

  /**
   * Enregistre une métrique
   */
  private recordMetric(name: string, value: number) {
    const existing = this.metrics.get(name) || [];
    existing.push(value);

    // Garder seulement les 100 dernières mesures
    if (existing.length > 100) {
      existing.shift();
    }

    this.metrics.set(name, existing);
  }

  /**
   * Récupère les statistiques pour une métrique
   */
  getStats(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  /**
   * Récupère toutes les métriques
   */
  getAllMetrics() {
    const result: Record<string, any> = {};
    for (const [name] of this.metrics) {
      result[name] = this.getStats(name);
    }
    return result;
  }

  /**
   * Efface toutes les métriques
   */
  clear() {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook pour capturer les erreurs React
 */
export class ErrorBoundaryLogger {
  static logError(error: Error, errorInfo: { componentStack: string }) {
    logger.error('React Error Boundary', error, {
      componentStack: errorInfo.componentStack
    });

    // Envoyer à un service de monitoring en production
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }
}

/**
 * Tracking des événements utilisateur
 */
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 500;

  /**
   * Track un événement
   */
  track(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: new Date()
    };

    this.events.push(event);

    // Limiter la taille du buffer
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    logger.debug(`Analytics: ${name}`, properties);

    // Envoyer à un service analytics en production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(event);
    }
  }

  /**
   * Récupère tous les événements
   */
  getEvents(eventName?: string): AnalyticsEvent[] {
    if (eventName) {
      return this.events.filter(e => e.name === eventName);
    }
    return [...this.events];
  }

  /**
   * Envoie à un service analytics externe
   */
  private sendToAnalytics(event: AnalyticsEvent) {
    // TODO: Implémenter l'envoi vers Plausible, Umami, etc.
    // Exemple avec Plausible:
    // plausible(event.name, { props: event.properties });
  }

  /**
   * Efface tous les événements
   */
  clear() {
    this.events = [];
  }
}

export const analytics = new Analytics();
