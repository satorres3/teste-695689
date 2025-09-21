/**
 * Webhook Configuration Utility
 * Manages Vercel deploy hooks and build automation
 */

export interface DeployHookConfig {
  url: string
  name: string
  branch: string
  environment: 'staging' | 'production'
}

export interface WebhookConfig {
  endpoint: string
  secret: string
  deployHooks: {
    staging: DeployHookConfig
    production: DeployHookConfig
  }
}

// Environment-specific configuration
export const WEBHOOK_CONFIG: WebhookConfig = {
  endpoint: process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://staging.howtomecm.com/api/webhooks/build',
  secret: process.env.WEBHOOK_SECRET || 'your-webhook-secret',
  deployHooks: {
    staging: {
      url: process.env.VERCEL_STAGING_DEPLOY_HOOK || '',
      name: 'staging-auto-deploy',
      branch: 'main',
      environment: 'staging'
    },
    production: {
      url: process.env.VERCEL_PRODUCTION_DEPLOY_HOOK || '',
      name: 'production-auto-deploy',
      branch: 'main',
      environment: 'production'
    }
  }
}

export class WebhookManager {
  private config: WebhookConfig

  constructor(config: WebhookConfig = WEBHOOK_CONFIG) {
    this.config = config
  }

  // Get deploy hook for environment
  getDeployHook(environment: 'staging' | 'production'): DeployHookConfig {
    return this.config.deployHooks[environment]
  }

  // Trigger manual deployment
  async triggerDeploy(
    environment: 'staging' | 'production',
    reason?: string
  ): Promise<{ success: boolean, deploymentId?: string, error?: string }> {
    const deployHook = this.getDeployHook(environment)

    if (!deployHook.url) {
      return {
        success: false,
        error: `No deploy hook configured for ${environment}`
      }
    }

    try {
      const response = await fetch(deployHook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'Manual deployment trigger',
          timestamp: new Date().toISOString(),
          environment
        })
      })

      if (!response.ok) {
        throw new Error(`Deploy hook returned ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      return {
        success: true,
        deploymentId: result.deploymentId || result.id
      }

    } catch (error) {
      console.error(`Failed to trigger ${environment} deployment:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Smart deployment triggering with debouncing
  private deploymentQueue = new Map<string, NodeJS.Timeout>()

  queueDeployment(
    environment: 'staging' | 'production',
    reason: string,
    delayMs: number = 5000
  ): void {
    // Clear existing timeout for this environment
    const existingTimeout = this.deploymentQueue.get(environment)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      console.log(`Triggering queued deployment for ${environment}: ${reason}`)
      const result = await this.triggerDeploy(environment, reason)

      if (result.success) {
        console.log(`Deployment triggered successfully for ${environment}`, {
          deploymentId: result.deploymentId,
          reason
        })
      } else {
        console.error(`Failed to trigger deployment for ${environment}:`, result.error)
      }

      // Remove from queue
      this.deploymentQueue.delete(environment)
    }, delayMs)

    this.deploymentQueue.set(environment, timeout)
    console.log(`Queued deployment for ${environment} in ${delayMs}ms: ${reason}`)
  }

  // Get webhook endpoint for CMS configuration
  getWebhookEndpoint(): string {
    return this.config.endpoint
  }

  // Get webhook secret for CMS configuration
  getWebhookSecret(): string {
    return this.config.secret
  }

  // Validate webhook configuration
  validateConfig(): { valid: boolean, issues: string[] } {
    const issues: string[] = []

    if (!this.config.endpoint) {
      issues.push('Webhook endpoint not configured')
    }

    if (!this.config.secret || this.config.secret === 'your-webhook-secret') {
      issues.push('Webhook secret not configured or using default value')
    }

    if (!this.config.deployHooks.staging.url) {
      issues.push('Staging deploy hook not configured')
    }

    if (!this.config.deployHooks.production.url) {
      issues.push('Production deploy hook not configured')
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }

  // Generate webhook payload for testing
  generateTestPayload(type: 'post' | 'page' | 'settings' = 'post'): object {
    return {
      event: 'content.updated',
      data: {
        type,
        id: 'test-id-123',
        slug: type === 'post' ? 'test-blog-post' : 'test-page',
        domain: 'staging.howtomecm.com',
        status: 'published',
        action: 'update'
      },
      timestamp: new Date().toISOString()
    }
  }

  // Test webhook endpoint
  async testWebhook(payload?: object): Promise<{ success: boolean, response?: any, error?: string }> {
    const testPayload = payload || this.generateTestPayload()

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Webhook': 'true'
        },
        body: JSON.stringify(testPayload)
      })

      const responseData = await response.json()

      return {
        success: response.ok,
        response: responseData,
        error: response.ok ? undefined : `${response.status}: ${response.statusText}`
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Singleton instance
export const webhookManager = new WebhookManager()

// Utility functions
export function getWebhookEndpoint(): string {
  return webhookManager.getWebhookEndpoint()
}

export function getWebhookSecret(): string {
  return webhookManager.getWebhookSecret()
}

export function validateWebhookConfig() {
  return webhookManager.validateConfig()
}