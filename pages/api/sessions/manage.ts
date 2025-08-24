import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import EnhancedUser from '@/modules/database/models/EnhancedUser'
import SecurityMonitor from '@/lib/security/SecurityMonitor'
import connectDB from '@/modules/database/connection'
import crypto from 'crypto'

// Helper function to get client info
function getClientInfo(req: NextApiRequest) {
  const userAgent = req.headers['user-agent'] || 'Unknown'
  const ipAddress = (
    req.headers['x-forwarded-for']?.toString().split(',')[0] ||
    req.headers['x-real-ip']?.toString() ||
    req.socket.remoteAddress ||
    'unknown'
  )
  
  // Parse device info from user agent
  let deviceInfo = 'Unknown Device'
  if (userAgent.includes('Mobile')) {
    deviceInfo = 'Mobile Device'
  } else if (userAgent.includes('Tablet')) {
    deviceInfo = 'Tablet'
  } else {
    deviceInfo = 'Desktop'
  }
  
  // Add browser info
  if (userAgent.includes('Chrome')) {
    deviceInfo += ' (Chrome)'
  } else if (userAgent.includes('Firefox')) {
    deviceInfo += ' (Firefox)'
  } else if (userAgent.includes('Safari')) {
    deviceInfo += ' (Safari)'
  } else if (userAgent.includes('Edge')) {
    deviceInfo += ' (Edge)'
  }
  
  return { userAgent, ipAddress, deviceInfo }
}

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

    const userId = (session.user as any).id
    await connectDB()

    if (req.method === 'GET') {
      // Get user's active sessions
      const user = await EnhancedUser.findById(userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        })
      }

      // Clean up expired sessions (older than 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      user.sessions = user.sessions.filter((session: any) => 
        session.lastActiveAt > thirtyDaysAgo
      )
      
      await user.save()

      // Return active sessions with security info
      const activeSessions = user.sessions
        .filter((session: any) => session.isActive)
        .map((session: any) => ({
          sessionToken: session.sessionToken,
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
          createdAt: session.createdAt,
          lastActiveAt: session.lastActiveAt,
          isActive: session.isActive,
          // Add security flags
          isCurrent: session.sessionToken === (session as any).sessionToken, // Current session
          riskLevel: calculateSessionRisk(session, user.loginHistory)
        }))
        .sort((a: any, b: any) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime())

      return res.status(200).json({
        success: true,
        data: {
          sessions: activeSessions,
          totalActiveSessions: activeSessions.length,
          lastCleanup: new Date()
        }
      })
    }

    if (req.method === 'POST') {
      const { action } = req.body
      const clientInfo = getClientInfo(req)

      if (action === 'create-session') {
        // Create a new session (called during login)
        const user = await EnhancedUser.findById(userId)
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          })
        }

        // Generate secure session token
        const sessionToken = crypto.randomBytes(32).toString('hex')
        
        // Add new session
        const newSession = {
          sessionToken,
          deviceInfo: clientInfo.deviceInfo,
          ipAddress: clientInfo.ipAddress,
          createdAt: new Date(),
          lastActiveAt: new Date(),
          isActive: true
        }

        user.sessions.push(newSession)

        // Limit to 10 active sessions per user
        if (user.sessions.length > 10) {
          // Remove oldest session
          user.sessions.sort((a: any, b: any) => a.lastActiveAt.getTime() - b.lastActiveAt.getTime())
          user.sessions = user.sessions.slice(-10)
        }

        await user.save()

        // Log session creation
        await SecurityMonitor.logSecurityEvent(
          userId,
          'session_created',
          user.provider,
          clientInfo.ipAddress,
          clientInfo.userAgent,
          true,
          { sessionToken, deviceInfo: clientInfo.deviceInfo }
        )

        return res.status(200).json({
          success: true,
          data: { sessionToken }
        })
      }

      if (action === 'refresh-session') {
        // Update session activity timestamp
        const { sessionToken } = req.body
        
        if (!sessionToken) {
          return res.status(400).json({
            success: false,
            error: 'Session token required'
          })
        }

        const user = await EnhancedUser.findById(userId)
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          })
        }

        // Find and update session
        const sessionIndex = user.sessions.findIndex((s: any) => s.sessionToken === sessionToken)
        if (sessionIndex === -1) {
          return res.status(404).json({
            success: false,
            error: 'Session not found'
          })
        }

        user.sessions[sessionIndex].lastActiveAt = new Date()
        await user.save()

        // Log session refresh
        await SecurityMonitor.logSecurityEvent(
          userId,
          'session_refresh',
          user.provider,
          clientInfo.ipAddress,
          clientInfo.userAgent,
          true,
          { sessionToken }
        )

        return res.status(200).json({
          success: true,
          data: { refreshed: true }
        })
      }

      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      })
    }

    if (req.method === 'DELETE') {
      const { sessionToken, terminateAll } = req.body
      const clientInfo = getClientInfo(req)

      const user = await EnhancedUser.findById(userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        })
      }

      if (terminateAll) {
        // Terminate all sessions except current one
        const currentSessionToken = (session as any).sessionToken
        
        user.sessions = user.sessions.map((session: any) => {
          if (session.sessionToken !== currentSessionToken) {
            session.isActive = false
          }
          return session
        })

        await user.save()

        // Log session termination
        await SecurityMonitor.logSecurityEvent(
          userId,
          'sessions_terminated_all',
          user.provider,
          clientInfo.ipAddress,
          clientInfo.userAgent,
          true,
          { terminatedCount: user.sessions.length - 1 }
        )

        return res.status(200).json({
          success: true,
          data: { 
            message: 'All other sessions terminated',
            remainingSessions: 1
          }
        })
      }

      if (sessionToken) {
        // Terminate specific session
        const sessionIndex = user.sessions.findIndex((s: any) => s.sessionToken === sessionToken)
        
        if (sessionIndex === -1) {
          return res.status(404).json({
            success: false,
            error: 'Session not found'
          })
        }

        user.sessions[sessionIndex].isActive = false
        await user.save()

        // Log session termination
        await SecurityMonitor.logSecurityEvent(
          userId,
          'session_terminated',
          user.provider,
          clientInfo.ipAddress,
          clientInfo.userAgent,
          true,
          { sessionToken }
        )

        return res.status(200).json({
          success: true,
          data: { 
            message: 'Session terminated',
            sessionToken
          }
        })
      }

      return res.status(400).json({
        success: false,
        error: 'Session token required or use terminateAll flag'
      })
    }

    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })

  } catch (error) {
    console.error('Session management error:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' 
        ? error instanceof Error ? error.message : 'Unknown error'
        : undefined
    })
  }
}

// Helper function to calculate session risk level
function calculateSessionRisk(sessionData: any, loginHistory: any[]): 'low' | 'medium' | 'high' {
  let riskScore = 0
  
  // Check session age
  const daysSinceCreated = (Date.now() - new Date(sessionData.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceCreated > 14) riskScore += 20
  
  // Check activity recency
  const daysSinceActive = (Date.now() - new Date(sessionData.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceActive > 7) riskScore += 30
  
  // Check if IP is known
  const knownIps = loginHistory.slice(-20).map((login: any) => login.ipAddress)
  if (!knownIps.includes(sessionData.ipAddress)) {
    riskScore += 25
  }
  
  // Return risk level
  if (riskScore >= 50) return 'high'
  if (riskScore >= 25) return 'medium'
  return 'low'
}
