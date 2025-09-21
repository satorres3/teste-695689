/**
 * Deployment Monitor
 * Tracks deployment status and provides real-time feedback
 */

export interface DeploymentStatus {
  id: string
  environment: 'staging' | 'production'
  status: 'pending' | 'building' | 'ready' | 'error' | 'canceled'
  url?: string
  createdAt: string
  updatedAt: string
  duration?: number
  error?: string
  buildLogs?: string[]
}

export interface BuildMetrics {
  totalBuilds: number
  successfulBuilds: number
  failedBuilds: number
  averageBuildTime: number
  lastBuildTime?: string
  uptime: number
}

export class DeploymentMonitor {
  private deployments: Map<string, DeploymentStatus> = new Map()
  private maxHistory = 50 // Keep last 50 deployments

  // Add or update deployment status
  updateDeployment(deployment: Partial<DeploymentStatus> & { id: string }): void {
    const existing = this.deployments.get(deployment.id)
    const updated: DeploymentStatus = {
      id: deployment.id,
      environment: deployment.environment || existing?.environment || 'staging',
      status: deployment.status || existing?.status || 'pending',
      url: deployment.url || existing?.url,
      createdAt: deployment.createdAt || existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      duration: deployment.duration || existing?.duration,
      error: deployment.error || existing?.error,
      buildLogs: deployment.buildLogs || existing?.buildLogs || []
    }

    this.deployments.set(deployment.id, updated)

    // Keep only the most recent deployments
    if (this.deployments.size > this.maxHistory) {
      const oldestKey = Array.from(this.deployments.keys())[0]
      this.deployments.delete(oldestKey)
    }

    console.log(`Deployment ${deployment.id} updated:`, updated.status)
  }

  // Get deployment by ID
  getDeployment(id: string): DeploymentStatus | undefined {
    return this.deployments.get(id)
  }

  // Get all deployments for an environment
  getDeploymentsByEnvironment(environment: 'staging' | 'production'): DeploymentStatus[] {
    return Array.from(this.deployments.values())
      .filter(d => d.environment === environment)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Get latest deployment for an environment
  getLatestDeployment(environment: 'staging' | 'production'): DeploymentStatus | undefined {
    const deployments = this.getDeploymentsByEnvironment(environment)
    return deployments[0]
  }

  // Get build metrics
  getBuildMetrics(environment?: 'staging' | 'production'): BuildMetrics {
    const deployments = environment
      ? this.getDeploymentsByEnvironment(environment)
      : Array.from(this.deployments.values())

    const totalBuilds = deployments.length
    const successfulBuilds = deployments.filter(d => d.status === 'ready').length
    const failedBuilds = deployments.filter(d => d.status === 'error').length

    const completedBuilds = deployments.filter(d => d.duration)
    const averageBuildTime = completedBuilds.length > 0
      ? completedBuilds.reduce((sum, d) => sum + (d.duration || 0), 0) / completedBuilds.length
      : 0

    const lastBuild = deployments[0]

    // Calculate uptime (percentage of successful builds)
    const uptime = totalBuilds > 0 ? (successfulBuilds / totalBuilds) * 100 : 100

    return {
      totalBuilds,
      successfulBuilds,
      failedBuilds,
      averageBuildTime,
      lastBuildTime: lastBuild?.createdAt,
      uptime
    }
  }

  // Start monitoring a deployment
  startDeployment(id: string, environment: 'staging' | 'production'): void {
    this.updateDeployment({
      id,
      environment,
      status: 'pending'
    })
  }

  // Mark deployment as building
  markBuilding(id: string, buildLogs?: string[]): void {
    this.updateDeployment({
      id,
      status: 'building',
      buildLogs
    })
  }

  // Mark deployment as ready
  markReady(id: string, url?: string, buildTime?: number): void {
    const deployment = this.getDeployment(id)
    const duration = buildTime || (deployment?.createdAt
      ? Date.now() - new Date(deployment.createdAt).getTime()
      : undefined)

    this.updateDeployment({
      id,
      status: 'ready',
      url,
      duration
    })
  }

  // Mark deployment as failed
  markFailed(id: string, error: string, buildLogs?: string[]): void {
    const deployment = this.getDeployment(id)
    const duration = deployment?.createdAt
      ? Date.now() - new Date(deployment.createdAt).getTime()
      : undefined

    this.updateDeployment({
      id,
      status: 'error',
      error,
      duration,
      buildLogs
    })
  }

  // Get deployment status summary
  getStatusSummary(): {
    staging: { status: string, lastUpdate: string }
    production: { status: string, lastUpdate: string }
  } {
    const stagingLatest = this.getLatestDeployment('staging')
    const productionLatest = this.getLatestDeployment('production')

    return {
      staging: {
        status: stagingLatest?.status || 'unknown',
        lastUpdate: stagingLatest?.updatedAt || 'never'
      },
      production: {
        status: productionLatest?.status || 'unknown',
        lastUpdate: productionLatest?.updatedAt || 'never'
      }
    }
  }

  // Check if environment is currently building
  isBuilding(environment: 'staging' | 'production'): boolean {
    const latest = this.getLatestDeployment(environment)
    return latest?.status === 'building' || latest?.status === 'pending'
  }

  // Get deployment history
  getHistory(limit: number = 10): DeploymentStatus[] {
    return Array.from(this.deployments.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  // Clear deployment history
  clearHistory(): void {
    this.deployments.clear()
    console.log('Deployment history cleared')
  }

  // Export deployment data
  exportData(): object {
    return {
      deployments: Array.from(this.deployments.values()),
      metrics: {
        staging: this.getBuildMetrics('staging'),
        production: this.getBuildMetrics('production'),
        overall: this.getBuildMetrics()
      },
      summary: this.getStatusSummary(),
      exportedAt: new Date().toISOString()
    }
  }
}

// Singleton instance
export const deploymentMonitor = new DeploymentMonitor()

// Utility functions for easy access
export function trackDeployment(id: string, environment: 'staging' | 'production') {
  deploymentMonitor.startDeployment(id, environment)
}

export function getDeploymentStatus(environment: 'staging' | 'production') {
  return deploymentMonitor.getLatestDeployment(environment)
}

export function getBuildMetrics(environment?: 'staging' | 'production') {
  return deploymentMonitor.getBuildMetrics(environment)
}

export function isEnvironmentBuilding(environment: 'staging' | 'production') {
  return deploymentMonitor.isBuilding(environment)
}