import { cookies } from 'next/headers'
import { createToken, verifyToken } from './jwt'

const COOKIE_NAME = 'session'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
}

export async function createSession(userId: string, username: string) {
  const token = await createToken(userId, username)
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS)

  return token
}

export async function getCurrentUser(): Promise<{
  userId: string
  username: string
} | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    const payload = await verifyToken(token)

    return {
      userId: payload.userId,
      username: payload.username,
    }
  } catch (error) {
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

