import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../modules/database/mongodb';
import { SecurityMonitor } from '../../../lib/security/SecurityMonitor';
import { verifyAppToken, revokeToken, getClientIP } from '../../../lib/auth/app-tokens';

const securityMonitor = SecurityMonitor.getInstance();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: `Method ${req.method} not allowed`
    });
  }

  try {
    await connectToDatabase;
    
    // Extract access token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const accessToken = authHeader.substring(7); // Remove "Bearer " prefix
    
    // Verify the access token (but allow even expired tokens for logout)
    const tokenData = await verifyAppToken(accessToken, 'access');
    
    const { revoke_all = false } = req.body;

    if (tokenData) {
      // Log logout attempt
      await securityMonitor.logSecurityEvent(
        tokenData.sub,
        'remote_logout',
        'api',
        getClientIP(req),
        req.headers['user-agent'] || 'unknown',
        true,
        {
          appId: tokenData.app,
          revokeAll: revoke_all,
          endpoint: '/api/user/logout'
        }
      );

      if (revoke_all) {
        // Revoke all tokens for this user/app combination
        const { revokeAllTokens } = await import('../../../lib/auth/app-tokens');
        const revokedCount = await revokeAllTokens(
          tokenData.sub, 
          tokenData.app, 
          'Remote logout - revoke all'
        );

        return res.status(200).json({
          success: true,
          message: 'All tokens revoked successfully',
          revokedTokens: revokedCount
        });
      } else {
        // Revoke just this token
        const success = await revokeToken(accessToken, 'Remote logout');
        
        if (success) {
          return res.status(200).json({
            success: true,
            message: 'Token revoked successfully'
          });
        } else {
          return res.status(400).json({
            error: 'Token revocation failed',
            message: 'Could not revoke the token'
          });
        }
      }
    } else {
      // Token is invalid or expired, but we still try to revoke it
      const success = await revokeToken(accessToken, 'Remote logout (invalid token)');
      
      await securityMonitor.logSecurityEvent(
        'unknown',
        'remote_logout_invalid_token',
        'api',
        getClientIP(req),
        req.headers['user-agent'] || 'unknown',
        success,
        {
          endpoint: '/api/user/logout',
          tokenWasValid: false
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Logout completed (token was invalid or expired)'
      });
    }

  } catch (error) {
    console.error('Logout API error:', error);
    
    await securityMonitor.logSecurityEvent(
      'unknown',
      'logout_api_error',
      'api',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      false,
      {
        endpoint: '/api/user/logout',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}
