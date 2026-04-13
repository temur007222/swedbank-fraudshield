import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const actionToStatusMap: Record<string, string> = {
  APPROVE: 'APPROVED',
  BLOCK: 'BLOCKED',
  FLAG: 'FLAGGED',
  ESCALATE: 'ESCALATED',
  DISMISS: 'APPROVED',
  NOTE: '',
}

const escalationTargetMap: Record<string, string> = {
  BANK_ANALYST: 'AUTHORITY_OFFICER',
  TELECOM_OPERATOR: 'BANK_ANALYST',
  AUTHORITY_OFFICER: 'BANK_ANALYST',
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { actionType, details, userId } = body

    if (!actionType || !userId) {
      return NextResponse.json(
        { error: 'actionType and userId are required' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const newStatus = actionToStatusMap[actionType]

    const action = await prisma.action.create({
      data: {
        userId,
        transactionId: params.id,
        actionType: actionType as 'APPROVE' | 'BLOCK' | 'FLAG' | 'ESCALATE' | 'DISMISS' | 'NOTE',
        details,
      },
    })

    if (newStatus) {
      await prisma.transaction.update({
        where: { id: params.id },
        data: {
          status: newStatus as 'PENDING' | 'APPROVED' | 'FLAGGED' | 'BLOCKED' | 'UNDER_REVIEW' | 'ESCALATED',
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        action: actionType,
        entityType: 'Transaction',
        entityId: params.id,
        userId,
        inputData: JSON.stringify({ actionType, details }),
        outputData: JSON.stringify({ newStatus, actionId: action.id }),
        explanation: `User ${user.name} performed ${actionType} on transaction ${transaction.externalId}`,
      },
    })

    if (actionType === 'ESCALATE') {
      const targetRole = escalationTargetMap[user.role] || 'AUTHORITY_OFFICER'

      await prisma.alert.create({
        data: {
          sourceRole: user.role as 'BANK_ANALYST' | 'TELECOM_OPERATOR' | 'AUTHORITY_OFFICER',
          targetRole: targetRole as 'BANK_ANALYST' | 'TELECOM_OPERATOR' | 'AUTHORITY_OFFICER',
          transactionId: params.id,
          severity: transaction.riskLevel,
          status: 'OPEN',
          description: details || `Transaction ${transaction.externalId} escalated by ${user.name}`,
          evidence: JSON.stringify([
            {
              type: 'escalation',
              riskScore: transaction.riskScore,
              aiFlags: transaction.aiFlags,
              timestamp: new Date().toISOString(),
            },
          ]),
          chainOfResponsibility: JSON.stringify([
            {
              role: user.role,
              userId: user.id,
              action: 'ESCALATE',
              timestamp: new Date().toISOString(),
            },
          ]),
        },
      })
    }

    return NextResponse.json({
      success: true,
      action,
      newStatus: newStatus || transaction.status,
    })
  } catch (error) {
    console.error('Failed to perform action:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}
