import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import UnifiedUser from '@/lib/auth/unified-user-model'
import connectDB from '@/modules/database/connection'

interface SettingsUpdateRequest {
  profile?: {
    displayName?: string
    bio?: string
    company?: string
    location?: string
  }
  privacy?: {
    profileVisibility?: 'public' | 'private'
    showEmail?: boolean
    showActivity?: boolean
  }
  notifications?: {
    emailNotifications?: boolean
    securityAlerts?: boolean
    newsletter?: boolean
  }
  security?: {
    twoFactorEnabled?: boolean
    loginAlerts?: boolean
  }
}

interface ApiResponse {
  success: boolean
  message: string
  data?: any
  errors?: Array<{ field: string; message: string }>
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    await connectDB()

    // Find user
    const user = await UnifiedUser.findOne({ email: session.user.email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (req.method === 'GET') {
      // Return all user settings
      return res.status(200).json({
        success: true,
        message: 'Settings retrieved successfully',
        data: {
          profile: {
            displayName: user.name,
            bio: user.bio || '',
            company: user.company || '',
            location: user.location || ''
          },
          privacy: {
            profileVisibility: user.preferences?.profileVisibility || 'public',
            showEmail: user.preferences?.showEmail !== false,
            showActivity: user.preferences?.showActivity !== false
          },
          notifications: {
            emailNotifications: user.preferences?.notifications !== false,
            securityAlerts: user.preferences?.securityAlerts !== false,
            newsletter: user.preferences?.newsletter !== false
          },
          security: {
            twoFactorEnabled: user.preferences?.twoFactorEnabled || false,
            loginAlerts: user.preferences?.loginAlerts !== false
          }
        }
      })
    }

    if (req.method === 'POST') {
      // Update user settings
      const { profile, privacy, notifications, security }: SettingsUpdateRequest = req.body

      try {
        // Update profile information
        if (profile) {
          if (profile.displayName) user.name = profile.displayName.trim()
          if (profile.bio !== undefined) user.bio = profile.bio.trim() || null
          if (profile.company !== undefined) user.company = profile.company.trim() || null
          if (profile.location !== undefined) user.location = profile.location.trim() || null
        }

        // Update privacy settings
        if (privacy) {
          if (!user.preferences) user.preferences = {}
          if (privacy.profileVisibility) user.preferences.profileVisibility = privacy.profileVisibility
          if (privacy.showEmail !== undefined) user.preferences.showEmail = privacy.showEmail
          if (privacy.showActivity !== undefined) user.preferences.showActivity = privacy.showActivity
        }

        // Update notification settings
        if (notifications) {
          if (!user.preferences) user.preferences = {}
          if (notifications.emailNotifications !== undefined) user.preferences.notifications = notifications.emailNotifications
          if (notifications.securityAlerts !== undefined) user.preferences.securityAlerts = notifications.securityAlerts
          if (notifications.newsletter !== undefined) user.preferences.newsletter = notifications.newsletter
        }

        // Update security settings
        if (security) {
          if (!user.preferences) user.preferences = {}
          if (security.twoFactorEnabled !== undefined) user.preferences.twoFactorEnabled = security.twoFactorEnabled
          if (security.loginAlerts !== undefined) user.preferences.loginAlerts = security.loginAlerts
        }

        // Save changes
        await user.save()

        console.log(`✅ Settings updated for user: ${session.user.email}`)

        return res.status(200).json({
          success: true,
          message: 'Settings updated successfully',
          data: {
            profile: {
              displayName: user.name,
              bio: user.bio || '',
              company: user.company || '',
              location: user.location || ''
            }
          }
        })

      } catch (saveError) {
        console.error('Settings save error:', saveError)
        return res.status(500).json({
          success: false,
          message: 'Failed to save settings',
          errors: [{ field: 'general', message: 'Database save operation failed' }]
        })
      }
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })

  } catch (error) {
    console.error('Settings API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
