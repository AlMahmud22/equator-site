import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import RegisteredApp from '@/lib/auth/registered-app-model'
import UnifiedUser from '@/lib/auth/unified-user-model'
import { jwtManager } from '@/lib/auth/jwt-manager'
import connectDB from '@/modules/database/connection'
import crypto from 'crypto'

interface AuthorizeRequest {
  response_type: 'code'
  client_id: string
  redirect_uri: string
  scope?: string
  state?: string
  code_challenge?: string
  code_challenge_method?: 'S256' | 'plain'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    await connectDB()

    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).json({
        error: 'method_not_allowed',
        error_description: 'Only GET and POST methods are allowed'
      })
    }

    const {
      response_type,
      client_id,
      redirect_uri,
      scope = 'read profile',
      state,
      code_challenge,
      code_challenge_method
    }: AuthorizeRequest = req.method === 'GET' ? req.query : req.body

    // Validate required parameters
    if (!response_type || !client_id || !redirect_uri) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing required parameters'
      })
    }

    if (response_type !== 'code') {
      return res.status(400).json({
        error: 'unsupported_response_type',
        error_description: 'Only authorization code flow is supported'
      })
    }

    // Find the registered app
    const app = await RegisteredApp.findOne({ clientId: client_id, isActive: true })
    if (!app) {
      return res.status(400).json({
        error: 'invalid_client',
        error_description: 'Invalid client ID'
      })
    }

    // Validate redirect URI
    if (!app.isValidRedirectUri(redirect_uri)) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Invalid redirect URI'
      })
    }

    // Check if app is approved
    if (!app.isApproved) {
      return res.status(400).json({
        error: 'unauthorized_client',
        error_description: 'App is not approved'
      })
    }

    // Validate PKCE if required
    if (app.pkceRequired && !code_challenge) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'PKCE is required for this app'
      })
    }

    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      // Redirect to login with callback
      const loginUrl = new URL('/auth/login', process.env.NEXTAUTH_URL || 'http://localhost:3000')
      loginUrl.searchParams.set('callbackUrl', req.url!)
      res.redirect(302, loginUrl.toString())
      return
    }

    // Get user from database
    const user = await UnifiedUser.findOne({ email: session.user.email })
    if (!user) {
      return res.status(400).json({
        error: 'invalid_user',
        error_description: 'User not found'
      })
    }

    // Validate requested scopes
    const requestedScopes = scope.split(' ')
    const invalidScopes = requestedScopes.filter(s => !app.hasScope(s))
    if (invalidScopes.length > 0) {
      return res.status(400).json({
        error: 'invalid_scope',
        error_description: `Invalid scopes: ${invalidScopes.join(', ')}`
      })
    }

    // Generate authorization code
    const authCode = crypto.randomBytes(32).toString('hex')
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store authorization code (in production, use Redis or database)
    const codeData = {
      code: authCode,
      clientId: client_id,
      userId: user._id.toString(),
      userEmail: user.email,
      userName: user.name,
      redirectUri: redirect_uri,
      scopes: requestedScopes,
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method,
      expiresAt: codeExpiresAt
    }

    // Store in session or temporary storage (for demo, using memory)
    // In production, use Redis with TTL
    ;(globalThis as any).authCodes = (globalThis as any).authCodes || new Map()
    ;(globalThis as any).authCodes.set(authCode, codeData)

    // Clean up expired codes
    setTimeout(() => {
      ;(globalThis as any).authCodes?.delete(authCode)
    }, 10 * 60 * 1000)

    // Update app stats
    app.updateStats('user_authorized')
    await app.save()

    // Record login history
    user.loginHistory.push({
      timestamp: new Date(),
      provider: 'oauth_app',
      ipAddress: req.socket.remoteAddress || 'unknown'
    })

    // Keep only last 50 entries
    if (user.loginHistory.length > 50) {
      user.loginHistory = user.loginHistory.slice(-50)
    }

    await user.save()

    // Redirect with authorization code
    const redirectUrl = new URL(redirect_uri)
    redirectUrl.searchParams.set('code', authCode)
    if (state) {
      redirectUrl.searchParams.set('state', state)
    }

    res.redirect(302, redirectUrl.toString())
    return

  } catch (error) {
    console.error('Authorization error:', error)
    res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error'
    })
    return
  }
}
