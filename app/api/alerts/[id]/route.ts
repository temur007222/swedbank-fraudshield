import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: params.id },
      include: {
        transaction: {
          include: {
            customer: true,
          },
        },
        communication: true,
        actions: {
          include: {
            user: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { timestamp: 'desc' },
        },
      },
    })

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Failed to fetch alert:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alert' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, chainEntry } = body

    const alert = await prisma.alert.findUnique({
      where: { id: params.id },
    })

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (status) {
      updateData.status = status
    }

    if (chainEntry) {
      const existingChain = JSON.parse(alert.chainOfResponsibility)
      existingChain.push({
        ...chainEntry,
        timestamp: new Date().toISOString(),
      })
      updateData.chainOfResponsibility = JSON.stringify(existingChain)
    }

    const updated = await prisma.alert.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}
