import { NextRequest, NextResponse } from 'next/server'
import { serverHttp } from '@/lib/axios'
import { getPsapCookies, formatCookiesForProxy } from '@/lib/cookies'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 минут для загрузки всех данных

interface Fine {
  id: string
  rid: string
  caseNumber: string
  commitDate: string
  lastAp: any
  av1f: any
  av1j: any
  av1o: any
  article: any
  paid: number
  penaltyMeasure: any
}

export async function GET(request: NextRequest) {
  try {
    const psapCookies = await getPsapCookies()

    if (!psapCookies.token) {
      return NextResponse.json(
        { error: 'Not authenticated with PSAP. Please connect EDS first.' },
        { status: 401 }
      )
    }

    const allFines: Fine[] = []
    let pageNum = 1
    let hasMore = true
    const limit = 100 // Загружаем по 100 штрафов за раз

    // Загружаем все страницы
    while (hasMore) {
      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        limit: limit.toString(),
        orderBy: 'desc'
      })

      const response = await serverHttp.get(
        `/psap/api/cases/load/?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${psapCookies.token}`,
            Cookie: formatCookiesForProxy(psapCookies),
            Accept: 'application/json',
          },
        }
      )

      if (response.status !== 200) {
        return NextResponse.json(
          { error: 'Failed to fetch cases', details: response.data },
          { status: response.status }
        )
      }

      const data = response.data

      if (data && Array.isArray(data)) {
        allFines.push(...data)

        // Если получили меньше записей чем лимит, значит это последняя страница
        if (data.length < limit) {
          hasMore = false
        } else {
          pageNum++
        }
      } else {
        hasMore = false
      }
    }

    return NextResponse.json({
      success: true,
      total: allFines.length,
      data: allFines,
    })
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return NextResponse.json(
        {
          error: 'PSAP authentication expired. Please reconnect EDS.',
          details: error.message,
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch all fines', details: error.message },
      { status: error.response?.status || 500 }
    )
  }
}

