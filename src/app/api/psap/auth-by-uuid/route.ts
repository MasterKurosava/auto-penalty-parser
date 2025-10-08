import { NextRequest, NextResponse } from 'next/server'
import { serverHttp } from '@/lib/axios'
import { setPsapCookies } from '@/lib/cookies'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const signedXml = await request.text()
    if (!signedXml) {
      return NextResponse.json({ error: 'Missing signed XML' }, { status: 400 })
    }

    const response = await serverHttp.post(
      '/psap/api/auth/psap/by-access-uuid',
      signedXml,
      {
        headers: {
          'Content-Type': 'application/xml',
          Accept: 'application/json',
        },
      }
    )

    const { uuid, token, refreshToken, id, iin } = response.data

    await setPsapCookies({ uuid, token, refreshToken })

    return NextResponse.json({ uuid, id, iin })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Authentication failed', details: error.message },
      { status: error.response?.status || 500 }
    )
  }
}

