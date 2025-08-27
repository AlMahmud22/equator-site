import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import connectDB from '@/modules/database/connection';
import RegisteredApp from '@/modules/database/models/RegisteredApp';
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

    // Check if user has admin access
    const hasAdminAccess = await checkUserPermission(session, PERMISSIONS.ADMIN_APPS);
    
    if (!hasAdminAccess) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    await connectDB();
    
    // Handle GET request for getting pending apps
    if (req.method === 'GET') {
      const { status = 'pending', page = 1, limit = 10 } = req.query;
      
      // Build query
      const query: any = {};
      
      // Apply status filter
      if (status && ['active', 'pending', 'revoked', 'suspended'].includes(status as string)) {
        query.status = status;
      }
      
      // Get total count for pagination
      const total = await RegisteredApp.countDocuments(query);
      
      // Get paginated apps
      const apps = await RegisteredApp.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .select('-clientSecret'); // Don't expose secrets
      
      return res.status(200).json({
        success: true,
        data: apps,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    }

    // Handle POST request to approve/reject applications
    if (req.method === 'POST') {
      const { id } = req.query;
      const { action, message } = req.body;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Application ID is required'
        });
      }
      
      if (!action || !['approve', 'reject', 'suspend', 'restore'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Valid action is required (approve, reject, suspend, restore)'
        });
      }
      
      // Find the application
      const app = await RegisteredApp.findById(id);
      if (!app) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }
      
      // Update app based on action
      switch (action) {
        case 'approve':
          app.status = 'active';
          app.isVerified = true;
          app.adminNotes = message || 'Approved by administrator';
          break;
        case 'reject':
          app.status = 'revoked';
          app.adminNotes = message || 'Rejected by administrator';
          break;
        case 'suspend':
          app.status = 'suspended';
          app.adminNotes = message || 'Suspended by administrator';
          break;
        case 'restore':
          app.status = 'active';
          app.adminNotes = message || 'Restored by administrator';
          break;
      }
      
      await app.save();
      
      // Send notification to app owner (in a production environment)
      // This would typically call a notification service
      
      return res.status(200).json({
        success: true,
        message: `Application ${action}ed successfully`,
        data: {
          id: app._id,
          name: app.name,
          status: app.status
        }
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
