import { NextResponse } from 'next/server'
import { clients } from '@/lib/sse'

export const dynamic = 'force-dynamic'

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      clients.add(controller)

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeat)
          clients.delete(controller)
        }
      }, 30000)

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', clientCount: clients.size })}\n\n`)
      )
    },
    cancel(controller) {
      clients.delete(controller as unknown as ReadableStreamDefaultController<Uint8Array>)
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
