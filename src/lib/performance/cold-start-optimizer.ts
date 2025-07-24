/**
 * Cold Start Optimization System
 *
 * Implements enterprise-grade cold start optimization strategies including:
 * - Progressive service loading with priority queues
 * - Intelligent cache warming and preloading
 * - Resource batching and connection pooling
 * - Performance monitoring and adaptive optimization
 */

import { ColdStartConfig, ProductionConfig } from "@/config/production-config";
import { healthMonitor, logger, metrics } from "@/lib/observability";

interface ServiceDefinition {
  name: string;
  priority: "critical" | "high" | "medium" | "low";
  dependencies: string[];
  initializer: () => Promise<any>;
  healthCheck?: () => Promise<boolean>;
  fallbackData?: any;
  timeout: number;
}

interface LoadingState {
  serviceName: string;
  status: "pending" | "loading" | "loaded" | "failed" | "fallback";
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: Error;
  retryCount: number;
}

interface ColdStartMetrics {
  totalStartTime: number;
  criticalServicesLoaded: number;
  totalServicesLoaded: number;
  failedServices: string[];
  fallbackServices: string[];
  overallDuration: number;
  timeToFirstPaint: number;
  timeToInteractive: number;
}

export class ColdStartOptimizer {
  private services = new Map<string, ServiceDefinition>();
  private loadingStates = new Map<string, LoadingState>();
  private loadingQueue: string[] = [];
  private isOptimizing = false;
  private startTime = 0;
  private metrics: ColdStartMetrics = {
    totalStartTime: 0,
    criticalServicesLoaded: 0,
    totalServicesLoaded: 0,
    failedServices: [],
    fallbackServices: [],
    overallDuration: 0,
    timeToFirstPaint: 0,
    timeToInteractive: 0,
  };

  constructor() {
    this.initializeDefaultServices();
  }

  private initializeDefaultServices() {
    // Portfolio service - Critical path
    this.registerService({
      name: "portfolio",
      priority: "critical",
      dependencies: [],
      timeout: ProductionConfig.api.timeouts.critical.requestTimeout,
      initializer: async () => {
        // Warmup portfolio API
        await this.warmupService("/api/portfolio/summary");
      },
      healthCheck: async () => {
        const response = await fetch("/api/health/portfolio", {
          method: "HEAD",
        });
        return response.ok;
      },
    });

    // Price service - Critical path
    this.registerService({
      name: "priceService",
      priority: "critical",
      dependencies: [],
      timeout: ProductionConfig.api.timeouts.realtime.requestTimeout,
      initializer: async () => {
        // Warmup price API with common symbols
        const symbols = ["BTC", "ETH", "SOL"];
        await Promise.all(
          symbols.map((symbol) => this.warmupService(`/api/prices/${symbol}`))
        );
      },
    });

    // NFT service - High priority but not critical
    this.registerService({
      name: "nftService",
      priority: "high",
      dependencies: [],
      timeout: ProductionConfig.api.timeouts.background.requestTimeout,
      initializer: async () => {
        await this.warmupService("/api/nft/collections");
      },
    });

    // Market data - Medium priority
    this.registerService({
      name: "marketData",
      priority: "medium",
      dependencies: ["priceService"],
      timeout: ProductionConfig.api.timeouts.background.requestTimeout,
      initializer: async () => {
        await this.warmupService("/api/market/summary");
      },
    });

    // Analytics - Low priority
    this.registerService({
      name: "analytics",
      priority: "low",
      dependencies: ["portfolio", "marketData"],
      timeout: ProductionConfig.api.timeouts.background.requestTimeout,
      initializer: async () => {
        await this.warmupService("/api/analytics/dashboard");
      },
    });
  }

  registerService(service: ServiceDefinition): void {
    this.services.set(service.name, service);
    this.loadingStates.set(service.name, {
      serviceName: service.name,
      status: "pending",
      startTime: 0,
      retryCount: 0,
    });

    logger.info(`Service registered for cold start optimization`, {
      component: "cold-start-optimizer",
      action: "register-service",
      metadata: {
        serviceName: service.name,
        priority: service.priority,
        dependencies: service.dependencies,
      },
    });
  }

  async startOptimization(): Promise<ColdStartMetrics> {
    if (this.isOptimizing) {
      logger.warn("Cold start optimization already in progress", {
        component: "cold-start-optimizer",
        action: "start-optimization-skipped",
      });
      return this.metrics;
    }

    this.isOptimizing = true;
    this.startTime = Date.now();
    this.metrics.totalStartTime = this.startTime;

    logger.info("Starting cold start optimization", {
      component: "cold-start-optimizer",
      action: "start-optimization",
      metadata: {
        serviceCount: this.services.size,
        config: ColdStartConfig,
      },
    });

    const endTiming = metrics.timing("cold_start_total_duration");

    try {
      // Phase 1: Load critical services first
      await this.loadCriticalServices();

      // Phase 2: Progressive loading of remaining services
      if (ColdStartConfig.progressive.enabled) {
        await this.progressiveLoadServices();
      }

      // Phase 3: Background cache warming
      if (ColdStartConfig.cacheWarming.enabled) {
        this.startBackgroundCacheWarming();
      }

      // Calculate final metrics
      this.metrics.overallDuration = Date.now() - this.startTime;
      this.metrics.timeToFirstPaint = this.getTimeToFirstPaint();
      this.metrics.timeToInteractive = this.getTimeToInteractive();

      // Record performance metrics
      metrics.record({
        name: "cold_start_duration",
        value: this.metrics.overallDuration,
        unit: "ms",
        tags: { phase: "complete" },
      });

      metrics.record({
        name: "cold_start_success_rate",
        value: (this.metrics.totalServicesLoaded / this.services.size) * 100,
        unit: "percent",
      });

      logger.info("Cold start optimization completed", {
        component: "cold-start-optimizer",
        action: "optimization-complete",
        metadata: this.metrics,
      });

      return this.metrics;
    } catch (error) {
      logger.error("Cold start optimization failed", {
        component: "cold-start-optimizer",
        action: "optimization-failed",
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          partialMetrics: this.metrics,
        },
      });
      throw error;
    } finally {
      this.isOptimizing = false;
      endTiming();
    }
  }

  private async loadCriticalServices(): Promise<void> {
    const criticalServices = Array.from(this.services.values())
      .filter((service) => service.priority === "critical")
      .sort((a, b) => a.dependencies.length - b.dependencies.length); // Load services with fewer dependencies first

    logger.info(`Loading ${criticalServices.length} critical services`, {
      component: "cold-start-optimizer",
      action: "load-critical-services",
      metadata: { services: criticalServices.map((s) => s.name) },
    });

    // Load critical services in parallel with dependency awareness
    const loadPromises = criticalServices.map((service) =>
      this.loadService(service.name, "critical")
    );

    const results = await Promise.allSettled(loadPromises);

    results.forEach((result, index) => {
      const serviceName = criticalServices[index].name;
      if (result.status === "fulfilled") {
        this.metrics.criticalServicesLoaded++;
        healthMonitor.update(serviceName, "healthy");
      } else {
        this.metrics.failedServices.push(serviceName);
        healthMonitor.update(serviceName, "unhealthy", undefined, {
          reason: "cold_start_failed",
          error: result.reason,
        });
      }
    });

    metrics.record({
      name: "critical_services_loaded",
      value: this.metrics.criticalServicesLoaded,
      unit: "count",
    });
  }

  private async progressiveLoadServices(): Promise<void> {
    const remainingServices = Array.from(this.services.values())
      .filter((service) => service.priority !== "critical")
      .sort((a, b) => {
        // Sort by priority first, then by dependencies
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff =
          priorityOrder[a.priority] - priorityOrder[b.priority];
        return priorityDiff !== 0
          ? priorityDiff
          : a.dependencies.length - b.dependencies.length;
      });

    logger.info(`Progressive loading ${remainingServices.length} services`, {
      component: "cold-start-optimizer",
      action: "progressive-load-start",
      metadata: {
        services: remainingServices.map((s) => ({
          name: s.name,
          priority: s.priority,
        })),
        batchSize: ColdStartConfig.progressive.batchSize,
      },
    });

    // Process services in batches to avoid overwhelming the system
    const batchSize = ColdStartConfig.progressive.batchSize;
    for (let i = 0; i < remainingServices.length; i += batchSize) {
      const batch = remainingServices.slice(i, i + batchSize);

      const batchPromises = batch.map((service) =>
        this.loadService(service.name, "progressive")
      );

      await Promise.allSettled(batchPromises);

      // Wait between batches to prevent resource contention
      if (i + batchSize < remainingServices.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, ColdStartConfig.progressive.intervalMs)
        );
      }
    }
  }

  private async loadService(
    serviceName: string,
    phase: "critical" | "progressive"
  ): Promise<void> {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const state = this.loadingStates.get(serviceName)!;
    state.status = "loading";
    state.startTime = Date.now();

    const endTiming = metrics.timing(`service_load_duration`);

    try {
      // Check dependencies first
      await this.waitForDependencies(service.dependencies);

      logger.info(`Loading service: ${serviceName}`, {
        component: "cold-start-optimizer",
        action: "load-service-start",
        metadata: { serviceName, phase, dependencies: service.dependencies },
      });

      // Execute service initializer with timeout
      await Promise.race([
        service.initializer(),
        new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error(`Service ${serviceName} load timeout`)),
            service.timeout
          );
        }),
      ]);

      // Health check if available
      if (service.healthCheck) {
        const isHealthy = await service.healthCheck();
        if (!isHealthy) {
          throw new Error(`Service ${serviceName} failed health check`);
        }
      }

      state.status = "loaded";
      state.endTime = Date.now();
      state.duration = state.endTime - state.startTime;
      this.metrics.totalServicesLoaded++;

      logger.info(`Service loaded successfully: ${serviceName}`, {
        component: "cold-start-optimizer",
        action: "load-service-success",
        metadata: {
          serviceName,
          duration: state.duration,
          phase,
        },
      });

      metrics.record({
        name: "service_load_time",
        value: state.duration,
        unit: "ms",
        tags: { service: serviceName, phase },
      });
    } catch (error) {
      state.status = "failed";
      state.error = error instanceof Error ? error : new Error(String(error));
      state.retryCount++;

      logger.error(`Service load failed: ${serviceName}`, {
        component: "cold-start-optimizer",
        action: "load-service-failed",
        metadata: {
          serviceName,
          error: state.error.message,
          retryCount: state.retryCount,
          phase,
        },
      });

      // Try fallback if available
      if (service.fallbackData) {
        state.status = "fallback";
        this.metrics.fallbackServices.push(serviceName);
        logger.info(`Using fallback data for service: ${serviceName}`, {
          component: "cold-start-optimizer",
          action: "service-fallback",
          metadata: { serviceName },
        });
      }

      throw error;
    } finally {
      endTiming();
    }
  }

  private async waitForDependencies(dependencies: string[]): Promise<void> {
    if (dependencies.length === 0) return;

    const dependencyPromises = dependencies.map(async (depName) => {
      const state = this.loadingStates.get(depName);
      if (!state) {
        throw new Error(`Dependency ${depName} not found`);
      }

      // Wait for dependency to load or fail
      while (state.status === "pending" || state.status === "loading") {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (
        state.status === "failed" &&
        !this.services.get(depName)?.fallbackData
      ) {
        throw new Error(`Dependency ${depName} failed to load`);
      }
    });

    await Promise.all(dependencyPromises);
  }

  private async warmupService(endpoint: string): Promise<void> {
    try {
      const response = await fetch(endpoint, {
        method: "HEAD", // Use HEAD to minimize data transfer
        headers: { "X-Warmup": "true" },
      });

      if (response.ok) {
        logger.debug(`Service warmed up: ${endpoint}`, {
          component: "cold-start-optimizer",
          action: "warmup-success",
          metadata: { endpoint },
        });
      }
    } catch (error) {
      logger.warn(`Service warmup failed: ${endpoint}`, {
        component: "cold-start-optimizer",
        action: "warmup-failed",
        metadata: {
          endpoint,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  private startBackgroundCacheWarming(): void {
    if (!ColdStartConfig.cacheWarming.backgroundRefresh) return;

    logger.info("Starting background cache warming", {
      component: "cold-start-optimizer",
      action: "background-warmup-start",
    });

    // Warm up cache for critical services in the background
    const warmupServices = ColdStartConfig.cacheWarming.warmupServices;
    setTimeout(async () => {
      for (const serviceName of warmupServices) {
        const service = this.services.get(serviceName);
        if (service) {
          try {
            await service.initializer();
            logger.debug(
              `Background cache warming completed for: ${serviceName}`,
              {
                component: "cold-start-optimizer",
                action: "background-warmup-success",
                metadata: { serviceName },
              }
            );
          } catch (error) {
            logger.warn(`Background cache warming failed for: ${serviceName}`, {
              component: "cold-start-optimizer",
              action: "background-warmup-failed",
              metadata: {
                serviceName,
                error: error instanceof Error ? error.message : String(error),
              },
            });
          }
        }
      }
    }, 5000); // Start background warmup after 5 seconds
  }

  private getTimeToFirstPaint(): number {
    // Try to get real performance timing if available
    if (
      typeof window !== "undefined" &&
      window.performance &&
      window.performance.timing
    ) {
      const timing = window.performance.timing;
      return timing.domContentLoadedEventEnd - timing.navigationStart;
    }

    // Fallback: estimate based on critical services load time
    const criticalServiceStates = Array.from(
      this.loadingStates.values()
    ).filter((state) => {
      const service = this.services.get(state.serviceName);
      return service?.priority === "critical";
    });

    const maxCriticalLoadTime = Math.max(
      ...criticalServiceStates.map((state) => state.duration || 0)
    );

    return maxCriticalLoadTime || 0;
  }

  private getTimeToInteractive(): number {
    // Estimate based on when all high-priority services are loaded
    const highPriorityStates = Array.from(this.loadingStates.values()).filter(
      (state) => {
        const service = this.services.get(state.serviceName);
        return service?.priority === "critical" || service?.priority === "high";
      }
    );

    const allHighPriorityLoaded = highPriorityStates.every(
      (state) => state.status === "loaded" || state.status === "fallback"
    );

    if (!allHighPriorityLoaded) {
      return 0; // Still loading
    }

    return (
      Math.max(...highPriorityStates.map((state) => state.endTime || 0)) -
      this.startTime
    );
  }

  getLoadingStates(): Map<string, LoadingState> {
    return new Map(this.loadingStates);
  }

  getMetrics(): ColdStartMetrics {
    return { ...this.metrics };
  }

  isServiceLoaded(serviceName: string): boolean {
    const state = this.loadingStates.get(serviceName);
    return state?.status === "loaded" || state?.status === "fallback";
  }

  async retryFailedServices(): Promise<void> {
    const failedServices = Array.from(this.loadingStates.entries())
      .filter(([_, state]) => state.status === "failed")
      .map(([name]) => name);

    if (failedServices.length === 0) {
      logger.info("No failed services to retry", {
        component: "cold-start-optimizer",
        action: "retry-services-skipped",
      });
      return;
    }

    logger.info(`Retrying ${failedServices.length} failed services`, {
      component: "cold-start-optimizer",
      action: "retry-services-start",
      metadata: { services: failedServices },
    });

    for (const serviceName of failedServices) {
      try {
        await this.loadService(serviceName, "progressive");
      } catch (error) {
        logger.error(`Retry failed for service: ${serviceName}`, {
          component: "cold-start-optimizer",
          action: "retry-service-failed",
          metadata: {
            serviceName,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }
  }
}

// Global cold start optimizer instance
export const coldStartOptimizer = new ColdStartOptimizer();

// Note: React hook for cold start optimization removed to prevent server-side compilation errors
// If needed for client components, create a separate file with "use client" directive
