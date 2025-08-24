import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectToDatabase from '../../../../modules/database/mongodb';
import { SecurityMonitor } from '../../../../lib/security/SecurityMonitor';
import { 
  validateAppCredentials, 
  generateAuthorizationCode,
  checkUserPermissions,
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
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: `Method ${req.method} not allowed`
    });
  }

  try {
    await connectToDatabase;
    
    const {
      client_id,
      redirect_uri,
      scope = '',
      state,
      response_type = 'code',
      code_challenge,
      code_challenge_method = 'S256'
    } = req.query;

    // Validate required parameters
    if (!client_id || typeof client_id !== 'string') {
      return res.status(400).json({ 
        error: 'invalid_request',
        error_description: 'Missing client_id parameter'
      });
    }

    if (!redirect_uri || typeof redirect_uri !== 'string') {
      return res.status(400).json({ 
        error: 'invalid_request',
        error_description: 'Missing redirect_uri parameter'
      });
    }

    if (response_type !== 'code') {
      return res.status(400).json({ 
        error: 'unsupported_response_type',
        error_description: 'Only authorization code flow is supported'
      });
    }

    // Validate app credentials
    const app = await validateAppCredentials(client_id);
    if (!app) {
      await securityMonitor.logSecurityEvent(
        'unknown',
        'invalid_app_authorization',
        'oauth',
        getClientIP(req),
        req.headers['user-agent'] || 'unknown',
        false,
        {
          clientId: client_id,
          redirectUri: redirect_uri
        }
      );

      return res.status(400).json({ 
        error: 'invalid_client',
        error_description: 'Invalid client_id or client is not active'
      });
    }

    // Validate redirect URI
    if (app.redirectUri !== redirect_uri) {
      return res.status(400).json({ 
        error: 'invalid_request',
        error_description: 'Invalid redirect_uri'
      });
    }

    // Check user authentication
    const session = await getSession({ req }) as ExtendedSession | null;
    if (!session?.user?.id) {
      // Redirect to login with return URL
      const loginUrl = `/auth/login?callbackUrl=${encodeURIComponent(req.url || '')}`;
      res.redirect(302, loginUrl);
      return;
    }

    // Parse requested scopes
    const requestedScopes = typeof scope === 'string' ? scope.split(' ').filter(Boolean) : [];
    
    if (requestedScopes.length === 0) {
      return res.status(400).json({ 
        error: 'invalid_scope',
        error_description: 'At least one scope is required'
      });
    }

    // Check if user has granted permissions
    const permissionCheck = await checkUserPermissions(session.user.id, app._id, requestedScopes);
    
    // If app is trusted and user has all permissions, auto-approve
    if (app.security.autoApprove && permissionCheck.granted) {
      return await generateAndRedirect(
        session.user.id,
        app._id,
        permissionCheck.grantedScopes,
        redirect_uri,
        state,
        code_challenge,
        code_challenge_method,
        req,
        res
      );
    }

    // If user hasn't granted permissions or needs additional permissions, show consent screen
    if (!permissionCheck.granted || permissionCheck.missingScopes.length > 0) {
      const consentParams = new URLSearchParams();
      consentParams.set('client_id', client_id);
      consentParams.set('redirect_uri', redirect_uri);
      consentParams.set('scope', requestedScopes.join(' '));
      consentParams.set('state', Array.isArray(state) ? state[0] || '' : state || '');
      consentParams.set('app_name', app.name);
      consentParams.set('app_description', app.description || '');
      consentParams.set('app_website', app.website || '');
      consentParams.set('app_icon', app.iconUrl || '');
      consentParams.set('missing_scopes', permissionCheck.missingScopes.join(' '));
      consentParams.set('granted_scopes', permissionCheck.grantedScopes.join(' '));
      
      const consentUrl = `/auth/consent?${consentParams.toString()}`;

      res.redirect(302, consentUrl);
      return;
    }

    // User has all permissions, generate authorization code
    return await generateAndRedirect(
      session.user.id,
      app._id,
      permissionCheck.grantedScopes,
      redirect_uri,
      state,
      code_challenge,
      code_challenge_method,
      req,
      res
    );

  } catch (error) {
    console.error('OAuth authorization error:', error);
    
    const session = await getSession({ req }) as ExtendedSession | null;
    await securityMonitor.logSecurityEvent(
      session?.user?.id || 'unknown',
      'oauth_authorization_error',
      'oauth',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      false,
      {
        clientId: req.query.client_id,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );
    
    return res.status(500).json({ 
      error: 'server_error',
      error_description: 'An unexpected error occurred'
    });
  }
}

async function generateAndRedirect(
  userId: string,
  appId: string,
  scopes: string[],
  redirectUri: string,
  state: string | string[] | undefined,
  codeChallenge: string | string[] | undefined,
  codeChallengeMethod: string | string[] | undefined,
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Generate authorization code
    const authCode = await generateAuthorizationCode({
      userId,
      appId,
      scopes,
      redirectUri,
      codeChallenge: typeof codeChallenge === 'string' ? codeChallenge : undefined,
      codeChallengeMethod: typeof codeChallengeMethod === 'string' && (codeChallengeMethod === 'S256' || codeChallengeMethod === 'plain') 
        ? codeChallengeMethod 
        : 'S256'
    });

    // Log successful authorization
    await securityMonitor.logSecurityEvent(
      userId,
      'oauth_authorization_success',
      'oauth',
      getClientIP(req),
      req.headers['user-agent'] || 'unknown',
      true,
      {
        appId,
        scopes,
        codeLength: authCode.length
      }
    );

    // Build redirect URL with authorization code
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('code', authCode);
    if (state && typeof state === 'string') {
      redirectUrl.searchParams.set('state', state);
    }

    res.redirect(302, redirectUrl.toString());
  } catch (error) {
    console.error('Code generation error:', error);
    
    // Redirect back with error
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('error', 'server_error');
    redirectUrl.searchParams.set('error_description', 'Failed to generate authorization code');
    if (state && typeof state === 'string') {
      redirectUrl.searchParams.set('state', state);
    }

    res.redirect(302, redirectUrl.toString());
  }
}
