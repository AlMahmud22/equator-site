import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth, isAdmin } from '@/lib/auth/admin-utils'
import UnifiedUser from '@/lib/auth/unified-user-model'
import connectDB from '@/modules/database/connection'

interface SettingsUpdateRequest {
  profile?: {
    name?: string
    shortName?: string
    bio?: string
    company?: string
    location?: string
    role?: string
  }
  privacy?: {
    profileVisibility?: 'public' | 'private'
    showEmail?: boolean
    showActivity?: boolean
  }
  notifications?: {
    newsletter?: boolean
    notifications?: boolean
    securityAlerts?: boolean
    loginAlerts?: boolean
  }
  security?: {
    twoFactorEnabled?: boolean
  }
  preferences?: {
    theme?: 'light' | 'dark' | 'system'
  }
}

interface ApiResponse {
  success: boolean
  message: string
  data?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const session = await requireAuth(req, res)
    if (!session || !session.user?.email) return

    await connectDB()

    const user = await UnifiedUser.findOne({ email: session.user.email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const userIsAdmin = isAdmin(session.user.email, session.user.name || undefined)

    if (req.method === 'GET') {
      // Return user settings based on role
      const responseData: any = {
        profile: {
          name: user.name,
          shortName: user.shortName,
          bio: user.bio,
          company: user.company,
          location: user.location,
          role: user.role,
          email: user.email,
          image: user.image
        },
        notifications: {
          newsletter: user.preferences.newsletter,
          notifications: user.preferences.notifications,
          securityAlerts: user.preferences.securityAlerts,
          loginAlerts: user.preferences.loginAlerts
        },
        security: {
          twoFactorEnabled: user.preferences.twoFactorEnabled,
          lastLoginAt: user.lastLoginAt,
          loginHistory: user.loginHistory.slice(-10) // Last 10 logins
        },
        preferences: {
          theme: user.preferences.theme
        },
        isAdmin: userIsAdmin
      }

      // Add privacy settings for admins only
      if (userIsAdmin) {
        responseData.privacy = {
          profileVisibility: user.preferences.profileVisibility,
          showEmail: user.preferences.showEmail,
          showActivity: user.preferences.showActivity
        }
        responseData.apiKeys = user.apiKeys.filter((key: any) => key.isActive)
        responseData.sessions = user.sessions.filter((session: any) => session.isActive)
      }

      return res.status(200).json({
        success: true,
        message: 'Settings retrieved successfully',
        data: responseData
      })
    }

    if (req.method === 'PATCH') {
      const updates: SettingsUpdateRequest = req.body

      try {
        // Update profile information
        if (updates.profile) {
          const { name, shortName, bio, company, location, role } = updates.profile
          
          if (name !== undefined) user.name = name.trim()
          if (shortName !== undefined) user.shortName = shortName?.trim() || ''
          if (bio !== undefined) user.bio = bio?.trim() || ''
          if (company !== undefined) user.company = company?.trim() || ''
          if (location !== undefined) user.location = location?.trim() || ''
          
          // Validate role
          if (role !== undefined) {
            const validRoles = ['student', 'teacher', 'employer', 'developer', 'other']
            if (validRoles.includes(role)) {
              user.role = role as any
            }
          }
        }

        // Update privacy settings (admin only)
        if (updates.privacy && userIsAdmin) {
          const { profileVisibility, showEmail, showActivity } = updates.privacy
          
          if (profileVisibility !== undefined) {
            user.preferences.profileVisibility = profileVisibility
          }
          if (showEmail !== undefined) {
            user.preferences.showEmail = showEmail
          }
          if (showActivity !== undefined) {
            user.preferences.showActivity = showActivity
          }
        }

        // Update notification settings
        if (updates.notifications) {
          const { newsletter, notifications, securityAlerts, loginAlerts } = updates.notifications
          
          if (newsletter !== undefined) {
            user.preferences.newsletter = newsletter
          }
          if (notifications !== undefined) {
            user.preferences.notifications = notifications
          }
          if (securityAlerts !== undefined) {
            user.preferences.securityAlerts = securityAlerts
          }
          if (loginAlerts !== undefined) {
            user.preferences.loginAlerts = loginAlerts
          }
        }

        // Update security settings
        if (updates.security) {
          const { twoFactorEnabled } = updates.security
          
          if (twoFactorEnabled !== undefined) {
            user.preferences.twoFactorEnabled = twoFactorEnabled
          }
        }

        // Update preferences
        if (updates.preferences) {
          const { theme } = updates.preferences
          
          if (theme !== undefined) {
            user.preferences.theme = theme
          }
        }

        // Save changes
        user.updatedAt = new Date()
        await user.save()

        return res.status(200).json({
          success: true,
          message: 'Settings updated successfully',
          data: {
            profile: {
              name: user.name,
              shortName: user.shortName,
              bio: user.bio,
              company: user.company,
              location: user.location,
              role: user.role
            }
          }
        })

      } catch (error) {
        console.error('Settings update error:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to update settings'
        })
      }
    }

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
