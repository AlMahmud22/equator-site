import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import connectDB from '@/modules/database/connection';
import RegisteredApp from '@/modules/database/models/RegisteredApp';
import AuthorizationCode from '@/modules/database/models/AuthCode';

// Request validation function
function validateAuthRequest(req: NextApiRequest): { valid: boolean; error?: string } {
  const { response_type, client_id, redirect_uri, scope, state } = req.query;

  // Validate response_type
  if (!response_type || response_type !== 'code') {
    return { valid: false, error: 'response_type must be "code"' };
  }

  // Validate client_id
  if (!client_id) {
    return { valid: false, error: 'client_id is required' };
  }

  // Validate redirect_uri
  if (!redirect_uri) {
    return { valid: false, error: 'redirect_uri is required' };
  }

  // State is recommended for security but not strictly required
  if (!state) {
    console.warn('OAuth authorization request without state parameter');
  }

  return { valid: true };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint only processes GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Validate the authorization request
    const validation = validateAuthRequest(req);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: validation.error
      });
    }

    const { 
      client_id, 
      redirect_uri, 
      scope, 
      state, 
      code_challenge, 
      code_challenge_method 
    } = req.query;
    
    // Check if user is authenticated
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      // User not authenticated, redirect to login with return URL
      const returnUrl = encodeURIComponent(req.url || '');
      return res.redirect(`/auth/login?returnUrl=${returnUrl}`);
    }

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

    // Validate redirect URI against allowed URIs for the app
    if (!app.redirectUris.includes(redirect_uri as string)) {
      return res.status(400).json({
        error: 'invalid_redirect_uri',
        error_description: 'Redirect URI not allowed for this client'
      });
    }

    // Validate and process scopes
    let requestedScopes: string[] = [];
    if (scope) {
      requestedScopes = (scope as string).split(' ');
      
      // Filter out invalid or unauthorized scopes
      requestedScopes = requestedScopes.filter(s => app.scopes.includes(s));
      
      // If no valid scopes left, use default scope
      if (requestedScopes.length === 0) {
        requestedScopes = ['profile:read'];
      }
    } else {
      // Default scope if none provided
      requestedScopes = ['profile:read'];
    }

    // Check if auto-approval is enabled for this app
    if (!app.security.autoApprove) {
      // If not auto-approved, redirect to consent screen
      const params = new URLSearchParams({
        client_id: client_id as string,
        redirect_uri: redirect_uri as string,
        scope: requestedScopes.join(' '),
        state: state as string || '',
      });
      
      if (code_challenge) {
        params.append('code_challenge', code_challenge as string);
        params.append('code_challenge_method', code_challenge_method as string || 'S256');
      }
      
      return res.redirect(`/oauth/consent?${params.toString()}`);
    }
    
    // Auto-approved application, create authorization code directly
    const userId = (session.user as any).id;
    
    const authCode = await AuthorizationCode.createCode(
      client_id as string,
      userId,
      requestedScopes,
      redirect_uri as string,
      code_challenge as string,
      code_challenge_method as string
    );
    
    // Build the redirect URL
    const redirectUrl = new URL(redirect_uri as string);
    redirectUrl.searchParams.append('code', authCode.code);
    
    if (state) {
      redirectUrl.searchParams.append('state', state as string);
    }
    
    // Redirect to client's redirect URI with auth code
    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('OAuth authorization error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error'
    });
  }
}
