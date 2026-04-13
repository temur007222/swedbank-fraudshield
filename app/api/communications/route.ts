import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const type = searchParams.get('type')
    const classification = searchParams.get('classification')
    const minScore = searchParams.get('minScore')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (type) {
      where.type = type
    }

    if (classification) {
      where.classification = classification
    }

    if (minScore) {
      where.fraudScore = { gte: parseFloat(minScore) }
    }

    const [communications, total] = await Promise.all([
      prisma.communication.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          linkedAlerts: {
            select: {
              id: true,
              severity: true,
              status: true,
            },
          },
        },
      }),
      prisma.communication.count({ where }),
    ])

    return NextResponse.json({
      communications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch communications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    )
  }
}
