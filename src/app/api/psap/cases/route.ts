import { NextRequest, NextResponse } from 'next/server'
import { serverHttp } from '@/lib/axios'
import { getPsapCookies, formatCookiesForProxy } from '@/lib/cookies'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const psapCookies = await getPsapCookies()

    if (!psapCookies.token) {
      return NextResponse.json(
        { error: 'Not authenticated with PSAP. Please connect EDS first.' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') || '10'
    const pageNum = searchParams.get('pageNum') || '1'
    const orderBy = searchParams.get('orderBy') || 'desc'

    const params = new URLSearchParams({ pageNum, limit, orderBy })

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

    return NextResponse.json({
      success: true,
      data: response.data,
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
      { error: 'Failed to fetch cases', details: error.message },
      { status: error.response?.status || 500 }
    )
  }
}
