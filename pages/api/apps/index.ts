import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectToDatabase from '../../../modules/database/mongodb';
import { SecurityMonitor } from '../../../lib/security/SecurityMonitor';
import { 
  getClientIP 
} from '../../../lib/auth/app-tokens';

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
  // Rate limiting
  const clientIP = getClientIP(req);
  const rateLimitKey = `app_api_${clientIP}`;
  
  if (!checkRateLimit(rateLimitKey, 20, 60)) { // 20 requests per minute
    return res.status(429).json({ 
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }

  try {
    await connectToDatabase;
    
    const session = await getSession({ req }) as ExtendedSession | null;
    if (!session?.user?.id) {
      await securityMonitor.logSecurityEvent(
        'unknown',
        'unauthorized_app_access',
        'api',
        clientIP,
        req.headers['user-agent'] || 'unknown',
        false,
        {
          endpoint: '/api/apps',
          method: req.method
        }
      );
      
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    switch (req.method) {
      case 'GET':
        return await handleGetApps(req, res, session.user.id);
      case 'POST':
        return await handleCreateApp(req, res, session.user.id);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ 
          error: 'Method not allowed',
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Apps API error:', error);
    
    const session = await getSession({ req }) as ExtendedSession | null;
    await securityMonitor.logSecurityEvent(
      session?.user?.id || 'unknown',
      'api_error',
      'api',
      clientIP,
      req.headers['user-agent'] || 'unknown',
      false,
      {
        endpoint: '/api/apps',
        method: req.method,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

async function handleGetApps(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { default: App } = await import('../../../modules/database/models/App');
    
    const apps = await App.find({ ownerId: userId })
      .select('-clientSecret') // Don't expose secrets
      .sort({ createdAt: -1 });

    const formattedApps = apps.map(app => ({
      _id: app._id,
      name: app.name,
      description: app.description,
      clientId: app.clientId,
      redirectUri: app.redirectUri,
      website: app.website,
      iconUrl: app.iconUrl,
      scopes: app.scopes,
      status: app.status,
      isVerified: app.isVerified,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      stats: app.stats,
      security: {
        requirePKCE: app.security.requirePKCE,
        trustedApp: app.security.trustedApp,
        autoApprove: app.security.autoApprove
      }
    }));

    return res.status(200).json({ 
      success: true,
      apps: formattedApps,
      total: formattedApps.length
    });
  } catch (error) {
    console.error('Get apps error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch apps',
      message: 'Could not retrieve applications'
    });
  }
}

async function handleCreateApp(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { 
      name, 
      description, 
      redirectUri, 
      website, 
      iconUrl, 
      scopes = [],
      requirePKCE = true,
      autoApprove = false
    } = req.body;

    // Validation
    if (!name || !redirectUri) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Name and redirect URI are required'
      });
    }

    if (name.length > 100) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Name must be 100 characters or less'
      });
    }

    if (description && description.length > 500) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Description must be 500 characters or less'
      });
    }

    // Validate redirect URI format
    const redirectUriRegex = /^(https?:\/\/|[a-z][a-z0-9+.-]*:\/\/)/;
    if (!redirectUriRegex.test(redirectUri)) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Invalid redirect URI format'
      });
    }

    // Validate website URL if provided
    if (website && !/^https?:\/\//.test(website)) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Website must be a valid URL'
      });
    }

    // Validate icon URL if provided
    if (iconUrl && !/^https?:\/\//.test(iconUrl)) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Icon URL must be a valid URL'
      });
    }

    // Validate scopes
    const validScopes = [
      'profile:read', 'profile:write', 'email:read', 
      'models:read', 'models:write', 'analytics:read', 'admin:read'
    ];
    
    const invalidScopes = scopes.filter((scope: string) => !validScopes.includes(scope));
    if (invalidScopes.length > 0) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: `Invalid scopes: ${invalidScopes.join(', ')}`
      });
    }

    const { default: App } = await import('../../../modules/database/models/App');

    // Check app limit per user (prevent abuse)
    const existingAppsCount = await App.countDocuments({ ownerId: userId });
    if (existingAppsCount >= 10) { // Limit to 10 apps per user
      return res.status(429).json({ 
        error: 'Limit exceeded',
        message: 'Maximum number of applications reached (10)'
      });
    }

    // Create new app
    const app = new App({
      name,
      description,
      redirectUri,
      website,
      iconUrl,
      scopes,
      ownerId: userId,
      status: 'pending', // Apps start as pending approval
      security: {
        requirePKCE,
        allowedOrigins: [],
        trustedApp: false,
        autoApprove
      }
    });

    await app.save();

    // Log app creation
    await securityMonitor.logSecurityEvent(
      userId,
      'app_created',
      'api',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      true,
      {
        appId: app._id,
        appName: app.name,
        scopes: app.scopes
      }
    );

    // Return app data without secrets
    const responseData = {
      _id: app._id,
      name: app.name,
      description: app.description,
      clientId: app.clientId,
      redirectUri: app.redirectUri,
      website: app.website,
      iconUrl: app.iconUrl,
      scopes: app.scopes,
      status: app.status,
      isVerified: app.isVerified,
      createdAt: app.createdAt,
      security: {
        requirePKCE: app.security.requirePKCE,
        trustedApp: app.security.trustedApp,
        autoApprove: app.security.autoApprove
      }
    };

    return res.status(201).json({ 
      success: true,
      app: responseData,
      message: 'Application created successfully'
    });
  } catch (error) {
    console.error('Create app error:', error);
    return res.status(500).json({ 
      error: 'Failed to create app',
      message: 'Could not create application'
    });
  }
}

// Simple in-memory rate limiting (production should use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit: number, windowSeconds: number): boolean {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count += 1;
  return true;
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitMap.forEach((data, key) => {
    if (now > data.resetTime) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => rateLimitMap.delete(key));
}, 60000); // Clean up every minute
