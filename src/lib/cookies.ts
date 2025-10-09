import { cookies } from 'next/headers'

const isProd = process.env.NODE_ENV === 'production'

export interface PsapCookies {
  uuid?: string
  token?: string
  tokenCreatedAt?: string
  refreshToken?: string
}

export async function getPsapCookies(): Promise<PsapCookies> {
  const cookieStore = await cookies()

  return {
    uuid: cookieStore.get('psap-uuid')?.value,
    token: cookieStore.get('psap-token')?.value,
    tokenCreatedAt: cookieStore.get('psap-token-created-at')?.value,
    refreshToken: cookieStore.get('psap-refresh-token')?.value,
  }
}

export async function setPsapCookies(data: {
  uuid: string
  token: string
  refreshToken?: string
}) {
  const cookieStore = await cookies()
  const options = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }

  cookieStore.set('psap-uuid', data.uuid, options)
  cookieStore.set('psap-token', data.token, options)
  cookieStore.set('psap-token-created-at', new Date().toISOString(), options)

  if (data.refreshToken) {
    cookieStore.set('psap-refresh-token', data.refreshToken, options)
  }
}

export async function clearPsapCookies() {
  const cookieStore = await cookies()

  cookieStore.delete('psap-uuid')
  cookieStore.delete('psap-token')
  cookieStore.delete('psap-token-created-at')
  cookieStore.delete('psap-refresh-token')
}

export function formatCookiesForProxy(psapCookies: PsapCookies): string {
  const parts: string[] = []

  if (psapCookies.uuid) parts.push(`psap-uuid=${psapCookies.uuid}`)
  if (psapCookies.token) parts.push(`psap-token=${psapCookies.token}`)
  if (psapCookies.tokenCreatedAt) {
    parts.push(`psap-token-created-at=${psapCookies.tokenCreatedAt}`)
  }
  if (psapCookies.refreshToken) {
    parts.push(`psap-refresh-token=${psapCookies.refreshToken}`)
  }

  return parts.join('; ')
}

