import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/modules/database/connection';
import Token from '@/modules/database/models/Token';

/**
 * Middleware to verify access token and attach user and scopes to request
 */
async function verifyToken(req: NextApiRequest): Promise<{
  valid: boolean;
  userId?: string;
  scopes?: string[];
  error?: string;
}> {
  // Get authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      valid: false,
      error: 'Missing or invalid Authorization header'
    };
  }

  // Extract token
  const accessToken = authHeader.substring(7);
  
  // Find token in database
  await connectDB();
  const token = await Token.findOne({ accessToken });
  
  if (!token) {
    return {
      valid: false,
      error: 'Invalid access token'
    };
  }
  
  // Check if token is revoked
  if (token.isRevoked) {
    return {
      valid: false,
      error: 'Access token has been revoked'
    };
  }
  
  // Check if token is expired
  if (new Date() > token.expiresAt) {
    // Automatically revoke expired token
    token.isRevoked = true;
    token.revokedAt = new Date();
    await token.save();
    
    return {
      valid: false,
      error: 'Access token has expired'
    };
  }
  
  // Token is valid
  return {
    valid: true,
    userId: token.userId.toString(),
    scopes: token.scopes
  };
}

/**
 * Check if token has required scope
 */
function hasScope(scopes: string[], requiredScope: string): boolean {
  return scopes.includes(requiredScope);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify token
    const tokenVerification = await verifyToken(req);
    if (!tokenVerification.valid) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: tokenVerification.error
      });
    }

    // Get user data based on scopes
    const { userId, scopes = [] } = tokenVerification;
    const { default: User } = await import('@/modules/database/models/User');
    const user = await User.findById(userId).select('-password -apiKeys -security');
    
    if (!user) {
      return res.status(404).json({
        error: 'not_found',
        error_description: 'User not found'
      });
    }
    
    // Build response based on scopes
    const response: any = {
      sub: userId, // OpenID Connect subject identifier
      id: userId
    };
    
    // Include basic profile data if profile:read scope is granted
    if (hasScope(scopes, 'profile:read')) {
      response.name = user.name;
      response.username = user.username;
      response.avatar = user.avatar;
    }
    
    // Include email if email:read scope is granted
    if (hasScope(scopes, 'email:read')) {
      response.email = user.email;
      response.email_verified = user.emailVerified || false;
    }
    
    // Include full profile data if extended profile scope is granted
    if (hasScope(scopes, 'profile:extended')) {
      response.bio = user.bio;
      response.location = user.location;
      response.website = user.website;
      response.social = user.social;
    }
    
    // Include role information for admin applications
    if (hasScope(scopes, 'admin:read')) {
      response.role = user.role;
      response.isAdmin = user.role === 'admin';
      response.createdAt = user.createdAt;
    }
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('User info API error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error'
    });
  }
}
