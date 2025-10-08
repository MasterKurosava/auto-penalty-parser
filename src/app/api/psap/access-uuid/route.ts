import { NextResponse } from 'next/server'
import { serverHttp } from '@/lib/axios'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const response = await serverHttp.get('/psap/api/auth/psap/access-uuid', {
      headers: { Accept: 'application/xml' },
      responseType: 'text',
    })

    const guidMatch = response.data.match(/<guid>([^<]+)<\/guid>/i)
    if (!guidMatch) {
      return NextResponse.json(
        { error: 'Failed to extract GUID from response' },
        { status: 500 }
      )
    }

    return NextResponse.json({ guid: guidMatch[1], xml: response.data })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch access UUID', details: error.message },
      { status: error.response?.status || 500 }
    )
  }
}

