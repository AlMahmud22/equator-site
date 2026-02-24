import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { isAdmin } from './admin-utils'

export interface TokenPayload {
  // Standard JWT claims
  sub: string // user ID
  aud: string // client ID
  iss: string // issuer (equator.tech)
  iat: number // issued at
  exp: number // expiration
  
  // Custom claims
  email: string
  name: string
  role: 'admin' | 'user'
  scopes: string[]
  
  // Token metadata
  tokenType: 'access' | 'refresh'
  sessionId: string
}

export interface RefreshTokenPayload {
  sub: string // user ID
  aud: string // client ID
  iss: string // issuer
  iat: number
  exp: number
  tokenType: 'refresh'
  sessionId: string
  accessTokenId: string
}

class JWTManager {
  private readonly issuer = 'equator.tech'
  private readonly accessTokenSecret: string
  private readonly refreshTokenSecret: string

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret'
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || process.env.NEXTAUTH_SECRET + '_refresh' || 'fallback-refresh-secret'
  }

  /**
   * Generate access token with user role information
   */
  generateAccessToken(
    userId: string,
    email: string,
    name: string,
    clientId: string,
    scopes: string[],
    ttl: number = 3600, // 1 hour default
    sessionId?: string
  ): string {
    const userRole = isAdmin(email, name) ? 'admin' : 'user'
    const tokenId = crypto.randomBytes(16).toString('hex')
    
    const payload: TokenPayload = {
      sub: userId,
      aud: clientId,
      iss: this.issuer,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + ttl,
      email,
      name,
      role: userRole,
      scopes,
      tokenType: 'access',
      sessionId: sessionId || tokenId
    }

    return jwt.sign(payload, this.accessTokenSecret, {
      algorithm: 'HS256',
      jwtid: tokenId
    })
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(
    userId: string,
    clientId: string,
    accessTokenId: string,
    ttl: number = 2592000, // 30 days default
    sessionId?: string
  ): string {
    const tokenId = crypto.randomBytes(16).toString('hex')
    
    const payload: RefreshTokenPayload = {
      sub: userId,
      aud: clientId,
      iss: this.issuer,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + ttl,
      tokenType: 'refresh',
      sessionId: sessionId || tokenId,
      accessTokenId
    }

    return jwt.sign(payload, this.refreshTokenSecret, {
      algorithm: 'HS256',
      jwtid: tokenId
    })
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        algorithms: ['HS256'],
        issuer: this.issuer
      }) as TokenPayload

      if (decoded.tokenType !== 'access') {
        throw new Error('Invalid token type')
      }

      return decoded
    } catch (error) {
      console.error('Access token verification failed:', error)
      return null
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        algorithms: ['HS256'],
        issuer: this.issuer
      }) as RefreshTokenPayload

      if (decoded.tokenType !== 'refresh') {
        throw new Error('Invalid token type')
      }

      return decoded
    } catch (error) {
      console.error('Refresh token verification failed:', error)
      return null
    }
  }

  /**
   * Generate token pair (access + refresh)
   */
  generateTokenPair(
    userId: string,
    email: string,
    name: string,
    clientId: string,
    scopes: string[],
    accessTtl: number = 3600,
    refreshTtl: number = 2592000
  ): { accessToken: string; refreshToken: string; expiresIn: number } {
    const sessionId = crypto.randomBytes(16).toString('hex')
    
    const accessToken = this.generateAccessToken(
      userId, email, name, clientId, scopes, accessTtl, sessionId
    )
    
    // Extract access token ID for refresh token reference
    const accessTokenDecoded = jwt.decode(accessToken) as any
    const accessTokenId = accessTokenDecoded.jti
    
    const refreshToken = this.generateRefreshToken(
      userId, clientId, accessTokenId, refreshTtl, sessionId
    )

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTtl
    }
  }

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken(
    refreshToken: string,
    email: string,
    name: string,
    scopes: string[],
    accessTtl: number = 3600
  ): { accessToken: string; expiresIn: number } | null {
    const refreshPayload = this.verifyRefreshToken(refreshToken)
    if (!refreshPayload) {
      return null
    }

    const newAccessToken = this.generateAccessToken(
      refreshPayload.sub,
      email,
      name,
      refreshPayload.aud,
      scopes,
      accessTtl,
      refreshPayload.sessionId
    )

    return {
      accessToken: newAccessToken,
      expiresIn: accessTtl
    }
  }

  /**
   * Validate token scope against required scope
   */
  hasRequiredScope(token: TokenPayload, requiredScope: string): boolean {
    return token.scopes.includes(requiredScope) || token.role === 'admin'
  }

  /**
   * Extract user info from token
   */
  getUserInfo(token: TokenPayload): {
    userId: string
    email: string
    name: string
    role: 'admin' | 'user'
    scopes: string[]
  } {
    return {
      userId: token.sub,
      email: token.email,
      name: token.name,
      role: token.role,
      scopes: token.scopes
    }
  }
}

// Singleton instance
export const jwtManager = new JWTManager()

// Helper functions for backward compatibility
export async function generateAppToken(
  userId: string,
  email: string,
  name: string,
  clientId: string,
  scopes: string[] = ['read', 'profile']
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  return jwtManager.generateTokenPair(userId, email, name, clientId, scopes)
}

export async function verifyAppToken(
  token: string,
  tokenType: 'access' | 'refresh' = 'access'
): Promise<TokenPayload | RefreshTokenPayload | null> {
  if (tokenType === 'access') {
    return jwtManager.verifyAccessToken(token)
  } else {
    return jwtManager.verifyRefreshToken(token)
  }
}

export async function refreshAppToken(
  refreshToken: string,
  email: string,
  name: string,
  scopes: string[]
): Promise<{ accessToken: string; expiresIn: number } | null> {
  return jwtManager.refreshAccessToken(refreshToken, email, name, scopes)
}
