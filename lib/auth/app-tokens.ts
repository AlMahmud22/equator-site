import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { NextApiRequest } from 'next';

// Environment variables validation
const JWT_SECRET = process.env.NEXTAUTH_SECRET;
const APP_JWT_SECRET = process.env.APP_JWT_SECRET || process.env.NEXTAUTH_SECRET;

if (!JWT_SECRET || !APP_JWT_SECRET) {
  throw new Error('Missing JWT secrets in environment variables');
}

// Ensure APP_JWT_SECRET is not undefined
const VERIFIED_APP_JWT_SECRET = APP_JWT_SECRET as string;

// Dynamic model imports to avoid circular dependencies
async function getAppModel() {
  const { default: App } = await import('../../modules/database/models/App');
  return App;
}

async function getAppTokenModel() {
  const { default: AppToken } = await import('../../modules/database/models/AppToken');
  return AppToken;
}

async function getAppPermissionModel() {
  const { default: AppPermission } = await import('../../modules/database/models/AppPermission');
  return AppPermission;
}

// Token expiration times
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 60 * 60, // 1 hour
  REFRESH_TOKEN: 30 * 24 * 60 * 60, // 30 days
  AUTHORIZATION_CODE: 10 * 60, // 10 minutes
} as const;

export interface AppTokenPayload {
  sub: string; // User ID
  app: string; // App ID
  scopes: string[];
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
  jti: string; // Token ID
}

export interface AuthorizationData {
  userId: string;
  appId: string;
  scopes: string[];
  codeChallenge?: string;
  codeChallengeMethod?: 'S256' | 'plain';
  redirectUri: string;
}

/**
 * Generate a secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate authorization code
 */
export async function generateAuthorizationCode(data: AuthorizationData): Promise<string> {
  const AppToken = await getAppTokenModel();
  const code = generateSecureToken(32);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.AUTHORIZATION_CODE * 1000);
  
  await AppToken.create({
    appId: data.appId,
    userId: data.userId,
    tokenType: 'authorization_code',
    authorizationCode: code,
    scopes: data.scopes,
    authorizationCodeExpiresAt: expiresAt,
    codeChallenge: data.codeChallenge,
    codeChallengeMethod: data.codeChallengeMethod,
    status: 'active'
  });
  
  return code;
}

/**
 * Generate access and refresh tokens
 */
export async function generateTokenPair(
  userId: string,
  appId: string,
  scopes: string[],
  ipAddress?: string,
  userAgent?: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const AppToken = await getAppTokenModel();
  const App = await getAppModel();
  
  const tokenId = generateSecureToken(16);
  const now = Math.floor(Date.now() / 1000);
  
  // Create access token
  const accessTokenPayload: AppTokenPayload = {
    sub: userId,
    app: appId,
    scopes,
    type: 'access',
    iat: now,
    exp: now + TOKEN_EXPIRY.ACCESS_TOKEN,
    jti: `${tokenId}_access`
  };
  
  const accessToken = jwt.sign(accessTokenPayload, VERIFIED_APP_JWT_SECRET);
  
  // Create refresh token
  const refreshTokenPayload: AppTokenPayload = {
    sub: userId,
    app: appId,
    scopes,
    type: 'refresh',
    iat: now,
    exp: now + TOKEN_EXPIRY.REFRESH_TOKEN,
    jti: `${tokenId}_refresh`
  };
  
  const refreshToken = jwt.sign(refreshTokenPayload, VERIFIED_APP_JWT_SECRET);
  
  // Store tokens in database
  const accessTokenDoc = await AppToken.create({
    appId,
    userId,
    tokenType: 'access',
    accessToken,
    scopes,
    grantedPermissions: scopes,
    accessTokenExpiresAt: new Date(accessTokenPayload.exp * 1000),
    issuedAt: new Date(),
    ipAddress,
    userAgent,
    status: 'active'
  });
  
  const refreshTokenDoc = await AppToken.create({
    appId,
    userId,
    tokenType: 'refresh',
    refreshToken,
    scopes,
    grantedPermissions: scopes,
    refreshTokenExpiresAt: new Date(refreshTokenPayload.exp * 1000),
    issuedAt: new Date(),
    ipAddress,
    userAgent,
    status: 'active'
  });
  
  // Update app statistics
  await App.findByIdAndUpdate(appId, {
    $inc: {
      'stats.totalTokensIssued': 2,
      'stats.activeTokens': 2
    },
    $set: {
      'stats.lastUsed': new Date()
    }
  });
  
  return {
    accessToken,
    refreshToken,
    expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN
  };
}

/**
 * Verify and decode app token
 */
export async function verifyAppToken(token: string, expectedType?: 'access' | 'refresh'): Promise<AppTokenPayload | null> {
  try {
    const AppToken = await getAppTokenModel();
    const decoded = jwt.verify(token, VERIFIED_APP_JWT_SECRET) as unknown as AppTokenPayload;
    
    if (expectedType && decoded.type !== expectedType) {
      return null;
    }
    
    // Check if token exists in database and is active
    const tokenDoc = await AppToken.findOne({
      $or: [
        { accessToken: token },
        { refreshToken: token }
      ],
      status: 'active'
    });
    
    if (!tokenDoc || tokenDoc.isExpired()) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ accessToken: string; expiresIn: number } | null> {
  const AppToken = await getAppTokenModel();
  const App = await getAppModel();
  
  const decoded = await verifyAppToken(refreshToken, 'refresh');
  if (!decoded) {
    return null;
  }
  
  // Generate new access token
  const tokenId = generateSecureToken(16);
  const now = Math.floor(Date.now() / 1000);
  
  const accessTokenPayload: AppTokenPayload = {
    sub: decoded.sub,
    app: decoded.app,
    scopes: decoded.scopes,
    type: 'access',
    iat: now,
    exp: now + TOKEN_EXPIRY.ACCESS_TOKEN,
    jti: `${tokenId}_access`
  };
  
  const accessToken = jwt.sign(accessTokenPayload, VERIFIED_APP_JWT_SECRET);
  
  // Store new access token
  await AppToken.create({
    appId: decoded.app,
    userId: decoded.sub,
    tokenType: 'access',
    accessToken,
    scopes: decoded.scopes,
    grantedPermissions: decoded.scopes,
    accessTokenExpiresAt: new Date(accessTokenPayload.exp * 1000),
    issuedAt: new Date(),
    ipAddress,
    userAgent,
    status: 'active'
  });
  
  // Update app statistics
  await App.findByIdAndUpdate(decoded.app, {
    $inc: {
      'stats.totalTokensIssued': 1,
      'stats.activeTokens': 1
    },
    $set: {
      'stats.lastUsed': new Date()
    }
  });
  
  return {
    accessToken,
    expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN
  };
}

/**
 * Revoke token(s)
 */
export async function revokeToken(token: string, reason?: string): Promise<boolean> {
  try {
    const AppToken = await getAppTokenModel();
    const App = await getAppModel();
    
    const tokenDoc = await AppToken.findOne({
      $or: [
        { accessToken: token },
        { refreshToken: token }
      ]
    });
    
    if (!tokenDoc) {
      return false;
    }
    
    await tokenDoc.revoke(reason);
    
    // Update app statistics
    await App.findByIdAndUpdate(tokenDoc.appId, {
      $inc: {
        'stats.activeTokens': -1
      }
    });
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Revoke all tokens for a user/app combination
 */
export async function revokeAllTokens(userId: string, appId: string, reason?: string): Promise<number> {
  const AppToken = await getAppTokenModel();
  const App = await getAppModel();
  
  const tokens = await AppToken.find({
    userId,
    appId,
    status: 'active'
  });
  
  let revokedCount = 0;
  for (const token of tokens) {
    await token.revoke(reason);
    revokedCount++;
  }
  
  // Update app statistics
  await App.findByIdAndUpdate(appId, {
    $inc: {
      'stats.activeTokens': -revokedCount
    }
  });
  
  return revokedCount;
}

/**
 * Extract client IP from request
 */
export function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  if (typeof realIP === 'string') {
    return realIP;
  }
  
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Validate PKCE challenge
 */
export function validatePKCE(
  codeVerifier: string,
  codeChallenge: string,
  method: 'S256' | 'plain' = 'S256'
): boolean {
  if (method === 'plain') {
    return codeVerifier === codeChallenge;
  }
  
  if (method === 'S256') {
    const hash = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    return hash === codeChallenge;
  }
  
  return false;
}

/**
 * Generate PKCE challenge
 */
export function generatePKCEChallenge(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return { codeVerifier, codeChallenge };
}

/**
 * Validate app credentials
 */
export async function validateAppCredentials(clientId: string, clientSecret?: string): Promise<any | null> {
  const App = await getAppModel();
  const app = await App.findOne({ clientId }).select('+clientSecret');
  
  if (!app || app.status !== 'active') {
    return null;
  }
  
  // For public clients (like desktop apps), client secret might not be required
  if (clientSecret && app.clientSecret !== clientSecret) {
    return null;
  }
  
  return app;
}

/**
 * Check if user has granted permissions for app
 */
export async function checkUserPermissions(userId: string, appId: string, requestedScopes: string[]): Promise<{
  granted: boolean;
  grantedScopes: string[];
  missingScopes: string[];
  permission?: any;
}> {
  const AppPermission = await getAppPermissionModel();
  const permission = await AppPermission.findOne({
    userId,
    appId,
    approvalStatus: 'approved'
  });
  
  if (!permission) {
    return {
      granted: false,
      grantedScopes: [],
      missingScopes: requestedScopes,
    };
  }
  
  const grantedScopes = requestedScopes.filter(scope => permission.hasScope(scope));
  const missingScopes = requestedScopes.filter(scope => !permission.hasScope(scope));
  
  return {
    granted: missingScopes.length === 0,
    grantedScopes,
    missingScopes,
    permission
  };
}
