import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import connectDB from '@/modules/database/connection';
import RegisteredApp from '@/modules/database/models/RegisteredApp';
import Token from '@/modules/database/models/Token';
import { createHash, randomBytes } from 'crypto';
import { ExtendedUser } from '@/lib/auth/permissions';

// Request validation function
function validateTokenRequest(req: NextApiRequest): { valid: boolean; error?: string } {
  const { grant_type, client_id, client_secret, code, refresh_token, redirect_uri, code_verifier } = req.body;

  // Validate grant_type
  if (!grant_type) {
    return { valid: false, error: 'grant_type is required' };
  }

  // Validate authorization_code flow
  if (grant_type === 'authorization_code') {
    if (!client_id) return { valid: false, error: 'client_id is required' };
    if (!code) return { valid: false, error: 'code is required' };
    if (!redirect_uri) return { valid: false, error: 'redirect_uri is required' };
    
    // Client secret or code verifier is required
    if (!client_secret && !code_verifier) {
      return { valid: false, error: 'Either client_secret or code_verifier is required' };
    }
  }
  
  // Validate refresh_token flow
  if (grant_type === 'refresh_token') {
    if (!client_id) return { valid: false, error: 'client_id is required' };
    if (!refresh_token) return { valid: false, error: 'refresh_token is required' };
    if (!client_secret) return { valid: false, error: 'client_secret is required' };
  }

  return { valid: true };
}

// PKCE code challenge verifier
function verifyCodeChallenge(codeVerifier: string, codeChallenge: string, method = 'S256'): boolean {
  if (method === 'S256') {
    const hash = createHash('sha256')
      .update(codeVerifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return hash === codeChallenge;
  }
  
  // Plain method
  return codeVerifier === codeChallenge;
}

// Generate tokens for a user
async function generateTokens(
  userId: string, 
  appId: string, 
  scopes: string[]
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  // Generate tokens
  const accessToken = randomBytes(32).toString('hex');
  const refreshToken = randomBytes(32).toString('hex');
  
  // Create token record
  const token = new Token({
    userId,
    appId,
    accessToken,
    refreshToken,
    scopes,
    expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour
  });
  
  await token.save();
  
  // Update app statistics
  await RegisteredApp.findByIdAndUpdate(
    appId,
    { 
      $inc: {
        'stats.totalTokensIssued': 1,
        'stats.activeTokens': 1
      }
    }
  );
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 3600 // 1 hour in seconds
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'method_not_allowed',
      error_description: 'Only POST method is allowed'
    });
  }

  try {
    await connectDB();
    
    // Validate request
    const validation = validateTokenRequest(req);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: validation.error
      });
    }

    const { grant_type, client_id, client_secret, code, refresh_token, redirect_uri, code_verifier } = req.body;

    // Find the app by client ID
    const app = await RegisteredApp.findOne({ clientId: client_id });
    if (!app) {
      return res.status(400).json({
        error: 'invalid_client',
        error_description: 'Invalid client ID'
      });
    }

    // Check if app is active
    if (app.status !== 'active') {
      return res.status(400).json({
        error: 'unauthorized_client',
        error_description: 'Application is not active'
      });
    }

    // Handle authorization_code grant
    if (grant_type === 'authorization_code') {
      // If PKCE is required but no code_verifier is provided, client_secret must match
      if (app.security.requirePKCE && !code_verifier) {
        if (!client_secret || client_secret !== app.clientSecret) {
          return res.status(401).json({
            error: 'invalid_client',
            error_description: 'Invalid client credentials'
          });
        }
      }
      
      // Verify the authorization code
      const { default: AuthorizationCode } = await import('@/modules/database/models/AuthCode');
      const authCode = await AuthorizationCode.findOne({ code, clientId: client_id });
      
      if (!authCode) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Invalid authorization code'
        });
      }
      
      // Check if code is expired
      if (new Date() > authCode.expiresAt) {
        // Delete expired code
        await AuthorizationCode.deleteOne({ _id: authCode._id });
        
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Authorization code has expired'
        });
      }
      
      // Verify redirect URI
      if (authCode.redirectUri !== redirect_uri) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Redirect URI does not match'
        });
      }
      
      // Verify code challenge if PKCE is enabled
      if (authCode.codeChallenge && code_verifier) {
        const isValid = verifyCodeChallenge(
          code_verifier, 
          authCode.codeChallenge,
          authCode.codeChallengeMethod
        );
        
        if (!isValid) {
          return res.status(400).json({
            error: 'invalid_grant',
            error_description: 'Code verifier does not match code challenge'
          });
        }
      }
      
      // Generate tokens
      const tokens = await generateTokens(
        authCode.userId.toString(), // Convert ObjectId to string
        app._id.toString(),
        authCode.scopes
      );
      
      // Delete the used code
      await AuthorizationCode.deleteOne({ _id: authCode._id });
      
      return res.status(200).json({
        access_token: tokens.accessToken,
        token_type: 'Bearer',
        expires_in: tokens.expiresIn,
        refresh_token: tokens.refreshToken,
        scope: authCode.scopes.join(' ')
      });
    }
    
    // Handle refresh_token grant
    if (grant_type === 'refresh_token') {
      // Verify client credentials
      if (!client_secret || client_secret !== app.clientSecret) {
        return res.status(401).json({
          error: 'invalid_client',
          error_description: 'Invalid client credentials'
        });
      }
      
      // Find the refresh token
      const token = await Token.findOne({ 
        refreshToken: refresh_token, 
        appId: app._id 
      });
      
      if (!token) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Invalid refresh token'
        });
      }
      
      // Check if token is revoked
      if (token.isRevoked) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Refresh token has been revoked'
        });
      }
      
      // Revoke the old token
      token.isRevoked = true;
      token.revokedAt = new Date();
      await token.save();
      
      // Generate new tokens
      const tokens = await generateTokens(
        token.userId.toString(),
        app._id.toString(),
        token.scopes
      );
      
      return res.status(200).json({
        access_token: tokens.accessToken,
        token_type: 'Bearer',
        expires_in: tokens.expiresIn,
        refresh_token: tokens.refreshToken,
        scope: token.scopes.join(' ')
      });
    }
    
    // Unsupported grant type
    return res.status(400).json({
      error: 'unsupported_grant_type',
      error_description: 'Unsupported grant type'
    });
  } catch (error) {
    console.error('OAuth token error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error'
    });
  }
}
