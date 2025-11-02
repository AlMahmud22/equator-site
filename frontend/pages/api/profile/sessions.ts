import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import connectDB from '@/modules/database/connection'
import UnifiedUser from '@/lib/auth/unified-user-model'
import { isAdmin } from '@/lib/auth/admin'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Array<{ field: string; message: string }>
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // Get session
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    // Check admin permissions
    if (!isAdmin(session.user.email, (session.user as any).id)) {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required for session management'
      })
    }

    await connectDB()

    const user = await UnifiedUser.findOne({ email: session.user.email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (req.method === 'GET') {
      // Get all active sessions
      try {
        if (!user.sessions) user.sessions = []
        const sessions = user.sessions
          .filter((s: any) => s.isActive)
          .map((session: any) => ({
            sessionToken: session.sessionToken.substring(0, 8) + '...', // Only show partial token
            deviceInfo: session.deviceInfo,
            createdAt: session.createdAt,
            lastActiveAt: session.lastActiveAt,
            isActive: session.isActive
          }))

        return res.status(200).json({
          success: true,
          message: 'Sessions retrieved successfully',
          data: { sessions }
        })
      } catch (error) {
        console.error('Sessions fetch error:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch sessions'
        })
      }
    }

    if (req.method === 'DELETE') {
      // Terminate session(s)
      try {
        const { sessionToken, terminateAll } = req.body

        if (terminateAll) {
          // Terminate all sessions except current one
          const currentSessionToken = (session as any).sessionToken
          user.sessions.forEach((s: any) => {
            if (s.sessionToken !== currentSessionToken) {
              s.isActive = false
            }
          })
          
          await user.save()

          return res.status(200).json({
            success: true,
            message: 'All other sessions terminated successfully'
          })
        } else if (sessionToken) {
          // Terminate specific session
          const sessionIndex = user.sessions.findIndex((s: any) => 
            s.sessionToken.startsWith(sessionToken.replace('...', ''))
          )
          
          if (sessionIndex === -1) {
            return res.status(404).json({
              success: false,
              message: 'Session not found'
            })
          }

          user.sessions[sessionIndex].isActive = false
          await user.save()

          return res.status(200).json({
            success: true,
            message: 'Session terminated successfully'
          })
        } else {
          return res.status(400).json({
            success: false,
            message: 'Session token or terminateAll flag required'
          })
        }
      } catch (error) {
        console.error('Session termination error:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to terminate session'
        })
      }
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  } catch (error) {
    console.error('Sessions API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
