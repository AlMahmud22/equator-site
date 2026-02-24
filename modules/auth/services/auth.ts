import jwt from 'jsonwebtoken'
import { NextApiRequest } from 'next'
import { parse as parseCookies } from 'cookie'
import { signJwt } from '@/lib/auth/jwt-types'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local')
}

export interface JWTPayload {
  userId: string
  email: string
  authType: string
  huggingFaceToken?: string
}

export function generateToken(payload: JWTPayload): string {
  return signJwt(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'equator-tech',
    audience: 'equator-users'
  })
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'equator-tech',
      audience: 'equator-users'
    })
    return decoded as JWTPayload
  } catch {
    throw new Error('Invalid or expired token')
  }
}

export function extractTokenFromRequest(req: NextApiRequest): string | null {
  // First check for Bearer token in Authorization header
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Then check for token in cookies
  const cookies = parseCookies(req.headers.cookie || '')
  return cookies.token || null
}

export function getTokenPayload(req: NextApiRequest): JWTPayload | null {
  try {
    const token = extractTokenFromRequest(req)
    if (!token) return null
    
    return verifyToken(token)
  } catch {
    return null
  }
}
