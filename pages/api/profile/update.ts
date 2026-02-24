import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import UnifiedUser from '@/lib/auth/unified-user-model'
import connectDB from '@/modules/database/connection'

interface ProfileUpdateRequest {
  name?: string
  shortName?: string
  bio?: string
  company?: string
  location?: string
  role?: string
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
    const user = await UnifiedUser.findOne({ email: session.user.email })
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
          shortName: user.shortName,
          bio: user.bio,
          company: user.company,
          location: user.location,
          role: user.role,
          provider: user.provider,
          preferences: user.preferences,
          downloadLogs: user.downloadLogs,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    }

    if (req.method === 'POST') {
      // Update user profile
      const { name, shortName, bio, company, location, role }: ProfileUpdateRequest = req.body

      // Validate role if provided
      const validRoles = ['student', 'teacher', 'employer', 'developer', 'other']
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        })
      }

      // Update user fields
      const updates: any = {}
      if (name !== undefined) updates.name = name.trim()
      if (shortName !== undefined) updates.shortName = shortName.trim() || null
      if (bio !== undefined) updates.bio = bio.trim() || null
      if (company !== undefined) updates.company = company.trim() || null
      if (location !== undefined) updates.location = location.trim() || null
      if (role) updates.role = role

      // Apply updates
      Object.assign(user, updates)
      await user.save()

      console.log(`✅ Profile updated for user: ${session.user.email}`)

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          shortName: user.shortName,
          bio: user.bio,
          company: user.company,
          location: user.location,
          role: user.role,
          provider: user.provider
        }
      })
    }

    // Method not allowed
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
