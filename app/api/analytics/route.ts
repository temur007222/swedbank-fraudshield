import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      allTransactions,
      recentTransactions,
      flaggedByType,
      countryDistribution,
    ] = await Promise.all([
      prisma.transaction.findMany({
        select: {
          id: true,
          type: true,
          riskLevel: true,
          status: true,
          country: true,
          countryCode: true,
          amount: true,
          aiFlags: true,
          timestamp: true,
        },
      }),
      prisma.transaction.findMany({
        where: {
          timestamp: { gte: thirtyDaysAgo },
        },
        select: {
          id: true,
          timestamp: true,
          riskLevel: true,
          status: true,
          amount: true,
        },
        orderBy: { timestamp: 'asc' },
      }),
      prisma.transaction.groupBy({
        by: ['type'],
        where: {
          status: { in: ['FLAGGED', 'BLOCKED', 'ESCALATED'] },
        },
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ['country', 'countryCode'],
        where: {
          status: { in: ['FLAGGED', 'BLOCKED', 'ESCALATED'] },
        },
        _count: { id: true },
        _sum: { amount: true },
      }),
    ])

    const fraudByType = flaggedByType.map((item) => ({
      type: item.type,
      count: item._count.id,
      totalAmount: item._sum.amount || 0,
    }))

    const dailyMap = new Map<string, { total: number; flagged: number; amount: number }>()
    for (const tx of recentTransactions) {
      const day = tx.timestamp.toISOString().split('T')[0]
      const existing = dailyMap.get(day) || { total: 0, flagged: 0, amount: 0 }
      existing.total += 1
      if (['FLAGGED', 'BLOCKED', 'ESCALATED'].includes(tx.status)) {
        existing.flagged += 1
      }
      existing.amount += tx.amount
      dailyMap.set(day, existing)
    }

    const fraudOverTime = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        total: data.total,
        flagged: data.flagged,
        amount: data.amount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const geographicDistribution = countryDistribution.map((item) => ({
      country: item.country,
      countryCode: item.countryCode,
      count: item._count.id,
      totalAmount: item._sum.amount || 0,
    }))

    const patternMap = new Map<string, number>()
    for (const tx of allTransactions) {
      try {
        const flags: string[] = JSON.parse(tx.aiFlags)
        for (const flag of flags) {
          patternMap.set(flag, (patternMap.get(flag) || 0) + 1)
        }
      } catch {
        // skip malformed JSON
      }
    }

    const topPatterns = Array.from(patternMap.entries())
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const totalTransactions = allTransactions.length
    const flaggedTransactions = allTransactions.filter((t) =>
      ['FLAGGED', 'BLOCKED', 'ESCALATED'].includes(t.status)
    ).length
    const riskDistribution = {
      LOW: allTransactions.filter((t) => t.riskLevel === 'LOW').length,
      MEDIUM: allTransactions.filter((t) => t.riskLevel === 'MEDIUM').length,
      HIGH: allTransactions.filter((t) => t.riskLevel === 'HIGH').length,
      CRITICAL: allTransactions.filter((t) => t.riskLevel === 'CRITICAL').length,
    }

    const modelMetrics = {
      totalTransactions,
      flaggedTransactions,
      flagRate: totalTransactions > 0 ? flaggedTransactions / totalTransactions : 0,
      riskDistribution,
    }

    return NextResponse.json({
      fraudByType,
      fraudOverTime,
      geographicDistribution,
      topPatterns,
      modelMetrics,
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
