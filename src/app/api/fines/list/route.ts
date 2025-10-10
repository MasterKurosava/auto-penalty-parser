import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { fineFilterSchema } from '@/lib/auth-validations'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)

    const filters = fineFilterSchema.parse({
      ecpAuthId: searchParams.get('ecpAuthId') || undefined,
      status: searchParams.get('status') || undefined,
      vehicleNumber: searchParams.get('vehicleNumber') || undefined,
      search: searchParams.get('search') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      sortField: searchParams.get('sortField'),
      sortDirection: searchParams.get('sortDirection'),
    })

    const where: any = {
      ecpAuth: {
        userId: user.userId,
      },
    }

    if (filters.ecpAuthId) {
      where.ecpAuthId = filters.ecpAuthId
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.vehicleNumber) {
      where.vehicleNumber = { contains: filters.vehicleNumber, mode: 'insensitive' }
    }

    if (filters.search) {
      where.OR = [
        { externalId: { contains: filters.search, mode: 'insensitive' } },
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { vehicleNumber: { contains: filters.search, mode: 'insensitive' } },
        { serialNumber: { contains: filters.search, mode: 'insensitive' } },
        { caseNumber: { contains: filters.search, mode: 'insensitive' } },
        { articleCode: { contains: filters.search, mode: 'insensitive' } },
        { articleName: { contains: filters.search, mode: 'insensitive' } },
        { ecpAuth: { iinBin: { contains: filters.search, mode: 'insensitive' } } },
      ]
    }

    if (filters.dateFrom || filters.dateTo) {
      where.commitDate = {}
      if (filters.dateFrom) {
        where.commitDate.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        where.commitDate.lte = new Date(filters.dateTo + 'T23:59:59.999Z')
      }
    }

    const [fines, total] = await Promise.all([
      prisma.fine.findMany({
        where,
        select: {
          id: true,
          externalId: true,
          status: true,
          commitDate: true,
          decisionDate: true,
          caseNumber: true,
          fullName: true,
          vehicleNumber: true,
          serialNumber: true,
          articleCode: true,
          articleName: true,
          amountTotal: true,
          pdfUrl: true,
          createdAt: true,
          updatedAt: true,
          ecpAuth: {
            select: {
              id: true,
              label: true,
              iinBin: true,
            },
          },
        },
        orderBy: {
          [filters.sortField]: filters.sortDirection,
        },
        take: filters.limit,
        skip: filters.offset,
      }),
      prisma.fine.count({ where }),
    ])

    return NextResponse.json({
      fines,
      total,
      limit: filters.limit,
      offset: filters.offset,
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
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
