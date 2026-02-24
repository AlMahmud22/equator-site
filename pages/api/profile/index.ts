import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import connectDB from '@/modules/database/connection'
import EnhancedUser from '@/modules/database/models/EnhancedUser'

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

    await connectDB()

    if (req.method === 'GET') {
      // Get full profile data
      try {
        const user = await EnhancedUser.findOne({ email: session.user.email })
        
        if (!user) {
          // Create enhanced user record if it doesn't exist
          const newUser = new EnhancedUser({
            name: session.user.name || 'User',
            email: session.user.email,
            image: session.user.image,
            provider: (session as any).provider || 'oauth',
            providerId: (session as any).providerAccountId || session.user.email,
            preferences: {
              theme: 'dark',
              newsletter: false,
              notifications: true,
              privacy: {
                showEmail: false,
                showActivity: true
              }
            },
            loginHistory: [{
              timestamp: new Date(),
              provider: (session as any).provider || 'oauth',
              ipAddress: req.socket.remoteAddress,
              userAgent: req.headers['user-agent']
            }],
            lastLoginAt: new Date()
          })
          
          await newUser.save()
          
          return res.status(200).json({
            success: true,
            message: 'Profile created and retrieved successfully',
            data: {
              user: newUser.toJSON(),
              stats: {
                totalLogins: 1,
                totalDownloads: 0,
                activeSessions: 0,
                apiKeys: 0
              }
            }
          })
        }

        // Update last login
        user.lastLoginAt = new Date()
        
        // Add login history entry
        user.loginHistory.push({
          timestamp: new Date(),
          provider: (session as any).provider || 'oauth',
          ipAddress: req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        })
        
        // Keep only last 50 login entries
        if (user.loginHistory.length > 50) {
          user.loginHistory = user.loginHistory.slice(-50)
        }
        
        await user.save()

        // Calculate stats
        const stats = {
          totalLogins: user.loginHistory.length,
          totalDownloads: user.downloadLogs.length,
          activeSessions: user.sessions.filter((s: any) => s.isActive).length,
          apiKeys: user.apiKeys.filter((k: any) => k.isActive).length
        }

        return res.status(200).json({
          success: true,
          message: 'Profile retrieved successfully',
          data: {
            user: user.toJSON(),
            stats
          }
        })
      } catch (error) {
        console.error('Profile fetch error:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch profile data'
        })
      }
    }

    if (req.method === 'PATCH') {
      // Update profile settings
      try {
        const { displayName, bio, preferences } = req.body

        const user = await EnhancedUser.findOne({ email: session.user.email })
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          })
        }

        // Validate and update fields
        if (displayName !== undefined) {
          if (typeof displayName !== 'string' || displayName.length > 100) {
            return res.status(400).json({
              success: false,
              message: 'Invalid display name',
              errors: [{ field: 'displayName', message: 'Display name must be a string under 100 characters' }]
            })
          }
          user.displayName = displayName.trim()
        }

        if (bio !== undefined) {
          if (typeof bio !== 'string' || bio.length > 500) {
            return res.status(400).json({
              success: false,
              message: 'Invalid bio',
              errors: [{ field: 'bio', message: 'Bio must be a string under 500 characters' }]
            })
          }
          user.bio = bio.trim()
        }

        if (preferences) {
          if (preferences.theme && ['dark', 'light', 'system'].includes(preferences.theme)) {
            user.preferences.theme = preferences.theme
          }
          if (typeof preferences.newsletter === 'boolean') {
            user.preferences.newsletter = preferences.newsletter
          }
          if (typeof preferences.notifications === 'boolean') {
            user.preferences.notifications = preferences.notifications
          }
          if (preferences.privacy) {
            if (typeof preferences.privacy.showEmail === 'boolean') {
              user.preferences.privacy.showEmail = preferences.privacy.showEmail
            }
            if (typeof preferences.privacy.showActivity === 'boolean') {
              user.preferences.privacy.showActivity = preferences.privacy.showActivity
            }
          }
        }

        await user.save()

        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          data: { user: user.toJSON() }
        })
      } catch (error) {
        console.error('Profile update error:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to update profile'
        })
      }
    }

    if (req.method === 'DELETE') {
      // Delete account
      try {
        const user = await EnhancedUser.findOne({ email: session.user.email })
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          })
        }

        // Soft delete - mark as inactive
        user.isActive = false
        await user.save()

        return res.status(200).json({
          success: true,
          message: 'Account deactivated successfully'
        })
      } catch (error) {
        console.error('Account deletion error:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to delete account'
        })
      }
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  } catch (error) {
    console.error('Profile API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
