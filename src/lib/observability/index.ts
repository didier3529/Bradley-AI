/**
 * Enterprise-Grade Observability System
 *
 * Provides structured logging, performance metrics, error tracking, and real-time monitoring
 * for the Bradley AI blockchain analytics platform.
 */

import { v4 as uuidv4 } from 'uuid';

// Type definitions for structured logging
export interface LogContext {
  correlationId: string;
  component: string;
  action: string;
  userId?: string;
  sessionId?: string;
  chainId?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  tags?: Record<string, string>;
  timestamp: number;
  correlationId: string;
}

export interface ErrorEvent {
  errorId: string;
  message: string;
  stack?: string;
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  context: LogContext;
  userAgent?: string;
  url?: string;
  timestamp: number;
}

export interface ServiceHealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  lastCheck: number;
  details?: Record<string, any>;
}

// Global observability state
class ObservabilityManager {
  private correlationId: string = uuidv4();
  private sessionId: string = uuidv4();
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorEvent[] = [];
  private healthChecks: Map<string, ServiceHealthCheck> = new Map();
  private isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    // Initialize session tracking
    if (typeof window !== 'undefined') {
      this.sessionId = sessionStorage.getItem('bradley-session-id') || uuidv4();
      sessionStorage.setItem('bradley-session-id', this.sessionId);
    }

    // Set up periodic metric flushing in production
    if (this.isProduction && typeof window !== 'undefined') {
      setInterval(() => this.flushMetrics(), 30000); // Every 30 seconds
    }
  }

  generateCorrelationId(): string {
    return uuidv4();
  }

  getCurrentSessionId(): string {
    return this.sessionId;
  }

  // Structured logging with correlation tracking
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, context: Partial<LogContext>) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: context.correlationId || this.correlationId,
      sessionId: this.sessionId,
      component: context.component || 'unknown',
      action: context.action || 'unknown',
      userId: context.userId,
      chainId: context.chainId,
      metadata: context.metadata,
      environment: this.isProduction ? 'production' : 'development',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // In production, send to external logging service
    if (this.isProduction) {
      this.sendToLoggingService(logEntry);
    } else {
      // Enhanced development logging
      const color = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
      }[level];

      console.log(
        `${color}[${level.toUpperCase()}] ${logEntry.component}:${logEntry.action}\x1b[0m`,
        message,
        logEntry
      );
    }
  }

  // Performance metric tracking
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp' | 'correlationId'>) {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
      correlationId: this.correlationId,
    };

    this.metrics.push(fullMetric);

    // Log metric in development
    if (!this.isProduction) {
      console.log(`📊 [METRIC] ${metric.name}: ${metric.value}${metric.unit}`, fullMetric);
    }

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Error tracking with automatic classification
  recordError(error: Error | string, context: Partial<LogContext>, severity?: 'low' | 'medium' | 'high' | 'critical') {
    const errorEvent: ErrorEvent = {
      errorId: uuidv4(),
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      component: context.component || 'unknown',
      severity: severity || this.classifyErrorSeverity(error),
      retryable: this.isRetryableError(error),
      context: {
        correlationId: context.correlationId || this.correlationId,
        component: context.component || 'unknown',
        action: context.action || 'unknown',
        userId: context.userId,
        sessionId: this.sessionId,
        chainId: context.chainId,
        metadata: context.metadata,
      },
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: Date.now(),
    };

    this.errors.push(errorEvent);

    // Always log errors
    this.log('error', errorEvent.message, errorEvent.context);

    // Send to error tracking service in production
    if (this.isProduction) {
      this.sendToErrorService(errorEvent);
    }

    // Keep only last 100 errors in memory
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    return errorEvent.errorId;
  }

  // Service health monitoring
  updateServiceHealth(service: string, status: ServiceHealthCheck['status'], latency?: number, details?: Record<string, any>) {
    const healthCheck: ServiceHealthCheck = {
      service,
      status,
      latency,
      lastCheck: Date.now(),
      details,
    };

    this.healthChecks.set(service, healthCheck);

    // Log health changes
    this.log('info', `Service ${service} health: ${status}`, {
      correlationId: this.correlationId,
      component: 'health-monitor',
      action: 'health-check',
      metadata: { service, status, latency, details },
    });
  }

  // Get current system health overview
  getSystemHealth(): Record<string, ServiceHealthCheck> {
    const health: Record<string, ServiceHealthCheck> = {};
    this.healthChecks.forEach((check, service) => {
      health[service] = check;
    });
    return health;
  }

  // Performance timing utilities
  startTiming(name: string): () => void {
    const startTime = performance.now();
    const correlationId = this.correlationId;

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name,
        value: Math.round(duration),
        unit: 'ms',
        tags: { type: 'timing' },
      });
    };
  }

  // Memory usage tracking
  recordMemoryUsage(component: string) {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric({
        name: 'memory_used',
        value: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        unit: 'bytes',
        tags: { component, type: 'memory' },
      });
    }
  }

  // Circuit breaker state tracking
  recordCircuitBreakerState(service: string, state: 'closed' | 'open' | 'half-open') {
    this.log('info', `Circuit breaker for ${service}: ${state}`, {
      correlationId: this.correlationId,
      component: 'circuit-breaker',
      action: 'state-change',
      metadata: { service, state },
    });

    this.recordMetric({
      name: 'circuit_breaker_state',
      value: state === 'closed' ? 0 : state === 'half-open' ? 1 : 2,
      unit: 'count',
      tags: { service, state },
    });
  }

  private classifyErrorSeverity(error: Error | string): 'low' | 'medium' | 'high' | 'critical' {
    const message = error instanceof Error ? error.message : error;
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('network') || lowerMessage.includes('timeout')) {
      return 'medium';
    }
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden')) {
      return 'high';
    }
    if (lowerMessage.includes('critical') || lowerMessage.includes('fatal')) {
      return 'critical';
    }
    return 'low';
  }

  private isRetryableError(error: Error | string): boolean {
    const message = error instanceof Error ? error.message : error;
    const lowerMessage = message.toLowerCase();

    return lowerMessage.includes('timeout') ||
           lowerMessage.includes('network') ||
           lowerMessage.includes('service unavailable') ||
           lowerMessage.includes('rate limit');
  }

  private sendToLoggingService(logEntry: any) {
    // Implement external logging service integration
    // For now, we'll use console.log but this should be replaced with
    // services like DataDog, New Relic, or custom logging endpoints
    if (typeof window !== 'undefined') {
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      }).catch(err => console.error('Failed to send log to service:', err));
    }
  }

  private sendToErrorService(errorEvent: ErrorEvent) {
    // Implement error tracking service integration
    if (typeof window !== 'undefined') {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorEvent),
      }).catch(err => console.error('Failed to send error to service:', err));
    }
  }

  private flushMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    // Send metrics to monitoring service
    if (typeof window !== 'undefined') {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metricsToSend),
      }).catch(err => console.error('Failed to send metrics to service:', err));
    }
  }
}

// Global instance
export const observability = new ObservabilityManager();

// Convenience functions
export const logger = {
  debug: (message: string, context: Partial<LogContext> = {}) =>
    observability.log('debug', message, context),
  info: (message: string, context: Partial<LogContext> = {}) =>
    observability.log('info', message, context),
  warn: (message: string, context: Partial<LogContext> = {}) =>
    observability.log('warn', message, context),
  error: (message: string, context: Partial<LogContext> = {}) =>
    observability.log('error', message, context),
};

export const metrics = {
  record: (metric: Omit<PerformanceMetric, 'timestamp' | 'correlationId'>) =>
    observability.recordMetric(metric),
  timing: (name: string) => observability.startTiming(name),
  memory: (component: string) => observability.recordMemoryUsage(component),
};

export const errorTracking = {
  record: (error: Error | string, context: Partial<LogContext> = {}, severity?: 'low' | 'medium' | 'high' | 'critical') =>
    observability.recordError(error, context, severity),
};

export const healthMonitor = {
  update: (service: string, status: ServiceHealthCheck['status'], latency?: number, details?: Record<string, any>) =>
    observability.updateServiceHealth(service, status, latency, details),
  getSystemHealth: () => observability.getSystemHealth(),
};

// React hook for observability
export function useObservability(component: string) {
  const correlationId = observability.generateCorrelationId();

  return {
    correlationId,
    log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, action: string, metadata?: Record<string, any>) =>
      observability.log(level, message, { correlationId, component, action, metadata }),
    recordMetric: (metric: Omit<PerformanceMetric, 'timestamp' | 'correlationId'>) =>
      observability.recordMetric(metric),
    recordError: (error: Error | string, action: string, severity?: 'low' | 'medium' | 'high' | 'critical') =>
      observability.recordError(error, { correlationId, component, action }, severity),
    startTiming: (name: string) => observability.startTiming(name),
  };
}
