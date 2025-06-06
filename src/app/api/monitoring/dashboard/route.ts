import { circuitBreakerManager } from '@/lib/circuit-breaker'
import { healthMonitor } from '@/lib/observability'
import { coldStartOptimizer } from '@/lib/performance/cold-start-optimizer'
import { NextRequest, NextResponse } from 'next/server'

interface MonitoringDashboard {
  timestamp: string
  systemHealth: {
    overall: 'healthy' | 'degraded' | 'unhealthy'
    services: Record<string, any>
  }
  circuitBreakers: {
    states: Record<string, any>
    metrics: Record<string, any>
    healthSummary: Record<string, { state: string; healthy: boolean }>
  }
  performance: {
    coldStart: any
    loadingStates: Record<string, any>
    averageResponseTime: number
    errorRate: number
  }
  alerts: Array<{
    level: 'info' | 'warning' | 'error' | 'critical'
    message: string
    component: string
    timestamp: string
  }>
}

function determineOverallHealth(services: Record<string, any>): 'healthy' | 'degraded' | 'unhealthy' {
  const serviceStates = Object.values(services)

  if (serviceStates.length === 0) return 'healthy'

  const unhealthyCount = serviceStates.filter(s => s.status === 'unhealthy').length
  const degradedCount = serviceStates.filter(s => s.status === 'degraded').length

  if (unhealthyCount > 0) return 'unhealthy'
  if (degradedCount > 0) return 'degraded'

  return 'healthy'
}

function generateAlerts(
  systemHealth: any,
  circuitBreakers: any,
  performance: any
): Array<{ level: 'info' | 'warning' | 'error' | 'critical'; message: string; component: string; timestamp: string }> {
  const alerts: Array<{ level: 'info' | 'warning' | 'error' | 'critical'; message: string; component: string; timestamp: string }> = []
  const timestamp = new Date().toISOString()

  // System health alerts
  if (systemHealth.overall === 'unhealthy') {
    alerts.push({
      level: 'critical',
      message: 'System health is critical - multiple services are unhealthy',
      component: 'system',
      timestamp,
    })
  } else if (systemHealth.overall === 'degraded') {
    alerts.push({
      level: 'warning',
      message: 'System health is degraded - some services are experiencing issues',
      component: 'system',
      timestamp,
    })
  }

  // Circuit breaker alerts
  Object.entries(circuitBreakers.healthSummary).forEach(([service, health]: [string, any]) => {
    if (health.state === 'OPEN') {
      alerts.push({
        level: 'error',
        message: `Circuit breaker for ${service} is OPEN - service is failing`,
        component: service,
        timestamp,
      })
    } else if (health.state === 'HALF_OPEN') {
      alerts.push({
        level: 'warning',
        message: `Circuit breaker for ${service} is HALF_OPEN - service is recovering`,
        component: service,
        timestamp,
      })
    }
  })

  // Performance alerts
  if (performance.errorRate > 5) {
    alerts.push({
      level: 'error',
      message: `High error rate detected: ${performance.errorRate.toFixed(1)}%`,
      component: 'performance',
      timestamp,
    })
  } else if (performance.errorRate > 2) {
    alerts.push({
      level: 'warning',
      message: `Elevated error rate: ${performance.errorRate.toFixed(1)}%`,
      component: 'performance',
      timestamp,
    })
  }

  if (performance.averageResponseTime > 5000) {
    alerts.push({
      level: 'warning',
      message: `Slow response times detected: ${performance.averageResponseTime}ms average`,
      component: 'performance',
      timestamp,
    })
  }

  // Cold start performance alerts
  if (performance.coldStart?.overallDuration > 10000) {
    alerts.push({
      level: 'warning',
      message: `Slow cold start detected: ${performance.coldStart.overallDuration}ms`,
      component: 'cold-start',
      timestamp,
    })
  }

  return alerts
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Gather system health information
    const systemHealth = healthMonitor.getSystemHealth()

    // Gather circuit breaker information
    const circuitBreakerStates = circuitBreakerManager.getAllMetrics()
    const circuitBreakerHealthSummary = circuitBreakerManager.getHealthSummary()

    // Gather performance information
    const coldStartMetrics = coldStartOptimizer.getMetrics()
    const loadingStates = coldStartOptimizer.getLoadingStates()

    // Convert Map to Object for JSON serialization
    const loadingStatesObj: Record<string, any> = {}
    loadingStates.forEach((value, key) => {
      loadingStatesObj[key] = value
    })

    // Calculate average response time and error rate
    // In a real implementation, this would come from metrics collection
    const averageResponseTime = Math.random() * 1000 + 200 // Mock data
    const errorRate = Math.random() * 3 // Mock data

    const performance = {
      coldStart: coldStartMetrics,
      loadingStates: loadingStatesObj,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
    }

    const overall = determineOverallHealth(systemHealth)

    const dashboard: MonitoringDashboard = {
      timestamp: new Date().toISOString(),
      systemHealth: {
        overall,
        services: systemHealth,
      },
      circuitBreakers: {
        states: circuitBreakerStates,
        metrics: circuitBreakerStates,
        healthSummary: circuitBreakerHealthSummary,
      },
      performance,
      alerts: generateAlerts(
        { overall, services: systemHealth },
        { healthSummary: circuitBreakerHealthSummary },
        performance
      ),
    }

    return NextResponse.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[Monitoring Dashboard] Error:', error)

    return NextResponse.json({
      success: false,
      error: {
        code: 'MONITORING_ERROR',
        message: 'Failed to fetch monitoring dashboard data',
        details: process.env.NODE_ENV === 'development' ? {
          error: error instanceof Error ? error.message : String(error)
        } : undefined
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

// Health check endpoint
export async function HEAD(): Promise<NextResponse> {
  try {
    const systemHealth = healthMonitor.getSystemHealth()
    const overall = determineOverallHealth(systemHealth)

    const status = overall === 'healthy' ? 200 : overall === 'degraded' ? 206 : 503

    return new NextResponse(null, { status })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
