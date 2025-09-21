import { NextRequest, NextResponse } from 'next/server'
import { webhookManager } from '../../../../lib/webhook-config'

export async function GET() {
  // Get webhook configuration status
  const configValidation = webhookManager.validateConfig()

  return NextResponse.json({
    status: 'healthy',
    service: 'webhook-test',
    timestamp: new Date().toISOString(),
    configuration: {
      valid: configValidation.valid,
      issues: configValidation.issues,
      endpoint: webhookManager.getWebhookEndpoint(),
      hasSecret: !!webhookManager.getWebhookSecret(),
      deployHooks: {
        staging: !!webhookManager.getDeployHook('staging').url,
        production: !!webhookManager.getDeployHook('production').url
      }
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { action, environment, type } = await request.json()

    switch (action) {
      case 'test-webhook': {
        const testPayload = webhookManager.generateTestPayload(type || 'post')
        const result = await webhookManager.testWebhook(testPayload)

        return NextResponse.json({
          success: result.success,
          action: 'test-webhook',
          payload: testPayload,
          result: result.response,
          error: result.error
        })
      }

      case 'trigger-deploy': {
        if (!environment || !['staging', 'production'].includes(environment)) {
          return NextResponse.json(
            { error: 'Invalid environment. Must be staging or production' },
            { status: 400 }
          )
        }

        const result = await webhookManager.triggerDeploy(
          environment,
          'Manual trigger from test endpoint'
        )

        return NextResponse.json({
          success: result.success,
          action: 'trigger-deploy',
          environment,
          deploymentId: result.deploymentId,
          error: result.error
        })
      }

      case 'queue-deploy': {
        if (!environment || !['staging', 'production'].includes(environment)) {
          return NextResponse.json(
            { error: 'Invalid environment. Must be staging or production' },
            { status: 400 }
          )
        }

        webhookManager.queueDeployment(
          environment,
          'Manual queue from test endpoint',
          1000 // 1 second for testing
        )

        return NextResponse.json({
          success: true,
          action: 'queue-deploy',
          environment,
          message: 'Deployment queued for 1 second'
        })
      }

      case 'validate-config': {
        const validation = webhookManager.validateConfig()

        return NextResponse.json({
          success: validation.valid,
          action: 'validate-config',
          configuration: validation,
          recommendations: validation.valid
            ? ['Configuration is valid and ready for production']
            : [
                'Set WEBHOOK_SECRET environment variable',
                'Configure VERCEL_STAGING_DEPLOY_HOOK environment variable',
                'Configure VERCEL_PRODUCTION_DEPLOY_HOOK environment variable',
                'Test webhook endpoint connectivity'
              ]
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: test-webhook, trigger-deploy, queue-deploy, validate-config' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}