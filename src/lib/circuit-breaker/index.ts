/**
 * Circuit Breaker Implementation for External Service Resilience
 *
 * Implements circuit breaker pattern to prevent cascade failures and provide
 * graceful degradation for external service dependencies.
 */

import { healthMonitor, logger, metrics, observability } from '../observability';

export interface CircuitBreakerConfig {
  failureThreshold: number;    // Number of failures before opening circuit
  recoveryTimeout: number;     // Time before attempting recovery (ms)
  monitoringWindow: number;    // Time window for failure counting (ms)
  successThreshold: number;    // Successful calls needed to close circuit
  fallbackEnabled: boolean;    // Whether to use fallback data
  serviceName: string;         // Service identifier
}

export interface CircuitBreakerMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  circuitOpens: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  currentState: CircuitBreakerState;
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker<T> {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private lastAttemptTime = 0;
  private metrics: CircuitBreakerMetrics;
  private readonly config: CircuitBreakerConfig;
  private readonly fallbackFunction?: () => Promise<T>;

  constructor(
    config: Partial<CircuitBreakerConfig> & { serviceName: string },
    fallbackFunction?: () => Promise<T>
  ) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 30000,    // 30 seconds
      monitoringWindow: 60000,   // 1 minute
      successThreshold: 3,
      fallbackEnabled: true,
      ...config,
    };

    this.fallbackFunction = fallbackFunction;

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      circuitOpens: 0,
      lastFailureTime: 0,
      lastSuccessTime: 0,
      currentState: this.state,
    };

    // Initialize health monitoring
    healthMonitor.update(this.config.serviceName, 'healthy');

    logger.info(`Circuit breaker initialized for ${this.config.serviceName}`, {
      component: 'circuit-breaker',
      action: 'initialize',
      metadata: { config: this.config },
    });
  }

  async execute<R = T>(operation: () => Promise<R>): Promise<R> {
    const correlationId = observability.generateCorrelationId();
    const startTime = performance.now();

    try {
      this.updateState();
      this.metrics.totalRequests++;

      if (this.state === 'OPEN') {
        const error = new Error(`Circuit breaker is OPEN for ${this.config.serviceName}`);
        logger.warn(error.message, {
          correlationId,
          component: 'circuit-breaker',
          action: 'blocked-request',
          metadata: {
            serviceName: this.config.serviceName,
            failureCount: this.failureCount,
            timeSinceLastFailure: Date.now() - this.lastFailureTime,
          },
        });

        if (this.config.fallbackEnabled && this.fallbackFunction) {
          logger.info(`Using fallback for ${this.config.serviceName}`, {
            correlationId,
            component: 'circuit-breaker',
            action: 'fallback',
          });
          return this.fallbackFunction() as Promise<R>;
        }

        throw error;
      }

      // Execute the operation
      const result = await this.executeWithTimeout(operation, correlationId);
      this.onSuccess(startTime, correlationId);
      return result;

    } catch (error) {
      this.onFailure(error, startTime, correlationId);

      // Try fallback if available and circuit is not half-open
      if (this.config.fallbackEnabled && this.fallbackFunction && this.state !== 'HALF_OPEN') {
        logger.info(`Circuit breaker fallback triggered for ${this.config.serviceName}`, {
          correlationId,
          component: 'circuit-breaker',
          action: 'fallback-triggered',
          metadata: { originalError: error instanceof Error ? error.message : String(error) },
        });

        try {
          return this.fallbackFunction() as Promise<R>;
        } catch (fallbackError) {
          logger.error(`Fallback failed for ${this.config.serviceName}`, {
            correlationId,
            component: 'circuit-breaker',
            action: 'fallback-failed',
            metadata: { fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError) },
          });
        }
      }

      throw error;
    }
  }

  private async executeWithTimeout<R>(operation: () => Promise<R>, correlationId: string): Promise<R> {
    // Add timeout protection to prevent hanging requests
    const timeoutMs = 15000; // 15 seconds default timeout

    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timeout after ${timeoutMs}ms for ${this.config.serviceName}`));
        }, timeoutMs);
      })
    ]);
  }

  private onSuccess(startTime: number, correlationId: string) {
    const duration = performance.now() - startTime;

    this.metrics.successfulRequests++;
    this.metrics.lastSuccessTime = Date.now();
    this.lastAttemptTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.setState('CLOSED');
        this.resetCounts();
        logger.info(`Circuit breaker closed for ${this.config.serviceName}`, {
          correlationId,
          component: 'circuit-breaker',
          action: 'circuit-closed',
          metadata: { successCount: this.successCount },
        });
      }
    } else if (this.state === 'CLOSED') {
      // Reset failure count on successful request
      this.failureCount = Math.max(0, this.failureCount - 1);
    }

    // Record success metrics
    metrics.record({
      name: 'circuit_breaker_request_duration',
      value: Math.round(duration),
      unit: 'ms',
      tags: {
        service: this.config.serviceName,
        result: 'success',
        state: this.state
      },
    });

    // Update service health
    healthMonitor.update(this.config.serviceName, 'healthy', Math.round(duration));
  }

  private onFailure(error: any, startTime: number, correlationId: string) {
    const duration = performance.now() - startTime;

    this.metrics.failedRequests++;
    this.metrics.lastFailureTime = Date.now();
    this.lastFailureTime = Date.now();
    this.lastAttemptTime = Date.now();
    this.failureCount++;

    // Log the failure with context
    logger.error(`Circuit breaker failure for ${this.config.serviceName}`, {
      correlationId,
      component: 'circuit-breaker',
      action: 'request-failed',
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        failureCount: this.failureCount,
        currentState: this.state,
        duration,
      },
    });

    // Record failure metrics
    metrics.record({
      name: 'circuit_breaker_request_duration',
      value: Math.round(duration),
      unit: 'ms',
      tags: {
        service: this.config.serviceName,
        result: 'failure',
        state: this.state
      },
    });

    metrics.record({
      name: 'circuit_breaker_failures',
      value: this.failureCount,
      unit: 'count',
      tags: { service: this.config.serviceName },
    });

    // Check if we should open the circuit
    if (this.state === 'CLOSED' && this.failureCount >= this.config.failureThreshold) {
      this.setState('OPEN');
      this.metrics.circuitOpens++;

      logger.warn(`Circuit breaker opened for ${this.config.serviceName}`, {
        correlationId,
        component: 'circuit-breaker',
        action: 'circuit-opened',
        metadata: {
          failureThreshold: this.config.failureThreshold,
          failureCount: this.failureCount,
        },
      });

      // Update service health to degraded
      healthMonitor.update(this.config.serviceName, 'unhealthy', undefined, {
        reason: 'circuit_breaker_open',
        failureCount: this.failureCount,
      });
    } else if (this.state === 'HALF_OPEN') {
      // Failed during recovery attempt, go back to OPEN
      this.setState('OPEN');
      this.successCount = 0;

      logger.warn(`Circuit breaker recovery failed for ${this.config.serviceName}`, {
        correlationId,
        component: 'circuit-breaker',
        action: 'recovery-failed',
      });
    }
  }

  private updateState() {
    if (this.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.config.recoveryTimeout) {
        this.setState('HALF_OPEN');
        this.successCount = 0;

        logger.info(`Circuit breaker attempting recovery for ${this.config.serviceName}`, {
          component: 'circuit-breaker',
          action: 'recovery-attempt',
          metadata: { timeSinceLastFailure },
        });

        // Update service health to degraded during recovery
        healthMonitor.update(this.config.serviceName, 'degraded', undefined, {
          reason: 'circuit_breaker_recovery',
        });
      }
    }

    // Clean up old failures outside the monitoring window
    const windowStart = Date.now() - this.config.monitoringWindow;
    if (this.lastFailureTime < windowStart && this.state === 'CLOSED') {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  private setState(newState: CircuitBreakerState) {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.metrics.currentState = newState;

      observability.recordCircuitBreakerState(this.config.serviceName, newState);

      logger.info(`Circuit breaker state changed for ${this.config.serviceName}`, {
        component: 'circuit-breaker',
        action: 'state-change',
        metadata: {
          fromState: oldState,
          toState: newState,
          failureCount: this.failureCount,
        },
      });
    }
  }

  private resetCounts() {
    this.failureCount = 0;
    this.successCount = 0;
  }

  // Public API for monitoring
  getState(): CircuitBreakerState {
    return this.state;
  }

  getMetrics(): CircuitBreakerMetrics {
    return { ...this.metrics };
  }

  // Force state change (for testing or manual intervention)
  forceState(state: CircuitBreakerState) {
    logger.warn(`Circuit breaker state forced for ${this.config.serviceName}`, {
      component: 'circuit-breaker',
      action: 'force-state',
      metadata: {
        fromState: this.state,
        toState: state,
        reason: 'manual_intervention',
      },
    });

    this.setState(state);
    if (state === 'CLOSED') {
      this.resetCounts();
    }
  }

  // Manual circuit reset
  reset() {
    logger.info(`Circuit breaker reset for ${this.config.serviceName}`, {
      component: 'circuit-breaker',
      action: 'reset',
    });

    this.setState('CLOSED');
    this.resetCounts();
    healthMonitor.update(this.config.serviceName, 'healthy');
  }
}

// Circuit Breaker Manager for managing multiple service circuit breakers
export class CircuitBreakerManager {
  private circuitBreakers = new Map<string, CircuitBreaker<any>>();

  createCircuitBreaker<T>(
    serviceName: string,
    config?: Partial<CircuitBreakerConfig>,
    fallbackFunction?: () => Promise<T>
  ): CircuitBreaker<T> {
    const circuitBreaker = new CircuitBreaker<T>(
      { serviceName, ...config },
      fallbackFunction
    );

    this.circuitBreakers.set(serviceName, circuitBreaker);
    return circuitBreaker;
  }

  getCircuitBreaker<T>(serviceName: string): CircuitBreaker<T> | undefined {
    return this.circuitBreakers.get(serviceName);
  }

  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const allMetrics: Record<string, CircuitBreakerMetrics> = {};
    this.circuitBreakers.forEach((cb, serviceName) => {
      allMetrics[serviceName] = cb.getMetrics();
    });
    return allMetrics;
  }

  resetAll() {
    this.circuitBreakers.forEach(cb => cb.reset());
  }

  getHealthSummary(): Record<string, { state: CircuitBreakerState; healthy: boolean }> {
    const summary: Record<string, { state: CircuitBreakerState; healthy: boolean }> = {};
    this.circuitBreakers.forEach((cb, serviceName) => {
      const state = cb.getState();
      summary[serviceName] = {
        state,
        healthy: state === 'CLOSED',
      };
    });
    return summary;
  }
}

// Global circuit breaker manager instance
export const circuitBreakerManager = new CircuitBreakerManager();
