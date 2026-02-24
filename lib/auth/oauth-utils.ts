import { createHash, randomBytes } from 'crypto';

/**
 * Generate a random code verifier string for PKCE
 * @param length Length of the code verifier (default: 64)
 * @returns A random code verifier string
 */
export function generateCodeVerifier(length = 64): string {
  return randomBytes(length)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .slice(0, length);
}

/**
 * Generate a code challenge from a code verifier
 * @param codeVerifier The code verifier to generate the challenge from
 * @param method The method to use for generating the challenge (default: S256)
 * @returns The code challenge
 */
export function generateCodeChallenge(codeVerifier: string, method = 'S256'): string {
  if (method === 'plain') {
    return codeVerifier;
  }
  
  if (method === 'S256') {
    return createHash('sha256')
      .update(codeVerifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  throw new Error(`Unsupported code challenge method: ${method}`);
}

/**
 * Build an authorization URL with the necessary parameters
 * @param clientId The client ID
 * @param redirectUri The redirect URI
 * @param scope The requested scopes
 * @param state A state parameter for CSRF protection
 * @param codeChallenge The code challenge for PKCE
 * @param codeChallengeMethod The code challenge method (default: S256)
 * @returns The authorization URL
 */
export function buildAuthorizationUrl(
  clientId: string,
  redirectUri: string,
  scope: string | string[],
  state: string,
  codeChallenge?: string,
  codeChallengeMethod = 'S256'
): string {
  // Convert scope array to space-separated string
  const scopeString = Array.isArray(scope) ? scope.join(' ') : scope;
  
  // Build URL
  const url = new URL('/api/oauth/authorize', process.env.NEXT_PUBLIC_SITE_URL);
  
  // Add required parameters
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('scope', scopeString);
  url.searchParams.append('state', state);
  
  // Add PKCE parameters if provided
  if (codeChallenge) {
    url.searchParams.append('code_challenge', codeChallenge);
    url.searchParams.append('code_challenge_method', codeChallengeMethod);
  }
  
  return url.toString();
}

/**
 * Exchange an authorization code for tokens
 * @param code The authorization code
 * @param clientId The client ID
 * @param clientSecret The client secret (optional if using PKCE)
 * @param redirectUri The redirect URI
 * @param codeVerifier The code verifier for PKCE (optional)
 * @returns The token response
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string | null,
  redirectUri: string,
  codeVerifier?: string
): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}> {
  // Build request body
  const body: any = {
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    redirect_uri: redirectUri
  };
  
  // Add client secret or code verifier
  if (clientSecret) {
    body.client_secret = clientSecret;
  } else if (codeVerifier) {
    body.code_verifier = codeVerifier;
  }
  
  // Make request
  const tokenEndpoint = `${process.env.NEXT_PUBLIC_SITE_URL}/api/oauth/token`;
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  // Check response
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to exchange code for token');
  }
  
  return await response.json();
}

/**
 * Refresh an access token
 * @param refreshToken The refresh token
 * @param clientId The client ID
 * @param clientSecret The client secret
 * @returns The token response
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}> {
  // Build request body
  const body = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret
  };
  
  // Make request
  const tokenEndpoint = `${process.env.NEXT_PUBLIC_SITE_URL}/api/oauth/token`;
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  // Check response
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to refresh access token');
  }
  
  return await response.json();
}
