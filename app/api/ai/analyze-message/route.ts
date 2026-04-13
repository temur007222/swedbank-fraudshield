import { NextRequest, NextResponse } from 'next/server'
import { analyzeCommunication } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await analyzeCommunication(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI analysis failed:', error)

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'AI service timeout' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to analyze communication' },
      { status: 502 }
    )
  }
}
