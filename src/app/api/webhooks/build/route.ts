import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createRevalidationManager, RevalidationResult } from '../../../../lib/revalidation'

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret'

interface WebhookPayload {
  event: string
  data: {
    type: 'post' | 'page' | 'settings' | 'media'
    id?: string
    slug?: string
    domain: string
    status?: string
    action: 'create' | 'update' | 'delete'
  }
  timestamp: string
}

// Verify webhook signature for security
function verifySignature(payload: string, signature: string): boolean {
  if (!signature) return false

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  const receivedSignature = signature.replace('sha256=', '')

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  )
}

// Handle revalidation based on content type and action
function handleRevalidation(payload: WebhookPayload): RevalidationResult {
  const { data } = payload
  const manager = createRevalidationManager()

  try {
    switch (data.type) {
      case 'post':
        manager.revalidateBlogPost(data.slug, data.action)
        break

      case 'page':
        manager.revalidatePage(data.slug, data.action)
        break

      case 'settings':
        manager.revalidateGlobalSettings()
        break

      case 'media':
        manager.revalidateMedia(data.id)
        break

      default:
        console.warn(`Unknown content type: ${data.type}`)
        return manager.getErrorResult(`Unknown content type: ${data.type}`)
    }

    return manager.getResult()
  } catch (error) {
    console.error('Revalidation error:', error)
    return manager.getErrorResult(error instanceof Error ? error.message : 'Unknown error')
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get the raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-signature-256') ||
                     request.headers.get('x-hub-signature-256') || ''

    // Verify webhook signature
    if (!verifySignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse the payload
    let payload: WebhookPayload
    try {
      payload = JSON.parse(body)
    } catch (error) {
      console.error('Invalid JSON payload:', error)
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // Validate payload structure
    if (!payload.event || !payload.data || !payload.data.type) {
      return NextResponse.json(
        { error: 'Invalid payload structure' },
        { status: 400 }
      )
    }

    console.log(`Webhook received: ${payload.event}`, {
      type: payload.data.type,
      action: payload.data.action,
      id: payload.data.id,
      slug: payload.data.slug,
      domain: payload.data.domain
    })

    // Handle revalidation
    const revalidationResult = handleRevalidation(payload)

    if (!revalidationResult.success) {
      console.error('Revalidation failed:', revalidationResult.error)
      return NextResponse.json(
        {
          error: 'Revalidation failed',
          details: revalidationResult.error,
          processingTime: revalidationResult.processingTime
        },
        { status: 500 }
      )
    }

    // Log success
    console.log(`Webhook processed successfully in ${revalidationResult.processingTime}ms`, {
      event: payload.event,
      revalidatedPaths: revalidationResult.revalidatedPaths,
      revalidatedTags: revalidationResult.revalidatedTags,
      processingTime: revalidationResult.processingTime
    })

    return NextResponse.json({
      success: true,
      event: payload.event,
      revalidated: {
        paths: revalidationResult.revalidatedPaths,
        tags: revalidationResult.revalidatedTags
      },
      processingTime: revalidationResult.processingTime
    })

  } catch (error) {
    const processingTime = Date.now() - startTime

    console.error('Webhook processing error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        processingTime
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'webhook-handler',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
}