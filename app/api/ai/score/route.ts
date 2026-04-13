import { NextRequest, NextResponse } from 'next/server'
import { scoreTransaction } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await scoreTransaction(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI scoring failed:', error)

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'AI service timeout' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to score transaction' },
      { status: 502 }
    )
  }
}
