import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectToDatabase from '../../../../modules/database/mongodb';
import { SecurityMonitor } from '../../../../lib/security/SecurityMonitor';
import { 
  validateAppCredentials,
  generateAuthorizationCode,
  getClientIP
} from '../../../../lib/auth/app-tokens';

// Define extended session type
interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ExtendedSession {
  user?: ExtendedUser;
  expires: string;
}

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
    
    const session = await getSession({ req }) as ExtendedSession | null;
    if (!session?.user?.id) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const {
      client_id,
      redirect_uri,
      state,
      approved_scopes = []
    } = req.body;

    // Validate required parameters
    if (!client_id || !redirect_uri || !Array.isArray(approved_scopes)) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Missing required parameters'
      });
    }

    if (approved_scopes.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'At least one scope must be approved'
      });
    }

    // Validate app credentials
    const app = await validateAppCredentials(client_id);
    if (!app) {
      return res.status(400).json({ 
        error: 'Invalid client',
        message: 'Invalid client_id or client is not active'
      });
    }

    // Validate redirect URI
    if (app.redirectUri !== redirect_uri) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Invalid redirect_uri'
      });
    }

    // Validate scopes
    const validScopes = [
      'profile:read', 'profile:write', 'email:read', 
      'models:read', 'models:write', 'analytics:read', 'admin:read'
    ];
    
    const invalidScopes = approved_scopes.filter((scope: string) => !validScopes.includes(scope));
    if (invalidScopes.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid scope',
        message: `Invalid scopes: ${invalidScopes.join(', ')}`
      });
    }

    const { default: AppPermission } = await import('../../../../modules/database/models/AppPermission');

    // Update or create user permissions
    let permission = await AppPermission.findOne({
      userId: session.user.id,
      appId: app._id
    });

    if (!permission) {
      // Create new permission
      permission = new AppPermission({
        userId: session.user.id,
        appId: app._id,
        scopes: approved_scopes,
        permissions: new Map(),
        approvalStatus: 'approved',
        approvedAt: new Date(),
        autoApprove: false,
        usage: {
          totalRequests: 0,
          requestsByScope: new Map()
        },
        auditLog: []
      });
    } else {
      // Update existing permission
      permission.scopes = approved_scopes;
      permission.approvalStatus = 'approved';
      permission.approvedAt = new Date();
      permission.lastReviewedAt = new Date();
    }

    // Set individual scope permissions
    for (const scope of approved_scopes) {
      permission.permissions.set(scope, {
        granted: true,
        grantedAt: new Date()
      });
    }

    // Add audit log entry
    permission.auditLog.push({
      action: 'granted',
      timestamp: new Date(),
      details: {
        approvedScopes: approved_scopes,
        method: 'consent_screen'
      }
    });

    await permission.save();

    // Generate authorization code
    const authCode = await generateAuthorizationCode({
      userId: session.user.id,
      appId: app._id,
      scopes: approved_scopes,
      redirectUri: redirect_uri
    });

    // Log consent approval
    await securityMonitor.logSecurityEvent(
      session.user.id,
      'consent_approved',
      'oauth',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      true,
      {
        appId: app._id,
        appName: app.name,
        approvedScopes: approved_scopes
      }
    );

    // Build redirect URL with authorization code
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('code', authCode);
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }

    return res.status(200).json({
      success: true,
      redirectUrl: redirectUrl.toString(),
      message: 'Consent approved successfully'
    });

  } catch (error) {
    console.error('Consent approval error:', error);
    
    const session = await getSession({ req }) as ExtendedSession | null;
    await securityMonitor.logSecurityEvent(
      session?.user?.id || 'unknown',
      'consent_approval_error',
      'oauth',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      false,
      {
        clientId: req.body.client_id,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}
