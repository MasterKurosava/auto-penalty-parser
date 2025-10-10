import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ecpUpdateSchema } from '@/lib/auth-validations'
import { ZodError } from 'zod'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const ecpAuthId = params.id
    const body = await request.json()

    const data = ecpUpdateSchema.parse(body)

    const ecpAuth = await prisma.ecpAuth.findFirst({
      where: {
        id: ecpAuthId,
        userId: user.userId,
      },
    })

    if (!ecpAuth) {
      return NextResponse.json(
        { error: 'Аутентификация не найдена' },
        { status: 404 }
      )
    }

    const updated = await prisma.ecpAuth.update({
      where: { id: ecpAuthId },
      data: {
        label: data.label,
        isActive: data.isActive,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        label: true,
        iinBin: true,
        isActive: true,
        isValid: true,
      },
    })

    return NextResponse.json({ ecpAuth: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const ecpAuthId = params.id

    const ecpAuth = await prisma.ecpAuth.findFirst({
      where: {
        id: ecpAuthId,
        userId: user.userId,
      },
    })

    if (!ecpAuth) {
      return NextResponse.json(
        { error: 'Аутентификация не найдена' },
        { status: 404 }
      )
    }

    await prisma.ecpAuth.delete({
      where: { id: ecpAuthId },
    })

    return NextResponse.json({ success: true })
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
