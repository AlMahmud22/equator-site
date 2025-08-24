import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectToDatabase from '../../../modules/database/mongodb';
import { SecurityMonitor } from '../../../lib/security/SecurityMonitor';
import { getClientIP } from '../../../lib/auth/app-tokens';

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
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
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

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'App ID is required'
      });
    }

    const { default: App } = await import('../../../modules/database/models/App');
    const { default: AppToken } = await import('../../../modules/database/models/AppToken');
    const { default: AppPermission } = await import('../../../modules/database/models/AppPermission');

    // Find the app and verify ownership
    const app = await App.findById(id);
    if (!app) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Application not found'
      });
    }

    if (app.ownerId !== session.user.id) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You can only delete your own applications'
      });
    }

    // Revoke all tokens for this app
    const tokens = await AppToken.find({ appId: id, status: 'active' });
    await AppToken.updateMany(
      { appId: id, status: 'active' },
      { 
        status: 'revoked',
        revokedAt: new Date(),
        revokedReason: 'Application deleted'
      }
    );

    // Delete all permissions for this app
    await AppPermission.deleteMany({ appId: id });

    // Delete the app
    await App.findByIdAndDelete(id);

    // Log app deletion
    await securityMonitor.logSecurityEvent(
      session.user.id,
      'app_deleted',
      'api',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      true,
      {
        appId: id,
        appName: app.name,
        revokedTokens: tokens.length
      }
    );

    return res.status(200).json({ 
      success: true,
      message: 'Application deleted successfully',
      revokedTokens: tokens.length
    });

  } catch (error) {
    console.error('Delete app error:', error);
    
    const session = await getSession({ req }) as ExtendedSession | null;
    await securityMonitor.logSecurityEvent(
      session?.user?.id || 'unknown',
      'app_delete_error',
      'api',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      false,
      {
        appId: req.query.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete application'
    });
  }
}
