import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params
    const body = await request.json()
    const { selected } = body

    if (typeof selected !== 'boolean') {
      return NextResponse.json(
        { error: 'Параметр selected должен быть boolean' },
        { status: 400 }
      )
    }

    const ecpAuth = await prisma.ecpAuth.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    })

    if (!ecpAuth) {
      return NextResponse.json(
        { error: 'ЭЦП не найдена' },
        { status: 404 }
      )
    }

    await prisma.ecpAuth.update({
      where: { id },
      data: { isActive: selected },
    })

    return NextResponse.json({ success: true, selected })
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

