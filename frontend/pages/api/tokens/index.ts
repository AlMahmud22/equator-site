import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import connectDB from '@/modules/database/connection';
import RegisteredApp from '@/modules/database/models/RegisteredApp';
import Token from '@/modules/database/models/Token';
import { PERMISSIONS } from '@/modules/database/models/Role';
import { checkUserPermission } from '@/lib/auth/permissions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    await connectDB();
    
    // Get user ID from session
    const userId = (session.user as any).id;

    // Handle GET request for listing active tokens
    if (req.method === 'GET') {
      // Check if user has permission to view tokens
      const hasAdminAccess = await checkUserPermission(session, PERMISSIONS.ADMIN_ACCESS);
      const hasTokenReadPermission = await checkUserPermission(session, PERMISSIONS.TOKEN_READ);
      
      if (!hasAdminAccess && !hasTokenReadPermission) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view tokens'
        });
      }
      
      // Get token ID if provided
      const { id, appId } = req.query;
      
      // Get a single token
      if (id) {
        const token = await Token.findById(id)
          .populate('appId', 'name description')
          .select('-accessToken -refreshToken'); // Don't expose actual tokens
        
        if (!token) {
          return res.status(404).json({
            success: false,
            message: 'Token not found'
          });
        }
        
        // Check if user has permission to view this token
        if (!hasAdminAccess && token.userId.toString() !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to view this token'
          });
        }
        
        return res.status(200).json({
          success: true,
          data: token
        });
      }
      
      // Build query
      const query: any = {};
      
      // Non-admins can only see their own tokens
      if (!hasAdminAccess) {
        query.userId = userId;
      }
      
      // Filter by app ID if provided
      if (appId) {
        query.appId = appId;
      }
      
      // Filter by isRevoked status (default to active tokens)
      const isRevoked = req.query.isRevoked === 'true';
      query.isRevoked = isRevoked;
      
      // Get paginated tokens
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      
      const total = await Token.countDocuments(query);
      
      const tokens = await Token.find(query)
        .populate('appId', 'name description')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-accessToken -refreshToken'); // Don't expose actual tokens
      
      return res.status(200).json({
        success: true,
        data: tokens,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

    // Handle POST request for token operations
    if (req.method === 'POST') {
      const { action, id } = req.body;
      
      if (!action || !['revoke', 'revoke-all'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Valid action is required (revoke, revoke-all)'
        });
      }
      
      // Check permissions
      const hasAdminAccess = await checkUserPermission(session, PERMISSIONS.ADMIN_ACCESS);
      const hasRevokePermission = await checkUserPermission(session, PERMISSIONS.TOKEN_REVOKE);
      
      if (!hasAdminAccess && !hasRevokePermission) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to revoke tokens'
        });
      }
      
      // Revoke a single token
      if (action === 'revoke' && id) {
        const token = await Token.findById(id);
        
        if (!token) {
          return res.status(404).json({
            success: false,
            message: 'Token not found'
          });
        }
        
        // Non-admins can only revoke their own tokens
        if (!hasAdminAccess && token.userId.toString() !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to revoke this token'
          });
        }
        
        token.isRevoked = true;
        token.revokedAt = new Date();
        await token.save();
        
        return res.status(200).json({
          success: true,
          message: 'Token revoked successfully'
        });
      }
      
      // Revoke all tokens for a user or an app
      if (action === 'revoke-all') {
        const query: any = {};
        
        // Non-admins can only revoke their own tokens
        if (!hasAdminAccess) {
          query.userId = userId;
        } else if (req.body.userId) {
          // Admins can revoke tokens for specific users
          query.userId = req.body.userId;
        }
        
        // Filter by app ID if provided
        if (req.body.appId) {
          query.appId = req.body.appId;
        }
        
        // Only revoke active tokens
        query.isRevoked = false;
        
        const result = await Token.updateMany(
          query,
          { 
            isRevoked: true,
            revokedAt: new Date()
          }
        );
        
        return res.status(200).json({
          success: true,
          message: `${result.modifiedCount} token(s) revoked successfully`
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Invalid action or missing required parameters'
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
