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

    await connectDB();
    
    // Handle GET request for retrieving dashboard stats
    if (req.method === 'GET') {
      // Check if user has admin access
      const hasAdminAccess = await checkUserPermission(session, PERMISSIONS.ADMIN_ACCESS);
      
      if (!hasAdminAccess) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
      
      // Get statistics for registered applications
      const totalApps = await RegisteredApp.countDocuments();
      const activeApps = await RegisteredApp.countDocuments({ status: 'active' });
      const pendingApps = await RegisteredApp.countDocuments({ status: 'pending' });
      const revokedApps = await RegisteredApp.countDocuments({ status: 'revoked' });
      
      // Get recent applications
      const recentApps = await RegisteredApp.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name status createdAt ownerEmail');
      
      // Get top applications by usage
      const topApps = await RegisteredApp.find()
        .sort({ 'stats.totalRequests': -1 })
        .limit(5)
        .select('name status stats.totalRequests stats.activeTokens');
      
      return res.status(200).json({
        success: true,
        data: {
          totalApps,
          activeApps,
          pendingApps,
          revokedApps,
          recentApps,
          topApps
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
