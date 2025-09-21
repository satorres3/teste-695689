import { NextRequest, NextResponse } from 'next/server'
import { webhookManager } from '../../../../lib/webhook-config'
import { deploymentMonitor } from '../../../../lib/deployment-monitor'
import crypto from 'crypto'

interface TestResult {
  test: string
  success: boolean
  duration: number
  details?: any
  error?: string
}

interface E2ETestSuite {
  name: string
  results: TestResult[]
  summary: {
    total: number
    passed: number
    failed: number
    duration: number
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const results: TestResult[] = []

  try {
    const { tests = 'all', verbose = false } = await request.json()

    // Test 1: Webhook Configuration Validation
    if (tests === 'all' || tests.includes('config')) {
      const configTest = await testWebhookConfiguration()
      results.push(configTest)
    }

    // Test 2: Webhook Signature Verification
    if (tests === 'all' || tests.includes('signature')) {
      const signatureTest = await testWebhookSignature()
      results.push(signatureTest)
    }

    // Test 3: Content Revalidation Flow
    if (tests === 'all' || tests.includes('revalidation')) {
      const revalidationTest = await testContentRevalidation()
      results.push(revalidationTest)
    }

    // Test 4: Deploy Hook Integration
    if (tests === 'all' || tests.includes('deploy')) {
      const deployTest = await testDeployHookIntegration()
      results.push(deployTest)
    }

    // Test 5: Build Monitoring
    if (tests === 'all' || tests.includes('monitoring')) {
      const monitoringTest = await testBuildMonitoring()
      results.push(monitoringTest)
    }

    // Test 6: Error Handling
    if (tests === 'all' || tests.includes('errors')) {
      const errorTest = await testErrorHandling()
      results.push(errorTest)
    }

    // Calculate summary
    const passed = results.filter(r => r.success).length
    const failed = results.length - passed
    const totalDuration = Date.now() - startTime

    const testSuite: E2ETestSuite = {
      name: 'Webhook E2E Test Suite',
      results: verbose ? results : results.map(r => ({
        test: r.test,
        success: r.success,
        duration: r.duration,
        error: r.error
      })),
      summary: {
        total: results.length,
        passed,
        failed,
        duration: totalDuration
      }
    }

    return NextResponse.json({
      status: passed === results.length ? 'success' : 'partial',
      testSuite,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('E2E test suite error:', error)
    return NextResponse.json(
      {
        error: 'Test suite failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        results,
        duration: Date.now() - startTime
      },
      { status: 500 }
    )
  }
}

async function testWebhookConfiguration(): Promise<TestResult> {
  const startTime = Date.now()

  try {
    const validation = webhookManager.validateConfig()

    return {
      test: 'Webhook Configuration Validation',
      success: validation.valid,
      duration: Date.now() - startTime,
      details: validation,
      error: validation.valid ? undefined : validation.issues.join(', ')
    }
  } catch (error) {
    return {
      test: 'Webhook Configuration Validation',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testWebhookSignature(): Promise<TestResult> {
  const startTime = Date.now()

  try {
    const testPayload = webhookManager.generateTestPayload('post')
    const secret = webhookManager.getWebhookSecret()
    const body = JSON.stringify(testPayload)

    // Generate valid signature
    const signature = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    const response = await fetch(webhookManager.getWebhookEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature-256': signature,
        'X-Test-Request': 'true'
      },
      body
    })

    const responseData = await response.json()

    return {
      test: 'Webhook Signature Verification',
      success: response.ok && responseData.success,
      duration: Date.now() - startTime,
      details: {
        status: response.status,
        response: responseData
      },
      error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
    }
  } catch (error) {
    return {
      test: 'Webhook Signature Verification',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testContentRevalidation(): Promise<TestResult> {
  const startTime = Date.now()

  try {
    const testPayloads = [
      {
        event: 'content.updated',
        data: {
          type: 'post' as const,
          slug: 'test-post',
          domain: 'staging.howtomecm.com',
          action: 'update' as const
        },
        timestamp: new Date().toISOString()
      },
      {
        event: 'content.updated',
        data: {
          type: 'page' as const,
          slug: 'test-page',
          domain: 'staging.howtomecm.com',
          action: 'update' as const
        },
        timestamp: new Date().toISOString()
      },
      {
        event: 'settings.updated',
        data: {
          type: 'settings' as const,
          domain: 'staging.howtomecm.com',
          action: 'update' as const
        },
        timestamp: new Date().toISOString()
      }
    ]

    const results = []

    for (const payload of testPayloads) {
      const result = await webhookManager.testWebhook(payload)
      results.push({
        type: payload.data.type,
        success: result.success,
        response: result.response
      })
    }

    const allSuccessful = results.every(r => r.success)

    return {
      test: 'Content Revalidation Flow',
      success: allSuccessful,
      duration: Date.now() - startTime,
      details: results,
      error: allSuccessful ? undefined : 'Some revalidation tests failed'
    }
  } catch (error) {
    return {
      test: 'Content Revalidation Flow',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testDeployHookIntegration(): Promise<TestResult> {
  const startTime = Date.now()

  try {
    // Test staging deploy hook (if configured)
    const stagingHook = webhookManager.getDeployHook('staging')
    const productionHook = webhookManager.getDeployHook('production')

    const results = {
      staging: {
        configured: !!stagingHook.url,
        tested: false,
        success: false
      },
      production: {
        configured: !!productionHook.url,
        tested: false,
        success: false
      }
    }

    // Only test if hooks are configured (to avoid triggering actual deployments)
    // In a real scenario, you might want to have test-specific hooks

    return {
      test: 'Deploy Hook Integration',
      success: results.staging.configured && results.production.configured,
      duration: Date.now() - startTime,
      details: results,
      error: (!results.staging.configured || !results.production.configured)
        ? 'Deploy hooks not properly configured'
        : undefined
    }
  } catch (error) {
    return {
      test: 'Deploy Hook Integration',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testBuildMonitoring(): Promise<TestResult> {
  const startTime = Date.now()

  try {
    // Test deployment monitoring functionality
    const testDeploymentId = `test-${Date.now()}`

    // Simulate deployment lifecycle
    deploymentMonitor.startDeployment(testDeploymentId, 'staging')
    deploymentMonitor.markBuilding(testDeploymentId, ['Test build started'])
    deploymentMonitor.markReady(testDeploymentId, 'https://test.example.com', 30000)

    // Verify monitoring data
    const deployment = deploymentMonitor.getDeployment(testDeploymentId)
    const metrics = deploymentMonitor.getBuildMetrics('staging')
    const status = deploymentMonitor.getStatusSummary()

    const success = !!(
      deployment &&
      deployment.status === 'ready' &&
      metrics &&
      status
    )

    return {
      test: 'Build Monitoring',
      success,
      duration: Date.now() - startTime,
      details: {
        deployment,
        metrics,
        status
      },
      error: success ? undefined : 'Build monitoring test failed'
    }
  } catch (error) {
    return {
      test: 'Build Monitoring',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testErrorHandling(): Promise<TestResult> {
  const startTime = Date.now()

  try {
    const errorTests = [
      {
        name: 'Invalid JSON',
        body: 'invalid json',
        expectedStatus: 400
      },
      {
        name: 'Missing signature',
        body: JSON.stringify({ test: 'data' }),
        headers: {},
        expectedStatus: 401
      },
      {
        name: 'Invalid signature',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'X-Signature-256': 'invalid-signature' },
        expectedStatus: 401
      },
      {
        name: 'Invalid payload structure',
        body: JSON.stringify({ invalid: 'payload' }),
        headers: { 'X-Signature-256': 'sha256=test' },
        expectedStatus: 400
      }
    ]

    const results = []

    for (const errorTest of errorTests) {
      try {
        const response = await fetch(webhookManager.getWebhookEndpoint(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(errorTest.headers as Record<string, string>)
          },
          body: errorTest.body
        })

        results.push({
          name: errorTest.name,
          success: response.status === errorTest.expectedStatus,
          actualStatus: response.status,
          expectedStatus: errorTest.expectedStatus
        })
      } catch (error) {
        results.push({
          name: errorTest.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const allSuccessful = results.every(r => r.success)

    return {
      test: 'Error Handling',
      success: allSuccessful,
      duration: Date.now() - startTime,
      details: results,
      error: allSuccessful ? undefined : 'Some error handling tests failed'
    }
  } catch (error) {
    return {
      test: 'Error Handling',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    service: 'e2e-webhook-tests',
    availableTests: [
      'config - Webhook configuration validation',
      'signature - Webhook signature verification',
      'revalidation - Content revalidation flow',
      'deploy - Deploy hook integration',
      'monitoring - Build monitoring',
      'errors - Error handling'
    ],
    usage: {
      runAll: 'POST /api/test/e2e with { "tests": "all" }',
      runSpecific: 'POST /api/test/e2e with { "tests": ["config", "signature"] }',
      verbose: 'Add { "verbose": true } for detailed results'
    },
    timestamp: new Date().toISOString()
  })
}