import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import connectDB from '@/modules/database/connection'
import EnhancedUser from '@/modules/database/models/EnhancedUser'

interface ProfileUpdateRequest {
  name?: string
  image?: string
  displayName?: string
  bio?: string
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
    const user = await EnhancedUser.findOne({ email: session.user.email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (req.method === 'GET') {
      // Return user profile with download history
      return res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          displayName: user.displayName,
          bio: user.bio,
          provider: user.provider,
          providerId: user.providerId,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          downloadHistory: user.downloadLogs.slice(-20).reverse(), // Last 20 downloads, newest first
          totalDownloads: user.downloadLogs.length,
          preferences: user.preferences
        }
      })
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      // Update user profile
      const updates: ProfileUpdateRequest = req.body

      // Validate updates
      if (updates.name && (updates.name.length < 2 || updates.name.length > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 2 and 100 characters'
        })
      }

      if (updates.bio && updates.bio.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Bio must be less than 500 characters'
        })
      }

      if (updates.image && !isValidImageUrl(updates.image)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image URL'
        })
      }

      // Update user profile
      await user.updateProfile(updates)

      console.log(`👤 Profile updated: ${session.user.email}`)

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          name: user.name,
          image: user.image,
          displayName: user.displayName,
          bio: user.bio
        }
      })
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

function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol) && 
           /\.(jpg|jpeg|png|gif|webp)$/i.test(urlObj.pathname)
  } catch {
    return false
  }
}
