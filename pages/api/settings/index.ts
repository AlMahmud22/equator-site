import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import mongoClientPromise from '@/modules/database/mongodb'
import { isAdminEmail } from '@/lib/auth/admin-utils'

interface SettingsData {
  displayName?: string
  bio?: string
  theme?: 'dark' | 'light' | 'system'
  language?: string
  profileVisibility?: 'public' | 'private'
  emailNotifications?: boolean
  securityAlerts?: boolean
  showEmail?: boolean
  showActivity?: boolean
  privacy?: {
    dataCollection?: boolean
    analytics?: boolean
    marketing?: boolean
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    const client = await mongoClientPromise
    const db = client.db('equator')
    const isAdmin = isAdminEmail(session.user.email)

    if (req.method === 'GET') {
      // Get user settings
      const user = await db.collection('users').findOne({ 
        email: session.user.email 
      })
      
      if (!user) {
        // Create user if not exists
        const newUser = {
          email: session.user.email,
          name: session.user.name || '',
          displayName: session.user.name || '',
          image: session.user.image || '',
          provider: 'oauth',
          preferences: {
            theme: 'dark',
            language: 'en',
            profileVisibility: 'public',
            emailNotifications: true,
            securityAlerts: true,
            showEmail: false,
            showActivity: true
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          loginHistory: [],
          downloadLogs: [],
          apiKeys: [],
          sessions: []
        }
        
        await db.collection('users').insertOne(newUser)
        
        const settings = {
          displayName: newUser.name,
          bio: '',
          theme: 'dark',
          language: 'en',
          profileVisibility: 'public',
          emailNotifications: true,
          securityAlerts: true,
          showEmail: false,
          showActivity: true,
          ...(isAdmin && {
            privacy: {
              dataCollection: false,
              analytics: false,
              marketing: false
            }
          })
        }

        return res.status(200).json({
          success: true,
          data: settings
        })
      }

      const settings = {
        displayName: user.name || user.displayName || '',
        bio: user.bio || '',
        theme: user.preferences?.theme || 'dark',
        language: user.preferences?.language || 'en',
        profileVisibility: user.preferences?.profileVisibility || 'public',
        emailNotifications: user.preferences?.emailNotifications !== false,
        securityAlerts: user.preferences?.securityAlerts !== false,
        showEmail: user.preferences?.showEmail || false,
        showActivity: user.preferences?.showActivity !== false,
        ...(isAdmin && {
          privacy: {
            dataCollection: user.preferences?.privacy?.dataCollection || false,
            analytics: user.preferences?.privacy?.analytics || false,
            marketing: user.preferences?.privacy?.marketing || false
          }
        })
      }

      return res.status(200).json({
        success: true,
        data: settings
      })
    }

    if (req.method === 'PATCH' || req.method === 'POST') {
      const updates: SettingsData = req.body
      
      // Build update object with proper nesting
      const updateData: any = {
        updatedAt: new Date()
      }

      // Basic profile updates
      if (updates.displayName !== undefined) {
        updateData.name = updates.displayName
        updateData.displayName = updates.displayName
      }
      if (updates.bio !== undefined) {
        updateData.bio = updates.bio
      }

      // Get current user to merge preferences
      const currentUser = await db.collection('users').findOne({ 
        email: session.user.email 
      })
      
      const currentPreferences = currentUser?.preferences || {}

      // Preferences updates - merge with existing
      const preferences: any = { ...currentPreferences }
      if (updates.theme !== undefined) preferences.theme = updates.theme
      if (updates.language !== undefined) preferences.language = updates.language
      if (updates.profileVisibility !== undefined) preferences.profileVisibility = updates.profileVisibility
      if (updates.emailNotifications !== undefined) preferences.emailNotifications = updates.emailNotifications
      if (updates.securityAlerts !== undefined) preferences.securityAlerts = updates.securityAlerts
      if (updates.showEmail !== undefined) preferences.showEmail = updates.showEmail
      if (updates.showActivity !== undefined) preferences.showActivity = updates.showActivity

      // Admin-only privacy settings
      if (isAdmin && updates.privacy) {
        preferences.privacy = {
          ...(preferences.privacy || {}),
          dataCollection: updates.privacy.dataCollection || false,
          analytics: updates.privacy.analytics || false,
          marketing: updates.privacy.marketing || false
        }
      }

      updateData.preferences = preferences

      // Update user in database with upsert
      const result = await db.collection('users').updateOne(
        { email: session.user.email },
        { $set: updateData },
        { upsert: true }
      )

      console.log(`✅ Settings updated for user: ${session.user.email}`, {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount
      })

      return res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: { updated: true }
      })
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })

  } catch (error) {
    console.error('Settings API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
