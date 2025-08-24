import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../modules/database/mongodb';
import { SecurityMonitor } from '../../../lib/security/SecurityMonitor';
import { verifyAppToken, getClientIP } from '../../../lib/auth/app-tokens';

const securityMonitor = SecurityMonitor.getInstance();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
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
    
    // Verify the access token
    const tokenData = await verifyAppToken(accessToken, 'access');
    if (!tokenData) {
      await securityMonitor.logSecurityEvent(
        'unknown',
        'invalid_access_token',
        'api',
        getClientIP(req),
        req.headers['user-agent'] || 'unknown',
        false,
        {
          endpoint: '/api/user/profile'
        }
      );

      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired access token'
      });
    }

    // Check if token has required scope
    if (!tokenData.scopes.includes('profile:read')) {
      await securityMonitor.logSecurityEvent(
        tokenData.sub,
        'insufficient_scope',
        'api',
        getClientIP(req),
        req.headers['user-agent'] || 'unknown',
        false,
        {
          endpoint: '/api/user/profile',
          requiredScope: 'profile:read',
          providedScopes: tokenData.scopes
        }
      );

      return res.status(403).json({ 
        error: 'Insufficient scope',
        message: 'Token does not have required scope: profile:read'
      });
    }

    const { default: EnhancedUser } = await import('../../../modules/database/models/EnhancedUser');

    // Get user profile
    const user = await EnhancedUser.findById(tokenData.sub);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Prepare profile data based on granted scopes
    const profileData: any = {
      id: user._id,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Add email if scope allows
    if (tokenData.scopes.includes('email:read')) {
      profileData.email = user.email;
      profileData.emailVerified = user.emailVerified;
    }

    // Add additional profile fields if available and scope allows
    if (user.profile) {
      profileData.profile = {
        bio: user.profile.bio,
        website: user.profile.website,
        location: user.profile.location,
        company: user.profile.company,
        jobTitle: user.profile.jobTitle
      };
    }

    // Add provider information if available
    if (user.accounts && user.accounts.length > 0) {
      profileData.connectedAccounts = user.accounts.map((account: any) => ({
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        type: account.type
      }));
    }

    // Add usage statistics if analytics scope is granted
    if (tokenData.scopes.includes('analytics:read') && user.analytics) {
      profileData.analytics = {
        totalSessions: user.analytics.totalSessions,
        lastActiveAt: user.analytics.lastActiveAt,
        totalApiCalls: user.analytics.totalApiCalls
      };
    }

    // Update token usage
    const { default: AppToken } = await import('../../../modules/database/models/AppToken');
    await AppToken.updateOne(
      { accessToken },
      { 
        $inc: { 'usage.requestCount': 1 },
        $set: { 
          'usage.lastRequest': new Date(),
          lastUsed: new Date()
        }
      }
    );

    // Log successful profile access
    await securityMonitor.logSecurityEvent(
      tokenData.sub,
      'profile_access',
      'api',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      true,
      {
        appId: tokenData.app,
        scopes: tokenData.scopes,
        endpoint: '/api/user/profile'
      }
    );

    return res.status(200).json({
      success: true,
      data: profileData,
      scopes: tokenData.scopes
    });

  } catch (error) {
    console.error('Profile API error:', error);
    
    await securityMonitor.logSecurityEvent(
      'unknown',
      'profile_api_error',
      'api',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      false,
      {
        endpoint: '/api/user/profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}
