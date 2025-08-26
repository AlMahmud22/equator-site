import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { isAdmin } from '@/lib/auth/admin-utils'
import connectToDatabase from '../../../modules/database/mongodb';
import { SecurityMonitor } from '../../../lib/security/SecurityMonitor';
import { verifyAppToken, getClientIP } from '../../../lib/auth/app-tokens';
import { AVAILABLE_SCOPES } from '../../../modules/database/models/AppPermission';

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
    
    // Check for session-based authentication first (for web app)
    const session = await getServerSession(req, res, authOptions)
    if (session?.user?.email) {
      const userIsAdmin = isAdmin(session.user.email, session.user.name || undefined)
      return res.status(200).json({
        success: true,
        isAdmin: userIsAdmin,
        role: userIsAdmin ? 'admin' : 'user',
        permissions: userIsAdmin ? ['read', 'write', 'admin', 'api-keys', 'privacy'] : ['read', 'write']
      })
    }
    
    // Fall back to token-based authentication (for apps)
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
          endpoint: '/api/user/permissions'
        }
      );

      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired access token'
      });
    }

    const { default: AppPermission } = await import('../../../modules/database/models/AppPermission');
    const { default: App } = await import('../../../modules/database/models/App');

    // Get app information
    const app = await App.findById(tokenData.app);
    if (!app) {
      return res.status(404).json({ 
        error: 'App not found',
        message: 'Application not found'
      });
    }

    // Get user permissions for this app
    const permission = await AppPermission.findOne({
      userId: tokenData.sub,
      appId: tokenData.app,
      approvalStatus: 'approved'
    });

    if (!permission) {
      return res.status(404).json({ 
        error: 'Permissions not found',
        message: 'No permissions found for this application'
      });
    }

    // Build permissions response
    const permissionsData = {
      appId: tokenData.app,
      appName: app.name,
      userId: tokenData.sub,
      approvalStatus: permission.approvalStatus,
      approvedAt: permission.approvedAt,
      lastReviewedAt: permission.lastReviewedAt,
      
      // Current token scopes
      currentScopes: tokenData.scopes,
      
      // All granted permissions
      grantedPermissions: {},
      
      // Available scopes with descriptions
      availableScopes: AVAILABLE_SCOPES,
      
      // Usage statistics
      usage: permission.usage,
      
      // Recent audit events (last 10)
      recentActivity: permission.auditLog.slice(-10).reverse()
    };

    // Build detailed permissions info
    const grantedPermissions: any = {};
    for (const scope of permission.scopes) {
      const permissionDetail = permission.permissions.get(scope);
      const scopeInfo = AVAILABLE_SCOPES[scope as keyof typeof AVAILABLE_SCOPES];
      
      grantedPermissions[scope] = {
        granted: permissionDetail?.granted || false,
        grantedAt: permissionDetail?.grantedAt,
        expiresAt: permissionDetail?.expiresAt,
        conditions: permissionDetail?.conditions,
        description: scopeInfo?.description || 'Unknown scope',
        category: scopeInfo?.category || 'Other',
        sensitive: scopeInfo?.sensitive || false,
        
        // Usage for this specific scope
        usage: permission.usage.requestsByScope.get(scope) || { count: 0 }
      };
    }

    permissionsData.grantedPermissions = grantedPermissions;

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

    // Record usage in permissions
    await permission.recordUsage('permissions:read');

    // Log successful permissions access
    await securityMonitor.logSecurityEvent(
      tokenData.sub,
      'permissions_access',
      'api',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      true,
      {
        appId: tokenData.app,
        scopes: tokenData.scopes,
        endpoint: '/api/user/permissions'
      }
    );

    return res.status(200).json({
      success: true,
      data: permissionsData
    });

  } catch (error) {
    console.error('Permissions API error:', error);
    
    await securityMonitor.logSecurityEvent(
      'unknown',
      'permissions_api_error',
      'api',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      false,
      {
        endpoint: '/api/user/permissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}
