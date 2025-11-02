import { NextApiRequest, NextApiResponse } from 'next'
import RegisteredApp from '@/lib/auth/registered-app-model'
import UnifiedUser from '@/lib/auth/unified-user-model'
import { jwtManager } from '@/lib/auth/jwt-manager'
import connectDB from '@/modules/database/connection'
import crypto from 'crypto'

interface TokenRequest {
  grant_type: 'authorization_code' | 'refresh_token'
  code?: string
  redirect_uri?: string
  client_id: string
  client_secret?: string
  code_verifier?: string
  refresh_token?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectDB()

    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'method_not_allowed',
        error_description: 'Only POST method is allowed'
      })
    }

    const {
      grant_type,
      code,
      redirect_uri,
      client_id,
      client_secret,
      code_verifier,
      refresh_token
    }: TokenRequest = req.body

    // Validate required parameters
    if (!grant_type || !client_id) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing required parameters'
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

    // Validate client secret for confidential clients
    if (app.confidential && client_secret !== app.clientSecret) {
      return res.status(400).json({
        error: 'invalid_client',
        error_description: 'Invalid client secret'
      })
    }

    if (grant_type === 'authorization_code') {
      return await handleAuthorizationCodeGrant(
        req, res, app, code!, redirect_uri!, code_verifier
      )
    } else if (grant_type === 'refresh_token') {
      return await handleRefreshTokenGrant(
        req, res, app, refresh_token!
      )
    } else {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Unsupported grant type'
      })
    }

  } catch (error) {
    console.error('Token endpoint error:', error)
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error'
    })
  }
}

async function handleAuthorizationCodeGrant(
  req: NextApiRequest,
  res: NextApiResponse,
  app: any,
  code: string,
  redirectUri: string,
  codeVerifier?: string
) {
  // Retrieve authorization code data
  const authCodes = (globalThis as any).authCodes || new Map()
  const codeData = authCodes.get(code)

  if (!codeData) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Invalid or expired authorization code'
    })
  }

  // Validate code data
  if (codeData.clientId !== app.clientId ||
      codeData.redirectUri !== redirectUri ||
      new Date() > codeData.expiresAt) {
    authCodes.delete(code)
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Invalid authorization code'
    })
  }

  // Validate PKCE if required
  if (app.pkceRequired) {
    if (!codeVerifier || !codeData.codeChallenge) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'PKCE code verifier required'
      })
    }

    const challenge = codeData.codeChallengeMethod === 'S256' 
      ? crypto.createHash('sha256').update(codeVerifier).digest('base64url')
      : codeVerifier

    if (challenge !== codeData.codeChallenge) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Invalid PKCE code verifier'
      })
    }
  }

  // Get user data
  const user = await UnifiedUser.findById(codeData.userId)
  if (!user) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'User not found'
    })
  }

  // Generate token pair
  const tokens = jwtManager.generateTokenPair(
    codeData.userId,
    codeData.userEmail,
    codeData.userName,
    app.clientId,
    codeData.scopes,
    app.accessTokenTtl,
    app.refreshTokenTtl
  )

  // Update app stats
  app.updateStats('token_issued')
  await app.save()

  // Update user session
  user.sessions = user.sessions || []
  user.sessions.push({
    sessionToken: tokens.accessToken.substring(0, 20) + '...',
    deviceInfo: {
      browser: req.headers['user-agent']?.split(' ')[0] || 'Unknown',
      os: 'Unknown',
      device: 'API Client'
    },
    createdAt: new Date(),
    lastActiveAt: new Date(),
    isActive: true
  })

  // Keep only last 10 sessions
  if (user.sessions.length > 10) {
    user.sessions = user.sessions.slice(-10)
  }

  await user.save()

  // Clean up authorization code
  authCodes.delete(code)

  return res.status(200).json({
    access_token: tokens.accessToken,
    token_type: 'Bearer',
    expires_in: tokens.expiresIn,
    refresh_token: tokens.refreshToken,
    scope: codeData.scopes.join(' ')
  })
}

async function handleRefreshTokenGrant(
  req: NextApiRequest,
  res: NextApiResponse,
  app: any,
  refreshToken: string
) {
  // Verify refresh token
  const refreshPayload = jwtManager.verifyRefreshToken(refreshToken)
  if (!refreshPayload || refreshPayload.aud !== app.clientId) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Invalid refresh token'
    })
  }

  // Get user data
  const user = await UnifiedUser.findById(refreshPayload.sub)
  if (!user) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'User not found'
    })
  }

  // Generate new access token
  const newTokens = jwtManager.refreshAccessToken(
    refreshToken,
    user.email,
    user.name,
    app.scopes,
    app.accessTokenTtl
  )

  if (!newTokens) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Failed to refresh token'
    })
  }

  // Update app stats
  app.updateStats('token_issued')
  await app.save()

  return res.status(200).json({
    access_token: newTokens.accessToken,
    token_type: 'Bearer',
    expires_in: newTokens.expiresIn,
    scope: app.scopes.join(' ')
  })
}
