import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import SecurityMonitor from '@/lib/security/SecurityMonitor'
import AccessLog from '@/modules/database/models/AccessLog'
import connectDB from '@/modules/database/connection'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      })
    }

    if (req.method === 'GET') {
      const { 
        action, 
        days = 30, 
        userId,
        page = 1,
        limit = 50
      } = req.query

      await connectDB()

      if (action === 'analytics') {
        // Get security analytics
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(days as string))

        const analytics = await SecurityMonitor.getSecurityAnalytics(
          startDate,
          endDate,
          userId as string
        )

        return res.status(200).json({
          success: true,
          data: {
            analytics,
            period: {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              days: parseInt(days as string)
            }
          }
        })
      }

      if (action === 'alerts') {
        // Get recent alerts
        const alerts = SecurityMonitor.getRecentAlerts(parseInt(limit as string))
        
        return res.status(200).json({
          success: true,
          data: { alerts }
        })
      }

      if (action === 'logs') {
        // Get activity logs with pagination
        const pageNum = parseInt(page as string)
        const limitNum = parseInt(limit as string)
        const skip = (pageNum - 1) * limitNum

        const query: any = {}
        if (userId) {
          query.userId = userId
        }

        const [logs, totalCount] = await Promise.all([
          AccessLog.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limitNum)
            .select('-__v'),
          AccessLog.countDocuments(query)
        ])

        return res.status(200).json({
          success: true,
          data: {
            logs,
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: totalCount,
              pages: Math.ceil(totalCount / limitNum)
            }
          }
        })
      }

      if (action === 'user-activity') {
        // Get specific user's security activity
        const targetUserId = userId || (session.user as any).id
        
        if (!targetUserId) {
          return res.status(400).json({
            success: false,
            error: 'User ID required'
          })
        }

        const [recentLogs, analytics] = await Promise.all([
          AccessLog.find({ userId: targetUserId })
            .sort({ timestamp: -1 })
            .limit(20)
            .select('-__v'),
          SecurityMonitor.getSecurityAnalytics(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            new Date(),
            targetUserId
          )
        ])

        return res.status(200).json({
          success: true,
          data: {
            recentActivity: recentLogs,
            analytics
          }
        })
      }

      // Default: return user's own security summary
      const userLogs = await AccessLog.find({ 
        userId: (session.user as any).id 
      })
        .sort({ timestamp: -1 })
        .limit(10)
        .select('-__v')

      return res.status(200).json({
        success: true,
        data: {
          recentActivity: userLogs,
          summary: {
            totalActivities: userLogs.length,
            lastActivity: userLogs[0]?.timestamp || null
          }
        }
      })
    }

    if (req.method === 'POST') {
      const { action, alertId } = req.body

      if (action === 'resolve-alert') {
        if (!alertId) {
          return res.status(400).json({
            success: false,
            error: 'Alert ID required'
          })
        }

        const resolved = SecurityMonitor.resolveAlert(alertId)
        
        return res.status(200).json({
          success: true,
          data: { resolved }
        })
      }

      if (action === 'cleanup-logs') {
        // Admin-only action to cleanup old logs
        const isAdmin = (session.user as any).email === process.env.ADMIN_EMAIL
        
        if (!isAdmin) {
          return res.status(403).json({
            success: false,
            error: 'Admin access required'
          })
        }

        const daysToKeep = req.body.daysToKeep || 365
        const deletedCount = await SecurityMonitor.cleanupOldLogs(daysToKeep)

        return res.status(200).json({
          success: true,
          data: { deletedCount }
        })
      }

      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      })
    }

    if (req.method === 'DELETE') {
      // Delete specific log entry (admin only)
      const isAdmin = (session.user as any).email === process.env.ADMIN_EMAIL
      
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        })
      }

      const { logId } = req.query
      if (!logId) {
        return res.status(400).json({
          success: false,
          error: 'Log ID required'
        })
      }

      await connectDB()
      const deleted = await AccessLog.findByIdAndDelete(logId)

      return res.status(200).json({
        success: true,
        data: { deleted: !!deleted }
      })
    }

    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })

  } catch (error) {
    console.error('Security API error:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' 
        ? error instanceof Error ? error.message : 'Unknown error'
        : undefined
    })
  }
}
