import { NextResponse } from 'next/server'
import { getModelMetrics } from '@/lib/ai-client'

export async function GET() {
  try {
    const result = await getModelMetrics()
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI metrics fetch failed:', error)

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'AI service timeout' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch model metrics' },
      { status: 502 }
    )
  }
}
