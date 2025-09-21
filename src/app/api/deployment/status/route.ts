import { NextRequest, NextResponse } from 'next/server'
import { deploymentMonitor } from '../../../../lib/deployment-monitor'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const environment = searchParams.get('environment') as 'staging' | 'production' | null
  const format = searchParams.get('format') || 'summary'

  try {
    switch (format) {
      case 'summary':
        return NextResponse.json({
          status: 'success',
          data: deploymentMonitor.getStatusSummary(),
          timestamp: new Date().toISOString()
        })

      case 'metrics':
        const metrics = environment
          ? deploymentMonitor.getBuildMetrics(environment)
          : {
              staging: deploymentMonitor.getBuildMetrics('staging'),
              production: deploymentMonitor.getBuildMetrics('production'),
              overall: deploymentMonitor.getBuildMetrics()
            }

        return NextResponse.json({
          status: 'success',
          data: metrics,
          environment,
          timestamp: new Date().toISOString()
        })

      case 'history':
        const limit = parseInt(searchParams.get('limit') || '10')
        const history = environment
          ? deploymentMonitor.getDeploymentsByEnvironment(environment).slice(0, limit)
          : deploymentMonitor.getHistory(limit)

        return NextResponse.json({
          status: 'success',
          data: history,
          environment,
          limit,
          timestamp: new Date().toISOString()
        })

      case 'latest':
        if (!environment) {
          return NextResponse.json(
            { error: 'Environment parameter required for latest format' },
            { status: 400 }
          )
        }

        const latest = deploymentMonitor.getLatestDeployment(environment)

        return NextResponse.json({
          status: 'success',
          data: latest || null,
          environment,
          timestamp: new Date().toISOString()
        })

      case 'export':
        return NextResponse.json({
          status: 'success',
          data: deploymentMonitor.exportData(),
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: 'Invalid format. Supported: summary, metrics, history, latest, export' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Deployment status error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, deploymentId, environment, status, url, error, buildTime, buildLogs } = await request.json()

    if (!deploymentId || !environment) {
      return NextResponse.json(
        { error: 'deploymentId and environment are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'start':
        deploymentMonitor.startDeployment(deploymentId, environment)
        break

      case 'building':
        deploymentMonitor.markBuilding(deploymentId, buildLogs)
        break

      case 'ready':
        deploymentMonitor.markReady(deploymentId, url, buildTime)
        break

      case 'failed':
        deploymentMonitor.markFailed(deploymentId, error || 'Unknown error', buildLogs)
        break

      case 'update':
        deploymentMonitor.updateDeployment({
          id: deploymentId,
          environment,
          status,
          url,
          error,
          buildLogs
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: start, building, ready, failed, update' },
          { status: 400 }
        )
    }

    const updatedDeployment = deploymentMonitor.getDeployment(deploymentId)

    return NextResponse.json({
      status: 'success',
      action,
      deployment: updatedDeployment,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Deployment status update error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}