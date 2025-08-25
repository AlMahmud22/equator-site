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
      // Get user profile
      try {
        const user = await EnhancedUser.findOne({ email: session.user.email })
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          })
        }

        return res.status(200).json({
          success: true,
          message: 'Profile retrieved successfully',
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            displayName: user.displayName || user.name,
            bio: user.bio || '',
            preferences: user.preferences || {
              theme: 'dark',
              notifications: true,
              privacy: {
                showEmail: false,
                showActivity: true
              }
            },
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            loginHistory: user.loginHistory?.slice(-10) || [], // Last 10 logins
            downloadLogs: user.downloadLogs?.slice(-10) || [] // Last 10 downloads
          }
        })
      } catch (error) {
        console.error('Profile fetch error:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch profile'
        })
      }
    }

    if (req.method === 'PUT') {
      // Update user profile
      try {
        const { displayName, bio, preferences } = req.body

        const updateData: any = {}
        
        if (displayName !== undefined) {
          updateData.displayName = displayName.trim()
        }
        
        if (bio !== undefined) {
          updateData.bio = bio.trim()
        }
        
        if (preferences) {
          updateData.preferences = {
            theme: preferences.theme || 'dark',
            notifications: preferences.notifications !== undefined ? preferences.notifications : true,
            privacy: {
              showEmail: preferences.privacy?.showEmail || false,
              showActivity: preferences.privacy?.showActivity !== undefined ? preferences.privacy.showActivity : true
            }
          }
        }

        const user = await EnhancedUser.findOneAndUpdate(
          { email: session.user.email },
          { $set: updateData },
          { new: true }
        )

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          })
        }

        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          data: {
            displayName: user.displayName,
            bio: user.bio,
            preferences: user.preferences
          }
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
      // Delete user account
      try {
        const user = await EnhancedUser.findOne({ email: session.user.email })
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          })
        }

        // Soft delete - mark as deleted but keep data for security logs
        await EnhancedUser.findOneAndUpdate(
          { email: session.user.email },
          {
            $set: {
              isDeleted: true,
              deletedAt: new Date(),
              email: `deleted_${Date.now()}_${user.email}` // Anonymize email
            }
          }
        )

        return res.status(200).json({
          success: true,
          message: 'Account deleted successfully'
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
