import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import mongoClientPromise from '@/modules/database/mongodb'
import { isAdminEmail } from '@/lib/auth/admin-utils'

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

    const client = await mongoClientPromise
    const db = client.db('equators')

    if (req.method === 'GET') {
      // Get user profile
      try {
        const user = await db.collection('users').findOne({ 
          email: session.user.email 
        })
        
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          })
        }

        // Check if user is admin
        const isAdmin = isAdminEmail(session.user.email)
        
        // Get user statistics
        const stats = {
          totalLogins: user.loginHistory?.length || 0,
          totalDownloads: user.downloadHistory?.length || 0,
          activeSessions: user.sessions?.filter((s: any) => s.isActive).length || 0,
          registeredApps: isAdmin ? await db.collection('registeredApps').countDocuments({ 'contact.email': session.user.email }) : 0,
          apiKeys: isAdmin ? await db.collection('apiKeys').countDocuments({ userId: user._id }) : 0
        }

        // Return enhanced profile data
        const profileData = {
          name: user.name || session.user.name,
          email: user.email,
          image: user.image || session.user.image,
          role: user.role || 'user',
          bio: user.profile?.bio || user.bio,
          location: user.profile?.location || user.location,
          company: user.profile?.company || user.company,
          isActive: user.isActive !== false,
          emailVerified: user.emailVerified || false,
          lastLoginAt: user.lastLoginAt || new Date().toISOString(),
          createdAt: user.createdAt || user._id.getTimestamp().toISOString()
        }

        return res.status(200).json({
          success: true,
          message: 'Profile retrieved successfully',
          data: {
            user: profileData,
            stats: stats
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
        const { name, bio, company, location, preferences } = req.body
        
        // Validation
        const errors: Array<{ field: string; message: string }> = []
        
        if (name && name.length > 100) {
          errors.push({ field: 'name', message: 'Name must be less than 100 characters' })
        }
        
        if (bio && bio.length > 500) {
          errors.push({ field: 'bio', message: 'Bio must be less than 500 characters' })
        }
        
        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
          })
        }

        // Update user
        const updateData: any = {
          updatedAt: new Date()
        }

        if (name !== undefined) updateData.name = name
        if (bio !== undefined) updateData['profile.bio'] = bio
        if (company !== undefined) updateData['profile.company'] = company
        if (location !== undefined) updateData['profile.location'] = location
        if (preferences !== undefined) updateData.preferences = preferences

        const result = await db.collection('users').findOneAndUpdate(
          { email: session.user.email },
          { $set: updateData },
          { returnDocument: 'after' }
        )

        if (!result || !result.value) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          })
        }

        const updatedUser = result.value
        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          data: {
            name: updatedUser.name,
            bio: updatedUser.profile?.bio,
            company: updatedUser.profile?.company,
            location: updatedUser.profile?.location,
            preferences: updatedUser.preferences
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
