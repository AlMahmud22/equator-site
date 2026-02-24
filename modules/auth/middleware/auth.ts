import { NextApiRequest, NextApiResponse } from 'next'
import { getTokenPayload } from '@/modules/auth/services/auth'

interface AuthenticatedRequest extends NextApiRequest {
  userId: string
  userEmail: string
  userAuthType: string
}

type AuthenticatedHandler = (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const tokenPayload = getTokenPayload(req)
      
      if (!tokenPayload) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      // Add user info to request object
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.userId = tokenPayload.userId
      authenticatedReq.userEmail = tokenPayload.email
      authenticatedReq.userAuthType = tokenPayload.authType

      return handler(authenticatedReq, res)
    } catch (error) {
      console.error('Authentication middleware error:', error)
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      })
    }
  }
}

// Optional auth middleware - doesn't fail if no token is provided
export function withOptionalAuth(handler: AuthenticatedHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const tokenPayload = getTokenPayload(req)
      
      if (tokenPayload) {
        const authenticatedReq = req as AuthenticatedRequest
        authenticatedReq.userId = tokenPayload.userId
        authenticatedReq.userEmail = tokenPayload.email
        authenticatedReq.userAuthType = tokenPayload.authType
      }

      return handler(req as AuthenticatedRequest, res)
    } catch {
      // For optional auth, we continue even if token is invalid
      return handler(req as AuthenticatedRequest, res)
    }
  }
}

// CORS middleware for API routes
export function withCors(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || (
      process.env.NODE_ENV === 'production' 
      ? 'https://equator.tech'
      : process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    ))
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }

    return handler(req, res)
  }
}
