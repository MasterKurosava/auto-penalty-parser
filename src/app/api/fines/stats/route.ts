import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const user = await requireAuth()

    const stats = await prisma.fine.groupBy({
      by: ['ecpAuthId'],
      where: {
        ecpAuth: {
          userId: user.userId,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        amountTotal: true,
      },
    })

    const ecpIds = stats.map((s) => s.ecpAuthId)
    const ecpAuths = await prisma.ecpAuth.findMany({
      where: {
        id: { in: ecpIds },
      },
      select: {
        id: true,
        label: true,
        iinBin: true,
      },
    })

    const ecpMap = new Map(ecpAuths.map((k) => [k.id, k]))

    const formattedStats = stats.map((stat) => ({
      ecpAuth: ecpMap.get(stat.ecpAuthId),
      count: stat._count?.id || 0,
      totalAmount: stat._sum?.amountTotal?.toString() || '0',
    }))

    const overallTotal = stats.reduce(
      (acc, stat) => {
        acc.count += stat._count?.id || 0
        acc.totalAmount += Number(stat._sum?.amountTotal || 0)
        return acc
      },
      { count: 0, totalAmount: 0 }
    )

    return NextResponse.json({
      byEcp: formattedStats,
      overall: {
        count: overallTotal.count,
        totalAmount: overallTotal.totalAmount.toString(),
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

