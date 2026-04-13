import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const targetRole = searchParams.get('targetRole')
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (targetRole) {
      where.targetRole = targetRole
    }

    if (status) {
      where.status = status
    }

    if (severity) {
      where.severity = severity
    }

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          transaction: {
            select: {
              id: true,
              externalId: true,
              amount: true,
              merchantName: true,
              riskScore: true,
            },
          },
          communication: {
            select: {
              id: true,
              type: true,
              fraudScore: true,
              classification: true,
            },
          },
        },
      }),
      prisma.alert.count({ where }),
    ])

    return NextResponse.json({
      alerts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sourceRole,
      targetRole,
      transactionId,
      communicationId,
      severity,
      description,
      evidence,
      chainOfResponsibility,
    } = body

    if (!sourceRole || !targetRole || !severity || !description) {
      return NextResponse.json(
        { error: 'sourceRole, targetRole, severity, and description are required' },
        { status: 400 }
      )
    }

    const alert = await prisma.alert.create({
      data: {
        sourceRole,
        targetRole,
        transactionId: transactionId || null,
        communicationId: communicationId || null,
        severity,
        description,
        evidence: evidence ? JSON.stringify(evidence) : '[]',
        chainOfResponsibility: chainOfResponsibility
          ? JSON.stringify(chainOfResponsibility)
          : '[]',
      },
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error('Failed to create alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}
