import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { encryptToken } from '@/lib/crypto'
import { ecpAuthSchema } from '@/lib/auth-validations'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const data = ecpAuthSchema.parse(body)

    const authTokenEnc = await encryptToken(data.authToken)
    const refreshTokenEnc = data.refreshToken
      ? await encryptToken(data.refreshToken)
      : null
    const uuidEnc = await encryptToken(data.uuid)

    const existingAuth = await prisma.ecpAuth.findUnique({
      where: {
        userId_iinBin: {
          userId: user.userId,
          iinBin: data.iinBin,
        },
      },
    })

    if (existingAuth) {
      const updatedAuth = await prisma.ecpAuth.update({
        where: { id: existingAuth.id },
        data: {
          // Если label передан (не null и не undefined), обновляем его, иначе сохраняем старое
          ...(data.label !== null && data.label !== undefined ? { label: data.label } : {}),
          authTokenEnc,
          refreshTokenEnc,
          uuidEnc,
          psapId: data.psapId,
          isValid: true,
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        ecpAuth: {
          id: updatedAuth.id,
          label: updatedAuth.label,
          iinBin: updatedAuth.iinBin,
          isActive: updatedAuth.isActive,
        },
      })
    } else {
      const newAuth = await prisma.ecpAuth.create({
        data: {
          userId: user.userId,
          label: data.label || null,
          iinBin: data.iinBin,
          authTokenEnc,
          refreshTokenEnc,
          uuidEnc,
          psapId: data.psapId,
          isValid: true,
          isActive: true,
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      return NextResponse.json(
        {
          ecpAuth: {
            id: newAuth.id,
            label: newAuth.label,
            iinBin: newAuth.iinBin,
            isActive: newAuth.isActive,
          },
        },
        { status: 201 }
      )
    }
  } catch (error: any) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Не авторизован. Пожалуйста, войдите в систему.' },
        { status: 401 }
      )
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Пользователь не найден. Пожалуйста, выйдите и войдите снова.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера', details: error.message },
      { status: 500 }
    )
  }
}
