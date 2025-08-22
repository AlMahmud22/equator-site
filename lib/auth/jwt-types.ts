import jwt from 'jsonwebtoken';

/**
 * Helper function to sign JWT with consistent options
 */
export function signJwt(payload: any, secret: string, options: any = {}): string {
  if (!secret) {
    throw new Error('JWT Secret is required');
  }
  
  return jwt.sign(payload, secret, options);
}
