import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

interface TokenPayload extends JWTPayload {
  userId: string
  username: string
}

function getPrivateKey(): Uint8Array {
  const key = process.env.JWT_PRIVATE_KEY
  if (!key) {
    throw new Error('JWT_PRIVATE_KEY is not set in environment variables')
  }
  const pem = Buffer.from(key, 'base64').toString('utf-8')
  return new TextEncoder().encode(pem)
}

function getPublicKey(): Uint8Array {
  const key = process.env.JWT_PUBLIC_KEY
  if (!key) {
    throw new Error('JWT_PUBLIC_KEY is not set in environment variables')
  }
  const pem = Buffer.from(key, 'base64').toString('utf-8')
  return new TextEncoder().encode(pem)
}

/**
 * Create a JWT token for user session
 * @param userId - User's unique ID
 * @param username - User's username
 * @param expiresIn - Token expiration (default: 30 days)
 */
export async function createToken(
  userId: string,
  username: string,
  expiresIn: string = '30d'
): Promise<string> {
  const privateKey = await importPrivateKey(getPrivateKey())

  const token = await new SignJWT({
    userId,
    username,
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setIssuer('penalty-parser')
    .setAudience('penalty-parser-users')
    .sign(privateKey)

  return token
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const publicKey = await importPublicKey(getPublicKey())

  const { payload } = await jwtVerify(token, publicKey, {
    issuer: 'penalty-parser',
    audience: 'penalty-parser-users',
  })

  return payload as TokenPayload
}

async function importPrivateKey(keyData: Uint8Array): Promise<CryptoKey> {
  const keyString = new TextDecoder().decode(keyData)

  const pemContents = keyString
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
    .replace(/-----END RSA PRIVATE KEY-----/, '')
    .replace(/\s/g, '')

  const binaryKey = Buffer.from(pemContents, 'base64')

  return await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  )
}

async function importPublicKey(keyData: Uint8Array): Promise<CryptoKey> {
  const keyString = new TextDecoder().decode(keyData)

  const pemContents = keyString
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/-----BEGIN RSA PUBLIC KEY-----/, '')
    .replace(/-----END RSA PUBLIC KEY-----/, '')
    .replace(/\s/g, '')

  const binaryKey = Buffer.from(pemContents, 'base64')

  return await crypto.subtle.importKey(
    'spki',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['verify']
  )
}

