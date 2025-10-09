import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register']
const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/psap']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Allow public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('session')

  if (!sessionCookie) {
    // Not authenticated - redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify JWT token
    if (!process.env.JWT_PUBLIC_KEY) {
      throw new Error('JWT_PUBLIC_KEY not configured')
    }

    const publicKey = Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString('utf-8')
    const key = new TextEncoder().encode(publicKey)

    // Import public key
    const keyString = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/-----BEGIN RSA PUBLIC KEY-----/, '')
      .replace(/-----END RSA PUBLIC KEY-----/, '')
      .replace(/\s/g, '')

    const binaryKey = Buffer.from(keyString, 'base64')
    const cryptoKey = await crypto.subtle.importKey(
      'spki',
      binaryKey,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['verify']
    )

    await jwtVerify(sessionCookie.value, cryptoKey, {
      issuer: 'penalty-parser',
      audience: 'penalty-parser-users',
    })

    // Token is valid, proceed
    return NextResponse.next()
  } catch (error) {
    // Invalid token - clear cookie and redirect
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url))

    response.cookies.delete('session')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
}

