import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../../modules/database/mongodb';
import { SecurityMonitor } from '../../../../lib/security/SecurityMonitor';
import { 
  validateAppCredentials,
  generateTokenPair,
  refreshAccessToken,
  getClientIP,
  validatePKCE
} from '../../../../lib/auth/app-tokens';

const securityMonitor = SecurityMonitor.getInstance();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      error: 'invalid_request',
      error_description: `Method ${req.method} not allowed`
    });
  }

  try {
    await connectToDatabase;
    
    const {
      grant_type,
      client_id,
      client_secret,
      code,
      redirect_uri,
      code_verifier,
      refresh_token
    } = req.body;

    // Validate grant type
    if (!grant_type || (grant_type !== 'authorization_code' && grant_type !== 'refresh_token')) {
      return res.status(400).json({ 
        error: 'unsupported_grant_type',
        error_description: 'Only authorization_code and refresh_token grant types are supported'
      });
    }

    // Validate client
    if (!client_id) {
      return res.status(400).json({ 
        error: 'invalid_request',
        error_description: 'Missing client_id'
      });
    }

    const app = await validateAppCredentials(client_id, client_secret);
    if (!app) {
      await securityMonitor.logSecurityEvent(
        'unknown',
        'invalid_client_token_request',
        'oauth',
        getClientIP(req),
        req.headers['user-agent'] || 'unknown',
        false,
        {
          clientId: client_id,
          grantType: grant_type
        }
      );

      return res.status(401).json({ 
        error: 'invalid_client',
        error_description: 'Invalid client credentials'
      });
    }

    if (grant_type === 'authorization_code') {
      return await handleAuthorizationCodeGrant(req, res, app, code, redirect_uri, code_verifier);
    } else if (grant_type === 'refresh_token') {
      return await handleRefreshTokenGrant(req, res, app, refresh_token);
    }

  } catch (error) {
    console.error('Token exchange error:', error);
    
    await securityMonitor.logSecurityEvent(
      'unknown',
      'token_exchange_error',
      'oauth',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      false,
      {
        clientId: req.body.client_id,
        grantType: req.body.grant_type,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );
    
    return res.status(500).json({ 
      error: 'server_error',
      error_description: 'An unexpected error occurred'
    });
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
  try {
    if (!code) {
      return res.status(400).json({ 
        error: 'invalid_request',
        error_description: 'Missing authorization code'
      });
    }

    if (!redirectUri) {
      return res.status(400).json({ 
        error: 'invalid_request',
        error_description: 'Missing redirect_uri'
      });
    }

    // Validate redirect URI
    if (app.redirectUri !== redirectUri) {
      return res.status(400).json({ 
        error: 'invalid_grant',
        error_description: 'Invalid redirect_uri'
      });
    }

    const { default: AppToken } = await import('../../../../modules/database/models/AppToken');

    // Find authorization code
    const authToken = await AppToken.findOne({
      authorizationCode: code,
      appId: app._id,
      status: 'active',
      tokenType: 'authorization_code'
    });

    if (!authToken || authToken.isExpired()) {
      await securityMonitor.logSecurityEvent(
        'unknown',
        'invalid_authorization_code',
        'oauth',
        getClientIP(req),
        req.headers['user-agent'] || 'unknown',
        false,
        {
          appId: app._id,
          codeProvided: !!code
        }
      );

      return res.status(400).json({ 
        error: 'invalid_grant',
        error_description: 'Invalid or expired authorization code'
      });
    }

    // Validate PKCE if required
    if (app.security.requirePKCE || authToken.codeChallenge) {
      if (!codeVerifier) {
        return res.status(400).json({ 
          error: 'invalid_request',
          error_description: 'PKCE code_verifier is required'
        });
      }

      if (!authToken.codeChallenge) {
        return res.status(400).json({ 
          error: 'invalid_grant',
          error_description: 'PKCE challenge not found'
        });
      }

      const isValidPKCE = validatePKCE(
        codeVerifier,
        authToken.codeChallenge,
        authToken.codeChallengeMethod || 'S256'
      );

      if (!isValidPKCE) {
        await securityMonitor.logSecurityEvent(
          authToken.userId,
          'invalid_pkce_verification',
          'oauth',
          getClientIP(req),
          req.headers['user-agent'] || 'unknown',
          false,
          {
            appId: app._id
          }
        );

        return res.status(400).json({ 
          error: 'invalid_grant',
          error_description: 'Invalid PKCE code_verifier'
        });
      }
    }

    // Generate access and refresh tokens
    const tokens = await generateTokenPair(
      authToken.userId,
      app._id,
      authToken.scopes,
      getClientIP(req),
      req.headers['user-agent']
    );

    // Mark authorization code as used
    await authToken.revoke('Used for token exchange');

    // Log successful token exchange
    await securityMonitor.logSecurityEvent(
      authToken.userId,
      'token_exchange_success',
      'oauth',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      true,
      {
        appId: app._id,
        scopes: authToken.scopes,
        tokenType: 'bearer'
      }
    );

    return res.status(200).json({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: 'Bearer',
      expires_in: tokens.expiresIn,
      scope: authToken.scopes.join(' ')
    });

  } catch (error) {
    console.error('Authorization code grant error:', error);
    return res.status(500).json({ 
      error: 'server_error',
      error_description: 'Failed to process authorization code'
    });
  }
}

async function handleRefreshTokenGrant(
  req: NextApiRequest,
  res: NextApiResponse,
  app: any,
  refreshTokenValue: string
) {
  try {
    if (!refreshTokenValue) {
      return res.status(400).json({ 
        error: 'invalid_request',
        error_description: 'Missing refresh_token'
      });
    }

    // Refresh the access token
    const result = await refreshAccessToken(
      refreshTokenValue,
      getClientIP(req),
      req.headers['user-agent']
    );

    if (!result) {
      await securityMonitor.logSecurityEvent(
        'unknown',
        'invalid_refresh_token',
        'oauth',
        getClientIP(req),
        req.headers['user-agent'] || 'unknown',
        false,
        {
          appId: app._id
        }
      );

      return res.status(400).json({ 
        error: 'invalid_grant',
        error_description: 'Invalid or expired refresh token'
      });
    }

    // Log successful token refresh
    await securityMonitor.logSecurityEvent(
      'unknown', // We don't have userId in refresh token flow
      'token_refresh_success',
      'oauth',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      true,
      {
        appId: app._id
      }
    );

    return res.status(200).json({
      access_token: result.accessToken,
      token_type: 'Bearer',
      expires_in: result.expiresIn
    });

  } catch (error) {
    console.error('Refresh token grant error:', error);
    return res.status(500).json({ 
      error: 'server_error',
      error_description: 'Failed to refresh access token'
    });
  }
}
