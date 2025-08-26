import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import mongoClientPromise from '@/modules/database/mongodb'
import { isAdminEmail } from '@/lib/auth/admin-utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      })
    }

    const client = await mongoClientPromise
    const db = client.db('equators')
    
    // Check if user is admin
    const isAdmin = isAdminEmail(session.user.email)
    
    if (req.method === 'GET') {
      // Get user profile data
      const user = await db.collection('users').findOne({ 
        email: session.user.email 
      })
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        })
      }

      // Get user statistics
      const stats = {
        totalLogins: user.loginHistory?.length || 0,
        totalDownloads: user.downloadHistory?.length || 0,
        activeSessions: user.sessions?.filter((s: any) => s.isActive).length || 0,
        registeredApps: isAdmin ? await db.collection('registeredApps').countDocuments({ 'contact.email': session.user.email }) : 0,
        apiKeys: isAdmin ? await db.collection('apiKeys').countDocuments({ userId: user._id }) : 0
      }

      // Return user profile data
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
        data: {
          user: profileData,
          stats: stats
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
